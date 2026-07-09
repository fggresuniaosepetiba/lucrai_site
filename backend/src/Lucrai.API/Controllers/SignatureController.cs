using Lucrai.Core.DTOs.Signature;
using Lucrai.Core.Entities;
using Lucrai.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lucrai.API.Controllers;

[ApiController]
[Route("api/signature")]
[Authorize]
public class SignatureController : ControllerBase
{
    private readonly ISignatureRepository _repo;

    public SignatureController(ISignatureRepository repo)
    {
        _repo = repo;
    }

    private string Company => HttpContext.Items["Company"] as string ?? "";
    private bool IsSuperAdmin => HttpContext.Items["UserPlan"]?.ToString() == "SuperAdmin";
    private string? QueryCompany => IsSuperAdmin ? null : Company;

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var config = await _repo.GetAsync(QueryCompany);
        if (config == null)
            return NotFound(new { error = "Configuração de assinatura não encontrada" });

        return Ok(new SignatureResponse(config.Id, config.ImagemBase64, config.NomeResponsavel, config.Cargo, config.PermitirUso, config.Company));
    }

    [HttpPut]
    public async Task<IActionResult> Save([FromBody] SignatureRequest request)
    {
        var config = new SignatureConfig
        {
            ImagemBase64 = request.ImagemBase64,
            NomeResponsavel = request.NomeResponsavel,
            Cargo = request.Cargo,
            PermitirUso = request.PermitirUso,
            Company = Company
        };

        var saved = await _repo.SaveAsync(config);
        return Ok(new SignatureResponse(saved.Id, saved.ImagemBase64, saved.NomeResponsavel, saved.Cargo, saved.PermitirUso, saved.Company));
    }
}
