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

    public DocumentosController(IDocumentoRepository repo)
    {
        _repo = repo;
    }

    private string Company => HttpContext.Items["Company"] as string ?? "";
    private bool IsSuperAdmin => HttpContext.Items["UserPlan"]?.ToString() == "SuperAdmin";
    private string? QueryCompany => IsSuperAdmin ? null : Company;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var docs = await _repo.GetAllAsync(QueryCompany);
        var result = docs.Select(MapToResponse);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var doc = await _repo.GetByIdAsync(id);
        if (doc == null || (!IsSuperAdmin && doc.Company != Company))
            return NotFound(new { error = "Documento não encontrado" });
        return Ok(MapToResponse(doc));
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats([FromQuery] int mes, [FromQuery] int ano)
    {
        var (total, aguardando, processando, convertidosMes, rejeitadosMes, economia, valorTotal) =
            await _repo.GetStatsAsync(QueryCompany, mes, ano);

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

    private static DocumentoResponse MapToResponse(DocumentoFinanceiro d)
    {
        return new DocumentoResponse(
            d.Id, d.Company, d.UserUploadId, d.NomeArquivoOriginal,
            d.TipoArquivo, d.TamanhoBytes, d.Status,
            d.TipoDocumentoDetectado, d.ValorExtraido, d.DataExtraida,
            d.FavorecidoExtraido, d.EmitenteExtraido, d.DescricaoExtraida,
            d.TipoMovimentacaoSugerido, d.CategoriaSugeridaId,
            d.ConfiancaExtracao, d.ResumoExecutivo, d.LancamentoId,
            d.CriadoEm, d.AtualizadoEm
        );
    }
}
