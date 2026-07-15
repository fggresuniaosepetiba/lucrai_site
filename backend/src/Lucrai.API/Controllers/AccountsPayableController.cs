using Lucrai.Core.DTOs.AccountsPayable;
using Lucrai.Core.Entities;
using Lucrai.Core.Enums;
using Lucrai.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lucrai.API.Controllers;

[ApiController]
[Route("api/accounts-payable")]
[Authorize]
public class AccountsPayableController : ControllerBase
{
    private readonly IAccountPayableRepository _repo;

    public AccountsPayableController(IAccountPayableRepository repo)
    {
        _repo = repo;
    }

    private string Company => HttpContext.Items["Company"] as string ?? "";

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await _repo.GetAllAsync(Company);
        var result = items.Select(a => new AccountPayableResponse(
            a.Id, a.DisplayId, a.SupplierName, a.SupplierDocument, a.Description,
            a.Value, a.IssueDate, a.DueDate, a.PaymentDate, a.Status.ToString(),
            a.Category, a.Notes, a.Company, a.CreatedBy, a.CreatedAt, a.UpdatedAt
        ));
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var a = await _repo.GetByIdAsync(id, Company);
        if (a == null)
            return NotFound(new { error = "Conta a Pagar não encontrada" });

        return Ok(new AccountPayableResponse(
            a.Id, a.DisplayId, a.SupplierName, a.SupplierDocument, a.Description,
            a.Value, a.IssueDate, a.DueDate, a.PaymentDate, a.Status.ToString(),
            a.Category, a.Notes, a.Company, a.CreatedBy, a.CreatedAt, a.UpdatedAt
        ));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAccountPayableRequest request)
    {
        var payable = new AccountPayable
        {
            SupplierName = request.SupplierName,
            SupplierDocument = request.SupplierDocument,
            Description = request.Description,
            Value = request.Value,
            IssueDate = DateTime.SpecifyKind(request.IssueDate, DateTimeKind.Unspecified),
            DueDate = DateTime.SpecifyKind(request.DueDate, DateTimeKind.Unspecified),
            Category = request.Category,
            Notes = request.Notes,
            Company = Company,
            CreatedBy = HttpContext.Items["UserId"] as string ?? ""
        };

        var created = await _repo.CreateAsync(payable, HttpContext.Items["UserName"] as string);
        return Ok(new AccountPayableResponse(
            created.Id, created.DisplayId, created.SupplierName, created.SupplierDocument, created.Description,
            created.Value, created.IssueDate, created.DueDate, created.PaymentDate, created.Status.ToString(),
            created.Category, created.Notes, created.Company, created.CreatedBy, created.CreatedAt, created.UpdatedAt
        ));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAccountPayableRequest request)
    {
        var existing = await _repo.GetByIdAsync(id, Company);
        if (existing == null)
            return NotFound(new { error = "Conta a Pagar não encontrada" });

        if (!Enum.TryParse<AccountPayableStatus>(request.Status, true, out var status))
            return BadRequest(new { error = "Status inválido. Use: Pending, Paid, Overdue, Cancelled" });

        existing.SupplierName = request.SupplierName;
        existing.SupplierDocument = request.SupplierDocument;
        existing.Description = request.Description;
        existing.Value = request.Value;
        existing.IssueDate = DateTime.SpecifyKind(request.IssueDate, DateTimeKind.Unspecified);
        existing.DueDate = DateTime.SpecifyKind(request.DueDate, DateTimeKind.Unspecified);
        existing.PaymentDate = request.PaymentDate.HasValue
            ? DateTime.SpecifyKind(request.PaymentDate.Value, DateTimeKind.Unspecified)
            : null;
        existing.Status = status;
        existing.Category = request.Category;
        existing.Notes = request.Notes;

        var updated = await _repo.UpdateAsync(existing, HttpContext.Items["UserName"] as string);
        return Ok(new AccountPayableResponse(
            updated.Id, updated.DisplayId, updated.SupplierName, updated.SupplierDocument, updated.Description,
            updated.Value, updated.IssueDate, updated.DueDate, updated.PaymentDate, updated.Status.ToString(),
            updated.Category, updated.Notes, updated.Company, updated.CreatedBy, updated.CreatedAt, updated.UpdatedAt
        ));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var existing = await _repo.GetByIdAsync(id, Company);
        if (existing == null)
            return NotFound(new { error = "Conta a Pagar não encontrada" });

        await _repo.DeleteAsync(id);
        return Ok(new { message = "Conta a Pagar excluída com sucesso" });
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var (totalAPagar, vencido, aVencer30d, aVencer60d, aVencer90d, prazoMedio) =
            await _repo.GetSummaryAsync(Company);

        return Ok(new AccountsPayableSummaryResponse(
            totalAPagar, vencido, aVencer30d, aVencer60d, aVencer90d, prazoMedio,
            (await _repo.GetAllAsync(Company)).Count
        ));
    }
}
