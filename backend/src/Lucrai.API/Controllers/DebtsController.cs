using Lucrai.Core.DTOs.Debts;
using Lucrai.Core.Entities;
using Lucrai.Core.Enums;
using Lucrai.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lucrai.API.Controllers;

[ApiController]
[Route("api/debts")]
[Authorize]
public class DebtsController : ControllerBase
{
    private readonly IDebtRepository _repo;

    public DebtsController(IDebtRepository repo)
    {
        _repo = repo;
    }

    private string Company => HttpContext.Items["Company"] as string ?? "";

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await _repo.GetAllAsync(Company);
        var result = items.Select(d => new DebtResponse(
            d.Id, d.DisplayId, d.Creditor, d.Description, d.TotalAmount, d.OutstandingBalance,
            d.InterestRate, d.StartDate, d.EndDate, d.InstallmentCount, d.InstallmentValue,
            d.Status.ToString(), d.Type.ToString(), d.Notes, d.Company, d.CreatedBy, d.CreatedAt, d.UpdatedAt
        ));
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var d = await _repo.GetByIdAsync(id, Company);
        if (d == null)
            return NotFound(new { error = "Dívida não encontrada" });

        return Ok(new DebtResponse(
            d.Id, d.DisplayId, d.Creditor, d.Description, d.TotalAmount, d.OutstandingBalance,
            d.InterestRate, d.StartDate, d.EndDate, d.InstallmentCount, d.InstallmentValue,
            d.Status.ToString(), d.Type.ToString(), d.Notes, d.Company, d.CreatedBy, d.CreatedAt, d.UpdatedAt
        ));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateDebtRequest request)
    {
        if (!Enum.TryParse<DebtType>(request.Type, true, out var debtType))
            return BadRequest(new { error = "Tipo inválido. Use: Loan, Financing, CreditCard, Other" });

        var debt = new Debt
        {
            Creditor = request.Creditor,
            Description = request.Description,
            TotalAmount = request.TotalAmount,
            OutstandingBalance = request.OutstandingBalance,
            InterestRate = request.InterestRate,
            StartDate = DateTime.SpecifyKind(request.StartDate, DateTimeKind.Unspecified),
            EndDate = request.EndDate.HasValue ? DateTime.SpecifyKind(request.EndDate.Value, DateTimeKind.Unspecified) : null,
            InstallmentCount = request.InstallmentCount,
            InstallmentValue = request.InstallmentValue,
            Type = debtType,
            Notes = request.Notes,
            Company = Company,
            CreatedBy = HttpContext.Items["UserId"] as string ?? ""
        };

        var created = await _repo.CreateAsync(debt, HttpContext.Items["UserName"] as string);
        return Ok(new DebtResponse(
            created.Id, created.DisplayId, created.Creditor, created.Description, created.TotalAmount, created.OutstandingBalance,
            created.InterestRate, created.StartDate, created.EndDate, created.InstallmentCount, created.InstallmentValue,
            created.Status.ToString(), created.Type.ToString(), created.Notes, created.Company, created.CreatedBy, created.CreatedAt, created.UpdatedAt
        ));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateDebtRequest request)
    {
        var existing = await _repo.GetByIdAsync(id, Company);
        if (existing == null)
            return NotFound(new { error = "Dívida não encontrada" });

        if (!Enum.TryParse<DebtStatus>(request.Status, true, out var status))
            return BadRequest(new { error = "Status inválido. Use: Active, Paid, Renegotiated" });

        if (!Enum.TryParse<DebtType>(request.Type, true, out var debtType))
            return BadRequest(new { error = "Tipo inválido. Use: Loan, Financing, CreditCard, Other" });

        existing.Creditor = request.Creditor;
        existing.Description = request.Description;
        existing.TotalAmount = request.TotalAmount;
        existing.OutstandingBalance = request.OutstandingBalance;
        existing.InterestRate = request.InterestRate;
        existing.StartDate = DateTime.SpecifyKind(request.StartDate, DateTimeKind.Unspecified);
        existing.EndDate = request.EndDate.HasValue ? DateTime.SpecifyKind(request.EndDate.Value, DateTimeKind.Unspecified) : null;
        existing.InstallmentCount = request.InstallmentCount;
        existing.InstallmentValue = request.InstallmentValue;
        existing.Status = status;
        existing.Type = debtType;
        existing.Notes = request.Notes;

        var updated = await _repo.UpdateAsync(existing, HttpContext.Items["UserName"] as string);
        return Ok(new DebtResponse(
            updated.Id, updated.DisplayId, updated.Creditor, updated.Description, updated.TotalAmount, updated.OutstandingBalance,
            updated.InterestRate, updated.StartDate, updated.EndDate, updated.InstallmentCount, updated.InstallmentValue,
            updated.Status.ToString(), updated.Type.ToString(), updated.Notes, updated.Company, updated.CreatedBy, updated.CreatedAt, updated.UpdatedAt
        ));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var existing = await _repo.GetByIdAsync(id, Company);
        if (existing == null)
            return NotFound(new { error = "Dívida não encontrada" });

        await _repo.DeleteAsync(id, Company);
        return Ok(new { message = "Dívida excluída com sucesso" });
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var (dividaTotal, dividaCurtoPrazo, dividaLongoPrazo) = await _repo.GetSummaryAsync(Company);

        var totalAtivo = 0m;
        var receitaAnual = 0m;
        var dividaLiquida = dividaTotal - totalAtivo;
        var alavancagem = receitaAnual > 0 ? dividaTotal / receitaAnual : 0;
        var coberturaJuros = 0m;
        var comprometimento = receitaAnual > 0 ? (dividaTotal / receitaAnual) * 100 : 0;

        return Ok(new DebtSummaryResponse(
            dividaTotal, dividaCurtoPrazo, dividaLongoPrazo, dividaLiquida,
            alavancagem, coberturaJuros, comprometimento, (await _repo.GetAllAsync(Company)).Count
        ));
    }
}
