using Lucrai.Core.DTOs.Dashboard;
using Lucrai.Core.Entities;
using Lucrai.Core.Enums;
using Lucrai.Core.Interfaces;
using Lucrai.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lucrai.API.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardIntelligenceService _intelligenceService;
    private readonly IAlertasService _alertasService;
    private readonly LucraiDbContext _context;

    public DashboardController(
        IDashboardIntelligenceService intelligenceService,
        IAlertasService alertasService,
        LucraiDbContext context)
    {
        _intelligenceService = intelligenceService;
        _alertasService = alertasService;
        _context = context;
    }

    private string Company => HttpContext.Items["Company"] as string ?? "";
    private string UserName => HttpContext.Items["UserName"] as string ?? "";

    [HttpPost("projection")]
    public async Task<IActionResult> GetProjection([FromBody] ProjectionRequest request)
    {
        var result = await _intelligenceService.CalcularProjecaoAsync(request, Company);
        return Ok(result);
    }

    [HttpGet("runway")]
    public async Task<IActionResult> GetRunway()
    {
        var result = await _intelligenceService.CalcularRunwayAsync(Company);
        return Ok(result);
    }

    [HttpGet("breakeven")]
    public async Task<IActionResult> GetBreakEven()
    {
        var result = await _intelligenceService.CalcularBreakEvenAsync(Company);
        return Ok(result);
    }

    [HttpGet("health")]
    public async Task<IActionResult> GetHealth()
    {
        var result = await _intelligenceService.CalcularSaudeAsync(Company);
        return Ok(result);
    }

    [HttpGet("sparkline")]
    public async Task<IActionResult> GetSparkline([FromQuery] int months = 12)
    {
        months = Math.Clamp(months, 1, 60);
        var result = await _intelligenceService.CalcularSparklineAsync(months, Company);
        return Ok(result);
    }

    [HttpGet("nota-cfo")]
    public async Task<IActionResult> GetNotaCFO()
    {
        var result = await _intelligenceService.GerarNotaCFOAsync(Company);
        return Ok(result);
    }

    [HttpGet("recommended-actions")]
    public async Task<IActionResult> GetRecommendedActions()
    {
        var result = await _intelligenceService.GerarAcoesRecomendadasAsync(Company);
        return Ok(result);
    }

    [HttpGet("alerts")]
    public async Task<IActionResult> GetAlerts()
    {
        var result = await _alertasService.GetAlertsAsync(Company);
        return Ok(result);
    }

    [HttpPost("alerts/{alertId}/dismiss")]
    public async Task<IActionResult> DismissAlert(string alertId)
    {
        await _alertasService.DismissAlertAsync(alertId, Company, UserName);
        return Ok();
    }

    [HttpPost("alerts/{alertId}/restore")]
    public async Task<IActionResult> RestoreAlert(string alertId)
    {
        await _alertasService.RestoreAlertAsync(alertId, Company);
        return Ok();
    }

    [HttpGet("dfc")]
    public async Task<IActionResult> GetDfc([FromQuery] int? year, [FromQuery] int? month)
    {
        var ano = year ?? DateTime.UtcNow.Year;
        var query = _context.Transactions.Where(t => t.Company == Company && t.Date.Year == ano);
        if (month.HasValue)
            query = query.Where(t => t.Date.Month == month.Value);

        var transactions = await query.ToListAsync();

        var fluxoOperacional = transactions
            .Where(t => t.Type == TransactionType.Income)
            .Sum(t => t.Value)
            - transactions.Where(t => t.Type == TransactionType.Expense)
                .Sum(t => t.Value);

        var previousIncomes = await _context.Transactions
            .Where(t => t.Company == Company && t.Date.Year < ano && t.Type == TransactionType.Income)
            .SumAsync(t => (decimal?)t.Value) ?? 0;
        var previousExpenses = await _context.Transactions
            .Where(t => t.Company == Company && t.Date.Year < ano && t.Type == TransactionType.Expense)
            .SumAsync(t => (decimal?)t.Value) ?? 0;
        var saldoInicial = previousIncomes - previousExpenses;

        var saldoFinal = saldoInicial + fluxoOperacional;

        var itens = new List<DfcItem>
        {
            new("Recebimentos", transactions.Where(t => t.Type == TransactionType.Income).Sum(t => t.Value), "operacional"),
            new("Pagamentos", -transactions.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Value), "operacional"),
            new("Fluxo Operacional", fluxoOperacional, "operacional"),
            new("Fluxo de Investimento", 0, "investimento"),
            new("Fluxo de Financiamento", 0, "financiamento"),
        };

        var periodo = $"{ano}{(month.HasValue ? $"/{month.Value:D2}" : "")}";
        return Ok(new DfcResponse(periodo, saldoInicial, fluxoOperacional, 0, 0, fluxoOperacional, saldoFinal, itens));
    }

    [HttpGet("balancete")]
    public async Task<IActionResult> GetBalancete([FromQuery] int? year, [FromQuery] int? month)
    {
        var ano = year ?? DateTime.UtcNow.Year;
        var accounts = await _context.BalanceAccounts
            .Where(a => a.Company == Company && a.Year == ano && (!month.HasValue || a.Month == month || a.Month == null))
            .OrderBy(a => a.Code)
            .ToListAsync();

        var itens = accounts.Select(a =>
        {
            var debito = a.Nature == AccountNature.Asset || a.Nature == AccountNature.Expense ? a.Balance : 0;
            var credito = a.Nature == AccountNature.Liability || a.Nature == AccountNature.Equity || a.Nature == AccountNature.Revenue ? a.Balance : 0;
            return new BalanceteItem(a.Code, a.Name, 0, debito, credito, a.Balance);
        }).ToList();

        return Ok(new BalanceteResponse(ano, month, itens, itens.Sum(i => i.Debito), itens.Sum(i => i.Credito)));
    }

    [HttpGet("razao/{contaCodigo}")]
    public async Task<IActionResult> GetRazao(string contaCodigo, [FromQuery] int? year, [FromQuery] int? month)
    {
        var ano = year ?? DateTime.UtcNow.Year;

        var account = await _context.BalanceAccounts
            .FirstOrDefaultAsync(a => a.Company == Company && a.Code == contaCodigo && a.Year == ano);

        if (account == null)
            return NotFound(new { error = "Conta não encontrada" });

        var transactions = await _context.Transactions
            .Where(t => t.Company == Company && t.Date.Year == ano)
            .Where(t => (!month.HasValue || t.Date.Month == month.Value))
            .OrderBy(t => t.Date)
            .ToListAsync();

        var lancamentos = transactions.Select((t, i) =>
        {
            var saldo = transactions.Take(i + 1).Sum(x => x.Type == TransactionType.Income ? x.Value : -x.Value);
            return new RazaoLancamento(t.Date, t.Description, t.Type.ToString(), t.Value, saldo);
        }).ToList();

        var saldoFinal = transactions.Sum(t => t.Type == TransactionType.Income ? t.Value : -t.Value);

        return Ok(new RazaoResponse(account.Code, account.Name, ano, month, lancamentos, 0, saldoFinal));
    }
}
