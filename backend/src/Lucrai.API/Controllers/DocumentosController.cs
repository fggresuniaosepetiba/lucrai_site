using Lucrai.Core.DTOs.Documentos;
using Lucrai.Core.Entities;
using Lucrai.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lucrai.API.Controllers;

[ApiController]
[Route("api/documentos")]
[Authorize]
public class DocumentosController : ControllerBase
{
    private readonly IDocumentoRepository _repo;
    private readonly IDocumentoLogRepository _logRepo;

    public DocumentosController(IDocumentoRepository repo, IDocumentoLogRepository logRepo)
    {
        _repo = repo;
        _logRepo = logRepo;
    }

    private string Company => HttpContext.Items["Company"] as string ?? "";
    private string UserName => HttpContext.Items["UserName"] as string ?? "";
    private string UserId => HttpContext.Items["UserId"] as string ?? "";

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? status = null)
    {
        var docs = await _repo.GetAllAsync(Company);
        if (!string.IsNullOrEmpty(status))
            docs = docs.Where(d => d.Status == status).ToList();
        var result = docs.Select(MapToResponse);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var doc = await _repo.GetByIdAsync(id);
        if (doc == null || doc.Company != Company)
            return NotFound(new { error = "Documento não encontrado" });
        return Ok(MapToResponse(doc));
    }

    [HttpGet("{id:guid}/download")]
    public async Task<IActionResult> Download(Guid id)
    {
        var doc = await _repo.GetByIdAsync(id);
        if (doc == null || (doc.Company != Company))
            return NotFound(new { error = "Documento não encontrado" });

        if (doc.ArquivoData == null || doc.ArquivoData.Length == 0)
            return NotFound(new { error = "Arquivo não disponível" });

        var contentType = doc.TipoArquivo switch
        {
            "PDF" => "application/pdf",
            "XML" => "application/xml",
            "JPG" or "JPEG" => "image/jpeg",
            "PNG" => "image/png",
            _ => "application/octet-stream"
        };

        return File(doc.ArquivoData, contentType, doc.NomeArquivoOriginal);
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats([FromQuery] int mes, [FromQuery] int ano)
    {
        var (total, aguardando, processando, convertidosMes, rejeitadosMes, economia, valorTotal) =
            await _repo.GetStatsAsync(Company, mes, ano);

        return Ok(new DocumentoStatsResponse(
            total, aguardando, processando, convertidosMes, rejeitadosMes, economia, valorTotal
        ));
    }

    [HttpPost("upload")]
    [RequestSizeLimit(100_000_000)]
    public async Task<IActionResult> Upload([FromForm] List<IFormFile> files)
    {
        if (files == null || files.Count == 0)
            return BadRequest(new { error = "Nenhum arquivo enviado" });

        if (files.Count > 10)
            return BadRequest(new { error = "Máximo de 10 arquivos por vez" });

        var results = new List<DocumentoResponse>();

        foreach (var file in files)
        {
            var ext = Path.GetExtension(file.FileName).ToUpperInvariant();
            var tipoArquivo = ext switch
            {
                ".PDF" => "PDF",
                ".XML" => "XML",
                ".JPG" => "JPG",
                ".JPEG" => "JPEG",
                ".PNG" => "PNG",
                _ => "PDF"
            };

            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);
            var fileBytes = ms.ToArray();

            var hash = Convert.ToHexString(
                System.Security.Cryptography.SHA256.HashData(fileBytes)
            ).ToLowerInvariant();

            var storageName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var storagePath = $"uploads/{Company}/{storageName}";

            var doc = new DocumentoFinanceiro
            {
                Company = Company,
                UserUploadId = HttpContext.Items["UserId"] as string ?? "",
                NomeArquivoOriginal = file.FileName,
                NomeArquivoStorage = storageName,
                PathStorage = storagePath,
                TipoArquivo = tipoArquivo,
                TamanhoBytes = fileBytes.Length,
                HashArquivo = hash,
                Status = "NOVO",
                ArquivoData = fileBytes,
            };

            var created = await _repo.CreateAsync(doc);
            results.Add(MapToResponse(created));
        }

        return Ok(results);
    }

    #region Lixeira

    [HttpGet("trash")]
    public async Task<IActionResult> GetTrash()
    {
        var items = await _repo.GetAllTrashItemsAsync(Company);
        var result = items.Select(t => new DocumentoTrashItemResponse(
            t.Id, t.DocumentoId, t.NomeArquivoOriginal, t.TipoArquivo,
            t.TamanhoBytes, t.StatusOriginal, t.MotivoExclusao, t.ExcluidoPor,
            t.ExcluidoEm, t.ExpiracaoEm
        ));
        return Ok(result);
    }

    [HttpPost("{id:guid}/excluir")]
    public async Task<IActionResult> Excluir(Guid id, [FromBody] ExcluirRequest request)
    {
        var doc = await _repo.GetByIdAsync(id);
        if (doc == null || (doc.Company != Company))
            return NotFound(new { error = "Documento não encontrado" });

        await _repo.MoveToTrashAsync(id, request.Motivo, UserId, UserName);

        await _logRepo.CreateAsync(new DocumentoLog
        {
            DocumentoId = id,
            Company = Company,
            Acao = "EXCLUIDO",
            Descricao = $"Documento movido para lixeira: {request.Motivo}",
            UsuarioId = UserId,
            UsuarioNome = UserName
        });

        return Ok(new { message = "Documento movido para lixeira" });
    }

    [HttpPost("{id:guid}/restaurar")]
    public async Task<IActionResult> Restaurar(Guid id)
    {
        var trashItem = await _repo.GetTrashItemAsync(id);
        if (trashItem == null || (trashItem.Company != Company))
            return NotFound(new { error = "Item não encontrado na lixeira" });

        await _repo.RestoreFromTrashAsync(id);

        await _logRepo.CreateAsync(new DocumentoLog
        {
            DocumentoId = id,
            Company = Company,
            Acao = "RESTAURADO",
            Descricao = "Documento restaurado da lixeira",
            UsuarioId = UserId,
            UsuarioNome = UserName
        });

        return Ok(new { message = "Documento restaurado da lixeira" });
    }

    [HttpDelete("{id:guid}/permanente")]
    public async Task<IActionResult> ExcluirPermanente(Guid id)
    {
        var trashItem = await _repo.GetTrashItemAsync(id);
        if (trashItem == null || (trashItem.Company != Company))
            return NotFound(new { error = "Item não encontrado na lixeira" });

        await _repo.PermanentDeleteAsync(id);

        await _logRepo.CreateAsync(new DocumentoLog
        {
            DocumentoId = id,
            Company = Company,
            Acao = "EXCLUIDO_PERMANENTE",
            Descricao = "Documento excluído permanentemente",
            UsuarioId = UserId,
            UsuarioNome = UserName
        });

        return Ok(new { message = "Documento excluído permanentemente" });
    }

    [HttpPost("trash/cleanup")]
    public async Task<IActionResult> CleanupTrash()
    {
        var removidos = await _repo.CleanupTrashAsync();
        return Ok(new CleanupResponse(removidos));
    }

    #endregion

    #region Conferência

    [HttpPost("{id:guid}/confirmar")]
    public async Task<IActionResult> Confirmar(Guid id, [FromBody] ConfirmarRequest request)
    {
        var doc = await _repo.GetByIdAsync(id);
        if (doc == null || (doc.Company != Company))
            return NotFound(new { error = "Documento não encontrado" });

        if (request.ValorExtraido.HasValue)
            doc.ValorExtraido = request.ValorExtraido;
        if (request.DataExtraida != null)
            doc.DataExtraida = request.DataExtraida;
        if (request.FavorecidoExtraido != null)
            doc.FavorecidoExtraido = request.FavorecidoExtraido;
        if (request.EmitenteExtraido != null)
            doc.EmitenteExtraido = request.EmitenteExtraido;
        if (request.DescricaoExtraida != null)
            doc.DescricaoExtraida = request.DescricaoExtraida;
        if (request.TipoMovimentacaoSugerido != null)
            doc.TipoMovimentacaoSugerido = request.TipoMovimentacaoSugerido;
        if (request.CategoriaSugeridaId != null)
            doc.CategoriaSugeridaId = request.CategoriaSugeridaId;

        doc.Status = "CONVERTIDO";
        doc.UsuarioConferenciaId = UserId;
        doc.DataConferencia = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss");

        await _repo.UpdateAsync(doc);

        await _logRepo.CreateAsync(new DocumentoLog
        {
            DocumentoId = id,
            Company = Company,
            Acao = "CONFIRMADO",
            Descricao = "Documento confirmado e convertido",
            UsuarioId = UserId,
            UsuarioNome = UserName
        });

        return Ok(MapToResponse(doc));
    }

    [HttpPost("{id:guid}/rejeitar")]
    public async Task<IActionResult> Rejeitar(Guid id, [FromBody] RejeitarRequest request)
    {
        var doc = await _repo.GetByIdAsync(id);
        if (doc == null || (doc.Company != Company))
            return NotFound(new { error = "Documento não encontrado" });

        doc.Status = "REJEITADO";
        doc.MotivoRejeicao = request.Motivo;
        doc.UsuarioConferenciaId = UserId;
        doc.DataConferencia = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss");

        await _repo.UpdateAsync(doc);

        await _logRepo.CreateAsync(new DocumentoLog
        {
            DocumentoId = id,
            Company = Company,
            Acao = "REJEITADO",
            Descricao = $"Documento rejeitado: {request.Motivo}",
            UsuarioId = UserId,
            UsuarioNome = UserName
        });

        return Ok(MapToResponse(doc));
    }

    #endregion

    #region Ações

    [HttpPost("{id:guid}/reprocessar")]
    public async Task<IActionResult> Reprocessar(Guid id)
    {
        var doc = await _repo.GetByIdAsync(id);
        if (doc == null || (doc.Company != Company))
            return NotFound(new { error = "Documento não encontrado" });

        doc.Status = "NOVO";
        doc.TentativasProcessamento++;
        doc.UltimoErro = null;
        doc.ConfiancaExtracao = null;
        doc.ResumoExecutivo = null;
        doc.LancamentoId = null;
        doc.AtualizadoEm = DateTime.UtcNow;

        await _repo.UpdateAsync(doc);

        await _logRepo.CreateAsync(new DocumentoLog
        {
            DocumentoId = id,
            Company = Company,
            Acao = "REPROCESSADO",
            Descricao = $"Documento reprocessado (tentativa {doc.TentativasProcessamento})",
            UsuarioId = UserId,
            UsuarioNome = UserName
        });

        return Ok(MapToResponse(doc));
    }

    #endregion

    #region Auditoria

    [HttpGet("{id:guid}/logs")]
    public async Task<IActionResult> GetLogs(Guid id)
    {
        var doc = await _repo.GetByIdAsync(id);
        if (doc == null || (doc.Company != Company))
            return NotFound(new { error = "Documento não encontrado" });

        var logs = await _logRepo.GetByDocumentoAsync(id);
        var result = logs.Select(l => new DocumentoLogResponse(
            l.Id, l.DocumentoId, l.Acao, l.Descricao,
            l.UsuarioNome, l.CriadoEm, l.Detalhes
        ));
        return Ok(result);
    }

    #endregion

    private static DocumentoResponse MapToResponse(DocumentoFinanceiro d)
    {
        return new DocumentoResponse(
            d.Id, d.Company, d.UserUploadId, d.NomeArquivoOriginal,
            d.NomeArquivoStorage, d.PathStorage,
            d.TipoArquivo, d.TamanhoBytes, d.Status,
            d.TipoDocumentoDetectado, d.ValorExtraido, d.DataExtraida,
            d.FavorecidoExtraido, d.EmitenteExtraido, d.DescricaoExtraida,
            d.TipoMovimentacaoSugerido, d.CategoriaSugeridaId,
            d.ConfiancaExtracao, d.DadosExtraidosRaw, d.DadosEstruturados,
            d.ObservacoesIa, d.ResumoExecutivo, d.LancamentoId,
            d.UsuarioConferenciaId, d.DataConferencia, d.MotivoRejeicao,
            d.TentativasProcessamento, d.UltimoErro,
            d.CriadoEm, d.AtualizadoEm
        );
    }
}
