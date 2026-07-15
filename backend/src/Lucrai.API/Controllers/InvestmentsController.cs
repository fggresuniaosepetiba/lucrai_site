using Lucrai.Core.DTOs.Investments;
using Lucrai.Core.Entities;
using Lucrai.Core.Enums;
using Lucrai.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lucrai.API.Controllers;

[ApiController]
[Route("api/investments")]
[Authorize]
public class InvestmentsController : ControllerBase
{
    private readonly IInvestmentRepository _repo;

    public InvestmentsController(IInvestmentRepository repo)
    {
        _repo = repo;
    }

    private string Company => HttpContext.Items["Company"] as string ?? "";

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await _repo.GetAllAsync(Company);
        var result = items.Select(i => new InvestmentResponse(
            i.Id, i.DisplayId, i.Name, i.Description, i.Type.ToString(),
            i.InvestedAmount, i.CurrentValue, i.StartDate, i.EndDate,
            i.ExpectedROI, i.ActualROI, i.IRR, i.NPV, i.PaybackMonths,
            i.Status.ToString(), i.Notes, i.Company, i.CreatedBy, i.CreatedAt, i.UpdatedAt
        ));
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var i = await _repo.GetByIdAsync(id, Company);
        if (i == null)
            return NotFound(new { error = "Investimento não encontrado" });

        return Ok(new InvestmentResponse(
            i.Id, i.DisplayId, i.Name, i.Description, i.Type.ToString(),
            i.InvestedAmount, i.CurrentValue, i.StartDate, i.EndDate,
            i.ExpectedROI, i.ActualROI, i.IRR, i.NPV, i.PaybackMonths,
            i.Status.ToString(), i.Notes, i.Company, i.CreatedBy, i.CreatedAt, i.UpdatedAt
        ));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateInvestmentRequest request)
    {
        if (!Enum.TryParse<InvestmentType>(request.Type, true, out var invType))
            return BadRequest(new { error = "Tipo inválido. Use: CAPEX, Project, Financial, Other" });

        var investment = new Investment
        {
            Name = request.Name,
            Description = request.Description,
            Type = invType,
            InvestedAmount = request.InvestedAmount,
            CurrentValue = request.CurrentValue,
            StartDate = DateTime.SpecifyKind(request.StartDate, DateTimeKind.Unspecified),
            EndDate = request.EndDate.HasValue ? DateTime.SpecifyKind(request.EndDate.Value, DateTimeKind.Unspecified) : null,
            ExpectedROI = request.ExpectedROI,
            ActualROI = request.ActualROI,
            IRR = request.IRR,
            NPV = request.NPV,
            PaybackMonths = request.PaybackMonths,
            Notes = request.Notes,
            Company = Company,
            CreatedBy = HttpContext.Items["UserId"] as string ?? ""
        };

        var created = await _repo.CreateAsync(investment, HttpContext.Items["UserName"] as string);
        return Ok(new InvestmentResponse(
            created.Id, created.DisplayId, created.Name, created.Description, created.Type.ToString(),
            created.InvestedAmount, created.CurrentValue, created.StartDate, created.EndDate,
            created.ExpectedROI, created.ActualROI, created.IRR, created.NPV, created.PaybackMonths,
            created.Status.ToString(), created.Notes, created.Company, created.CreatedBy, created.CreatedAt, created.UpdatedAt
        ));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateInvestmentRequest request)
    {
        var existing = await _repo.GetByIdAsync(id, Company);
        if (existing == null)
            return NotFound(new { error = "Investimento não encontrado" });

        if (!Enum.TryParse<InvestmentType>(request.Type, true, out var invType))
            return BadRequest(new { error = "Tipo inválido. Use: CAPEX, Project, Financial, Other" });

        if (!Enum.TryParse<InvestmentStatus>(request.Status, true, out var status))
            return BadRequest(new { error = "Status inválido. Use: Active, Completed, Cancelled" });

        existing.Name = request.Name;
        existing.Description = request.Description;
        existing.Type = invType;
        existing.InvestedAmount = request.InvestedAmount;
        existing.CurrentValue = request.CurrentValue;
        existing.StartDate = DateTime.SpecifyKind(request.StartDate, DateTimeKind.Unspecified);
        existing.EndDate = request.EndDate.HasValue ? DateTime.SpecifyKind(request.EndDate.Value, DateTimeKind.Unspecified) : null;
        existing.ExpectedROI = request.ExpectedROI;
        existing.ActualROI = request.ActualROI;
        existing.IRR = request.IRR;
        existing.NPV = request.NPV;
        existing.PaybackMonths = request.PaybackMonths;
        existing.Status = status;
        existing.Notes = request.Notes;

        var updated = await _repo.UpdateAsync(existing, HttpContext.Items["UserName"] as string);
        return Ok(new InvestmentResponse(
            updated.Id, updated.DisplayId, updated.Name, updated.Description, updated.Type.ToString(),
            updated.InvestedAmount, updated.CurrentValue, updated.StartDate, updated.EndDate,
            updated.ExpectedROI, updated.ActualROI, updated.IRR, updated.NPV, updated.PaybackMonths,
            updated.Status.ToString(), updated.Notes, updated.Company, updated.CreatedBy, updated.CreatedAt, updated.UpdatedAt
        ));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var existing = await _repo.GetByIdAsync(id, Company);
        if (existing == null)
            return NotFound(new { error = "Investimento não encontrado" });

        await _repo.DeleteAsync(id);
        return Ok(new { message = "Investimento excluído com sucesso" });
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var (totalInvestido, projetosAtivos, roiMedio) = await _repo.GetSummaryAsync(Company);
        var capEx = (await _repo.GetAllAsync(Company))
            .Where(i => i.Type == InvestmentType.CAPEX)
            .Sum(i => i.InvestedAmount);

        return Ok(new InvestmentSummaryResponse(totalInvestido, projetosAtivos, roiMedio, capEx));
    }
}
