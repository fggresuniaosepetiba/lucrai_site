using Lucrai.Core.DTOs.Forecasts;
using Lucrai.Core.Entities;
using Lucrai.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lucrai.API.Controllers;

[ApiController]
[Route("api/forecasts")]
[Authorize]
public class CashForecastsController : ControllerBase
{
    private readonly ICashForecastRepository _repo;

    public CashForecastsController(ICashForecastRepository repo)
    {
        _repo = repo;
    }

    private string Company => HttpContext.Items["Company"] as string ?? "";
    private string UserName => HttpContext.Items["UserName"] as string ?? "";
    private bool IsSuperAdmin => HttpContext.Items["UserPlan"]?.ToString() == "SuperAdmin";
    private string? QueryCompany => IsSuperAdmin ? null : Company;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var forecasts = await _repo.GetAllAsync(QueryCompany);
        var result = forecasts.Select(f => ToResponse(f));
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var f = await _repo.GetByIdAsync(id);
        if (f == null || (!IsSuperAdmin && f.Company != Company))
            return NotFound(new { error = "Previsão não encontrada" });

        return Ok(ToResponse(f));
    }

    [HttpGet("status/{status}")]
    public async Task<IActionResult> GetByStatus(string status)
    {
        if (!Enum.TryParse<Core.Enums.ForecastStatus>(status, true, out var fStatus))
            return BadRequest(new { error = "Status inválido. Use: Predicted, Received, Paid, Cancelled" });

        var forecasts = await _repo.GetByStatusAsync(fStatus, QueryCompany);
        var result = forecasts.Select(ToResponse);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateForecastRequest request)
    {
        if (!Enum.TryParse<Core.Enums.TransactionType>(request.Type, true, out var tType))
            return BadRequest(new { error = "Tipo inválido. Use 'Income' ou 'Expense'" });

        var forecast = new CashForecast
        {
            Type = tType,
            Description = request.Description,
            Amount = request.Amount,
            Category = request.Category,
            ExpectedDate = request.ExpectedDate,
            Notes = request.Notes,
            IsRecurring = request.IsRecurring,
            Company = Company
        };

        if (request.IsRecurring && request.RecurrenceType != null)
        {
            if (!Enum.TryParse<Core.Enums.RecurrenceType>(request.RecurrenceType, true, out var recType))
                return BadRequest(new { error = "Tipo de recorrência inválido" });
            forecast.RecurrenceType = recType;
            forecast.RecurrenceEndDate = request.RecurrenceEndDate;
        }

        var created = await _repo.CreateAsync(forecast, UserName);
        return Ok(ToResponse(created));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateForecastRequest request)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing == null || (!IsSuperAdmin && existing.Company != Company))
            return NotFound(new { error = "Previsão não encontrada" });

        if (request.Type != null && Enum.TryParse<Core.Enums.TransactionType>(request.Type, true, out var tType))
            existing.Type = tType;
        if (request.Description != null) existing.Description = request.Description;
        if (request.Amount.HasValue) existing.Amount = request.Amount.Value;
        if (request.Category != null) existing.Category = request.Category;
        if (request.ExpectedDate.HasValue) existing.ExpectedDate = request.ExpectedDate.Value;
        if (request.Notes != null) existing.Notes = request.Notes;
        if (request.IsRecurring.HasValue) existing.IsRecurring = request.IsRecurring.Value;
        if (request.RecurrenceType != null && Enum.TryParse<Core.Enums.RecurrenceType>(request.RecurrenceType, true, out var recType))
            existing.RecurrenceType = recType;
        if (request.RecurrenceEndDate.HasValue) existing.RecurrenceEndDate = request.RecurrenceEndDate;

        var updated = await _repo.UpdateAsync(existing, UserName);
        return Ok(ToResponse(updated));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing == null || (!IsSuperAdmin && existing.Company != Company))
            return NotFound(new { error = "Previsão não encontrada" });

        await _repo.DeleteAsync(id);
        return Ok(new { message = "Previsão excluída com sucesso" });
    }

    [HttpPost("{id:guid}/mark-as-received")]
    public async Task<IActionResult> MarkAsReceived(Guid id)
    {
        var f = await _repo.GetByIdAsync(id);
        if (f == null || (!IsSuperAdmin && f.Company != Company))
            return NotFound(new { error = "Previsão não encontrada" });

        var updated = await _repo.MarkAsReceivedAsync(id, UserName);
        return Ok(new MarkActionResponse(updated.Id, updated.Status.ToString(), "Marcada como recebida"));
    }

    [HttpPost("{id:guid}/mark-as-paid")]
    public async Task<IActionResult> MarkAsPaid(Guid id)
    {
        var f = await _repo.GetByIdAsync(id);
        if (f == null || (!IsSuperAdmin && f.Company != Company))
            return NotFound(new { error = "Previsão não encontrada" });

        var updated = await _repo.MarkAsPaidAsync(id, UserName);
        return Ok(new MarkActionResponse(updated.Id, updated.Status.ToString(), "Marcada como paga"));
    }

    [HttpPost("{id:guid}/mark-as-cancelled")]
    public async Task<IActionResult> MarkAsCancelled(Guid id, [FromBody] string reason)
    {
        var f = await _repo.GetByIdAsync(id);
        if (f == null || (!IsSuperAdmin && f.Company != Company))
            return NotFound(new { error = "Previsão não encontrada" });

        var updated = await _repo.MarkAsCancelledAsync(id, reason, UserName);
        return Ok(new MarkActionResponse(updated.Id, updated.Status.ToString(), "Marcada como cancelada"));
    }

    [HttpGet("totals")]
    public async Task<IActionResult> GetTotals()
    {
        var (predictedIncomes, predictedExpenses, allIncomes, allExpenses) = await _repo.GetTotalsAsync(QueryCompany);
        return Ok(new ForecastTotalsResponse(predictedIncomes, predictedExpenses, allIncomes, allExpenses));
    }

    private static ForecastResponse ToResponse(CashForecast f) => new(
        f.Id, f.DisplayId, f.Type.ToString(), f.Description, f.Amount,
        f.Category, f.ExpectedDate, f.Status.ToString(), f.Notes,
        f.Company, f.CreatedAt, f.UpdatedAt, f.CancelledReason,
        f.CancelledAt, f.CancelledBy, f.IsRecurring,
        f.RecurrenceType?.ToString(), f.RecurrenceEndDate
    );
}
