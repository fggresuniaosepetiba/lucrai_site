using System.Security.Claims;
using System.Text.Json;
using Lucrai.Core.DTOs.Recibos;
using Lucrai.Core.Entities;
using Lucrai.Core.Enums;
using Lucrai.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lucrai.API.Controllers;

[ApiController]
[Route("api/recibos")]
[Authorize]
public class RecibosController : ControllerBase
{
    private readonly IReciboRepository _repo;
    private readonly IAuditRepository _auditRepo;

    public RecibosController(IReciboRepository repo, IAuditRepository auditRepo)
    {
        _repo = repo;
        _auditRepo = auditRepo;
    }

    private string Company => HttpContext.Items["Company"] as string ?? "";
    private string UserName => User.FindFirst(ClaimTypes.Name)?.Value
        ?? User.FindFirst("name")?.Value
        ?? "Sistema";

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var recibos = await _repo.GetAllAsync(Company);
        var result = recibos.Select(MapToResponse);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var r = await _repo.GetByIdAsync(id, Company);
        if (r == null)
            return NotFound(new { error = "Recibo não encontrado" });

        return Ok(MapToResponse(r));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateReciboRequest request)
    {
        if (!Enum.TryParse<ReciboTipo>(request.Tipo, true, out var tipo))
            return BadRequest(new { error = "Tipo de recibo inválido" });
        if (!Enum.TryParse<ReciboOrigem>(request.Origem, true, out var origem))
            return BadRequest(new { error = "Origem do recibo inválida" });

        var recibo = new Recibo
        {
            Company = Company,
            Tipo = tipo,
            Origem = origem,
            Status = ReciboStatus.Emitido,
            Data = request.Data,
            Valor = request.Valor,
            NomePagador = request.NomePagador,
            DocumentoPagador = request.DocumentoPagador,
            SemDocumentoPagador = request.SemDocumentoPagador,
            NomeRecebedor = request.NomeRecebedor,
            DocumentoRecebedor = request.DocumentoRecebedor,
            SemDocumentoRecebedor = request.SemDocumentoRecebedor,
            Referente = request.Referente,
            FormaPagamento = request.FormaPagamento,
            Observacoes = request.Observacoes,
            Telefone = request.Telefone,
            Email = request.Email,
            Cidade = request.Cidade,
            Estado = request.Estado,
            ExibirAssinatura = request.ExibirAssinatura,
            ParcelaAtual = request.ParcelaAtual,
            ParcelasTotal = request.ParcelasTotal,
            LancamentoId = request.LancamentoId,
            CriadoPor = request.CriadoPor,
        };

        var created = await _repo.CreateAsync(recibo);

        await _auditRepo.LogAsync(new AuditLog
        {
            EntityId = created.Id,
            EntityType = "Receipt",
            DisplayId = created.DisplayId,
            Action = AuditAction.Created,
            Description = $"Recibo {created.Numero} criado",
            User = request.CriadoPor,
            Company = Company,
        });

        return Ok(MapToResponse(created));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateReciboRequest request)
    {
        var existing = await _repo.GetByIdAsync(id, Company);
        if (existing == null)
            return NotFound(new { error = "Recibo não encontrado" });

        if (existing.Status == ReciboStatus.Cancelado)
            return BadRequest(new { error = "Não é possível editar um recibo cancelado" });

        if (request.Tipo != null && Enum.TryParse<ReciboTipo>(request.Tipo, true, out var tipo))
            existing.Tipo = tipo;
        if (request.Data != null) existing.Data = request.Data;
        if (request.Valor.HasValue) existing.Valor = request.Valor.Value;
        if (request.NomePagador != null) existing.NomePagador = request.NomePagador;
        if (request.DocumentoPagador != null) existing.DocumentoPagador = request.DocumentoPagador;
        if (request.SemDocumentoPagador.HasValue) existing.SemDocumentoPagador = request.SemDocumentoPagador.Value;
        if (request.NomeRecebedor != null) existing.NomeRecebedor = request.NomeRecebedor;
        if (request.DocumentoRecebedor != null) existing.DocumentoRecebedor = request.DocumentoRecebedor;
        if (request.SemDocumentoRecebedor.HasValue) existing.SemDocumentoRecebedor = request.SemDocumentoRecebedor.Value;
        if (request.Referente != null) existing.Referente = request.Referente;
        if (request.FormaPagamento != null) existing.FormaPagamento = request.FormaPagamento;
        if (request.Observacoes != null) existing.Observacoes = request.Observacoes;
        if (request.Telefone != null) existing.Telefone = request.Telefone;
        if (request.Email != null) existing.Email = request.Email;
        if (request.Cidade != null) existing.Cidade = request.Cidade;
        if (request.Estado != null) existing.Estado = request.Estado;
        if (request.ExibirAssinatura.HasValue) existing.ExibirAssinatura = request.ExibirAssinatura.Value;
        if (request.ParcelaAtual.HasValue) existing.ParcelaAtual = request.ParcelaAtual;
        if (request.ParcelasTotal.HasValue) existing.ParcelasTotal = request.ParcelasTotal;
        if (request.LancamentoId.HasValue) existing.LancamentoId = request.LancamentoId;

        var updated = await _repo.UpdateAsync(existing);

        await _auditRepo.LogAsync(new AuditLog
        {
            EntityId = updated.Id,
            EntityType = "Receipt",
            DisplayId = updated.DisplayId,
            Action = AuditAction.Edited,
            Description = $"Recibo {updated.Numero} editado",
            User = UserName,
            Company = Company,
        });

        return Ok(MapToResponse(updated));
    }

    [HttpPost("{id:guid}/cancelar")]
    public async Task<IActionResult> Cancelar(Guid id, [FromBody] CancelarReciboRequest request)
    {
        var recibo = await _repo.GetByIdAsync(id, Company);
        if (recibo == null)
            return NotFound(new { error = "Recibo não encontrado" });

        if (recibo.Status == ReciboStatus.Cancelado)
            return BadRequest(new { error = "Recibo já está cancelado" });

        var cancelamento = new
        {
            motivo = request.Motivo,
            canceladoEm = DateTime.UtcNow.ToString("o"),
            canceladoPor = UserName
        };

        recibo.Status = ReciboStatus.Cancelado;
        recibo.Cancelamento = JsonSerializer.Serialize(cancelamento);
        recibo.UpdatedAt = DateTime.UtcNow;

        await _repo.UpdateAsync(recibo);

        await _auditRepo.LogAsync(new AuditLog
        {
            EntityId = recibo.Id,
            EntityType = "Receipt",
            DisplayId = recibo.DisplayId,
            Action = AuditAction.Cancelled,
            Description = $"Recibo {recibo.Numero} cancelado: {request.Motivo}",
            User = UserName,
            Company = Company,
        });

        return Ok(new { message = "Recibo cancelado com sucesso" });
    }

    [HttpPost("{id:guid}/audit")]
    public async Task<IActionResult> CreateAudit(Guid id, [FromBody] CreateAuditRequest request)
    {
        var recibo = await _repo.GetByIdAsync(id, Company);
        if (recibo == null)
            return NotFound(new { error = "Recibo não encontrado" });

        if (!Enum.TryParse<AuditAction>(request.Action, true, out var action))
            return BadRequest(new { error = "Ação de auditoria inválida" });

        await _auditRepo.LogAsync(new AuditLog
        {
            EntityId = recibo.Id,
            EntityType = "Receipt",
            DisplayId = recibo.DisplayId,
            Action = action,
            Description = request.Description,
            User = request.User,
            Company = Company,
        });

        return Ok(new { message = "Evento de auditoria registrado" });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var existing = await _repo.GetByIdAsync(id, Company);
        if (existing == null)
            return NotFound(new { error = "Recibo não encontrado" });

        if (existing.Status != ReciboStatus.Cancelado)
            return BadRequest(new { error = "Apenas recibos cancelados podem ser excluídos" });

        await _repo.DeleteAsync(id, Company, UserName);

        await _auditRepo.LogAsync(new AuditLog
        {
            EntityId = existing.Id,
            EntityType = "Receipt",
            DisplayId = existing.DisplayId,
            Action = AuditAction.MovedToTrash,
            Description = $"Recibo {existing.Numero} movido para lixeira",
            User = UserName,
            Company = Company,
        });

        return Ok(new { message = "Recibo movido para lixeira" });
    }

    [HttpGet("trash")]
    public async Task<IActionResult> GetTrash()
    {
        var recibos = await _repo.GetTrashAsync(Company);
        var result = recibos.Select(MapToResponse);
        return Ok(result);
    }

    [HttpPost("{id:guid}/restore")]
    public async Task<IActionResult> Restore(Guid id)
    {
        var recibo = await _repo.GetByIdIncludingDeletedAsync(id, Company);
        if (recibo == null)
            return NotFound(new { error = "Recibo não encontrado" });

        if (recibo.ExcluidoEm == null)
            return BadRequest(new { error = "Recibo não está na lixeira" });

        await _repo.RestoreFromTrashAsync(recibo);

        await _auditRepo.LogAsync(new AuditLog
        {
            EntityId = recibo.Id,
            EntityType = "Receipt",
            DisplayId = recibo.DisplayId,
            Action = AuditAction.Restored,
            Description = $"Recibo {recibo.Numero} restaurado da lixeira",
            User = UserName,
            Company = Company,
        });

        return Ok(new { message = "Recibo restaurado da lixeira" });
    }

    [HttpDelete("{id:guid}/permanent")]
    public async Task<IActionResult> PermanentDelete(Guid id)
    {
        var recibo = await _repo.GetByIdIncludingDeletedAsync(id, Company);
        if (recibo == null)
            return NotFound(new { error = "Recibo não encontrado" });

        if (recibo.ExcluidoEm == null)
            return BadRequest(new { error = "Recibo não está na lixeira" });

        await _repo.PermanentDeleteAsync(recibo);

        await _auditRepo.LogAsync(new AuditLog
        {
            EntityId = recibo.Id,
            EntityType = "Receipt",
            DisplayId = recibo.DisplayId,
            Action = AuditAction.Deleted,
            Description = $"Recibo {recibo.Numero} excluído permanentemente",
            User = UserName,
            Company = Company,
        });

        return Ok(new { message = "Recibo excluído permanentemente" });
    }

    private static ReciboResponse MapToResponse(Recibo r)
    {
        CancelamentoInfo? cancelamento = null;
        if (!string.IsNullOrEmpty(r.Cancelamento))
        {
            cancelamento = JsonSerializer.Deserialize<CancelamentoInfo>(r.Cancelamento);
        }

        return new ReciboResponse(
            r.Id, r.DisplayId, r.Company, r.Numero,
            r.Tipo.ToString(), r.Origem.ToString(), r.Status.ToString(),
            r.Data, r.Valor, r.ValorPorExtenso,
            r.NomePagador, r.DocumentoPagador, r.SemDocumentoPagador,
            r.NomeRecebedor, r.DocumentoRecebedor, r.SemDocumentoRecebedor,
            r.Referente, r.FormaPagamento, r.Observacoes,
            r.Telefone, r.Email, r.Cidade, r.Estado,
            r.ExibirAssinatura, r.ParcelaAtual, r.ParcelasTotal,
            r.LancamentoId, r.CriadoPor, cancelamento,
            r.ExcluidoEm, r.ExcluidoPor, r.ExpiracaoEm,
            r.CreatedAt, r.UpdatedAt
        );
    }
}
