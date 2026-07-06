using Lucrai.Core.DTOs.Dashboard;
using Lucrai.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lucrai.API.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardIntelligenceService _intelligenceService;
    private readonly IAlertasService _alertasService;

    public DashboardController(
        IDashboardIntelligenceService intelligenceService,
        IAlertasService alertasService)
    {
        _intelligenceService = intelligenceService;
        _alertasService = alertasService;
    }

    private string Company => HttpContext.Items["Company"] as string ?? "";
    private string UserName => HttpContext.Items["UserName"] as string ?? "";
    private bool IsSuperAdmin => HttpContext.Items["UserPlan"]?.ToString() == "SuperAdmin";
    private string? QueryCompany => IsSuperAdmin ? null : Company;

    [HttpPost("projection")]
    public async Task<IActionResult> GetProjection([FromBody] ProjectionRequest request)
    {
        var result = await _intelligenceService.CalcularProjecaoAsync(request, QueryCompany);
        return Ok(result);
    }

    [HttpGet("runway")]
    public async Task<IActionResult> GetRunway()
    {
        var result = await _intelligenceService.CalcularRunwayAsync(QueryCompany);
        return Ok(result);
    }

    [HttpGet("breakeven")]
    public async Task<IActionResult> GetBreakEven()
    {
        var result = await _intelligenceService.CalcularBreakEvenAsync(QueryCompany);
        return Ok(result);
    }

    [HttpGet("health")]
    public async Task<IActionResult> GetHealth()
    {
        var result = await _intelligenceService.CalcularSaudeAsync(QueryCompany);
        return Ok(result);
    }

    [HttpGet("sparkline")]
    public async Task<IActionResult> GetSparkline([FromQuery] int months = 12)
    {
        months = Math.Clamp(months, 1, 60);
        var result = await _intelligenceService.CalcularSparklineAsync(months, QueryCompany);
        return Ok(result);
    }

    [HttpGet("nota-cfo")]
    public async Task<IActionResult> GetNotaCFO()
    {
        var result = await _intelligenceService.GerarNotaCFOAsync(QueryCompany);
        return Ok(result);
    }

    [HttpGet("recommended-actions")]
    public async Task<IActionResult> GetRecommendedActions()
    {
        var result = await _intelligenceService.GerarAcoesRecomendadasAsync(QueryCompany);
        return Ok(result);
    }

    [HttpGet("alerts")]
    public async Task<IActionResult> GetAlerts()
    {
        var result = await _alertasService.GetAlertsAsync(QueryCompany);
        return Ok(result);
    }

    [HttpPost("alerts/{alertId}/dismiss")]
    public async Task<IActionResult> DismissAlert(string alertId)
    {
        await _alertasService.DismissAlertAsync(alertId, QueryCompany, UserName);
        return Ok();
    }

    [HttpPost("alerts/{alertId}/restore")]
    public async Task<IActionResult> RestoreAlert(string alertId)
    {
        await _alertasService.RestoreAlertAsync(alertId, QueryCompany);
        return Ok();
    }
}
