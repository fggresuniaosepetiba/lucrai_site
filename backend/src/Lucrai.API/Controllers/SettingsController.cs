using Lucrai.Core.DTOs.Settings;
using Lucrai.Core.Entities;
using Lucrai.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lucrai.API.Controllers;

[ApiController]
[Route("api/settings")]
[Authorize]
public class SettingsController : ControllerBase
{
    private readonly ISettingsRepository _repo;

    public SettingsController(ISettingsRepository repo)
    {
        _repo = repo;
    }

    private string Company => HttpContext.Items["Company"] as string ?? "";
    private bool IsSuperAdmin => HttpContext.Items["UserPlan"]?.ToString() == "SuperAdmin";
    private string? QueryCompany => IsSuperAdmin ? null : Company;

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var settings = await _repo.GetAsync(QueryCompany);
        if (settings == null)
            return NotFound(new { error = "Configurações não encontradas" });

        return Ok(new SettingsResponse(settings.Id, settings.CompanyName, settings.LogoUrl, settings.PrimaryColor, settings.Company));
    }

    [HttpPost]
    public async Task<IActionResult> Save([FromBody] SettingsRequest request)
    {
        var settings = new CompanySettings
        {
            CompanyName = request.CompanyName,
            LogoUrl = request.LogoUrl,
            PrimaryColor = request.PrimaryColor,
            Company = Company
        };

        var saved = await _repo.SaveAsync(settings);
        return Ok(new SettingsResponse(saved.Id, saved.CompanyName, saved.LogoUrl, saved.PrimaryColor, saved.Company));
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] SettingsRequest request)
    {
        var existing = await _repo.GetAsync(QueryCompany);
        if (existing == null)
            return NotFound(new { error = "Configurações não encontradas" });

        existing.CompanyName = request.CompanyName;
        existing.LogoUrl = request.LogoUrl;
        existing.PrimaryColor = request.PrimaryColor;

        var updated = await _repo.UpdateAsync(QueryCompany, existing);
        return Ok(new SettingsResponse(updated.Id, updated.CompanyName, updated.LogoUrl, updated.PrimaryColor, updated.Company));
    }
}
