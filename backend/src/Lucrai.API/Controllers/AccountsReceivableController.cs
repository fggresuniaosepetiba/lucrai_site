using Lucrai.Core.DTOs.AccountsReceivable;
using Lucrai.Core.Entities;
using Lucrai.Core.Enums;
using Lucrai.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lucrai.API.Controllers;

[ApiController]
[Route("api/accounts-receivable")]
[Authorize]
public class AccountsReceivableController : ControllerBase
{
    private readonly IAccountReceivableRepository _repo;

    public AccountsReceivableController(IAccountReceivableRepository repo)
    {
        _repo = repo;
    }

    private string Company => HttpContext.Items["Company"] as string ?? "";

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await _repo.GetAllAsync(Company);
        var result = items.Select(a => new AccountReceivableResponse(
            a.Id, a.DisplayId, a.ClientName, a.ClientDocument, a.Description,
            a.Value, a.IssueDate, a.DueDate, a.ReceivedDate, a.Status.ToString(),
            a.Category, a.Notes, a.Company, a.CreatedBy, a.CreatedAt, a.UpdatedAt
        ));
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var a = await _repo.GetByIdAsync(id, Company);
        if (a == null)
            return NotFound(new { error = "Conta a Receber não encontrada" });

        return Ok(new AccountReceivableResponse(
            a.Id, a.DisplayId, a.ClientName, a.ClientDocument, a.Description,
            a.Value, a.IssueDate, a.DueDate, a.ReceivedDate, a.Status.ToString(),
            a.Category, a.Notes, a.Company, a.CreatedBy, a.CreatedAt, a.UpdatedAt
        ));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAccountReceivableRequest request)
    {
        var receivable = new AccountReceivable
        {
            ClientName = request.ClientName,
            ClientDocument = request.ClientDocument,
            Description = request.Description,
            Value = request.Value,
            IssueDate = DateTime.SpecifyKind(request.IssueDate, DateTimeKind.Unspecified),
            DueDate = DateTime.SpecifyKind(request.DueDate, DateTimeKind.Unspecified),
            Category = request.Category,
            Notes = request.Notes,
            Company = Company,
            CreatedBy = HttpContext.Items["UserId"] as string ?? ""
        };

        var created = await _repo.CreateAsync(receivable, HttpContext.Items["UserName"] as string);
        return Ok(new AccountReceivableResponse(
            created.Id, created.DisplayId, created.ClientName, created.ClientDocument, created.Description,
            created.Value, created.IssueDate, created.DueDate, created.ReceivedDate, created.Status.ToString(),
            created.Category, created.Notes, created.Company, created.CreatedBy, created.CreatedAt, created.UpdatedAt
        ));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAccountReceivableRequest request)
    {
        var existing = await _repo.GetByIdAsync(id, Company);
        if (existing == null)
            return NotFound(new { error = "Conta a Receber não encontrada" });

        if (!Enum.TryParse<AccountReceivableStatus>(request.Status, true, out var status))
            return BadRequest(new { error = "Status inválido. Use: Pending, Received, Overdue, Cancelled" });

        existing.ClientName = request.ClientName;
        existing.ClientDocument = request.ClientDocument;
        existing.Description = request.Description;
        existing.Value = request.Value;
        existing.IssueDate = DateTime.SpecifyKind(request.IssueDate, DateTimeKind.Unspecified);
        existing.DueDate = DateTime.SpecifyKind(request.DueDate, DateTimeKind.Unspecified);
        existing.ReceivedDate = request.ReceivedDate.HasValue
            ? DateTime.SpecifyKind(request.ReceivedDate.Value, DateTimeKind.Unspecified)
            : null;
        existing.Status = status;
        existing.Category = request.Category;
        existing.Notes = request.Notes;

        var updated = await _repo.UpdateAsync(existing, HttpContext.Items["UserName"] as string);
        return Ok(new AccountReceivableResponse(
            updated.Id, updated.DisplayId, updated.ClientName, updated.ClientDocument, updated.Description,
            updated.Value, updated.IssueDate, updated.DueDate, updated.ReceivedDate, updated.Status.ToString(),
            updated.Category, updated.Notes, updated.Company, updated.CreatedBy, updated.CreatedAt, updated.UpdatedAt
        ));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var existing = await _repo.GetByIdAsync(id, Company);
        if (existing == null)
            return NotFound(new { error = "Conta a Receber não encontrada" });

        await _repo.DeleteAsync(id);
        return Ok(new { message = "Conta a Receber excluída com sucesso" });
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var (totalAReceber, vencido, aVencer30d, aVencer60d, aVencer90d, inadimplencia, prazoMedio) =
            await _repo.GetSummaryAsync(Company);

        var totalContas = (await _repo.GetAllAsync(Company)).Count;
        return Ok(new AccountsReceivableSummaryResponse(
            totalAReceber, vencido, aVencer30d, aVencer60d, aVencer90d, inadimplencia, prazoMedio,
            totalContas
        ));
    }
}
