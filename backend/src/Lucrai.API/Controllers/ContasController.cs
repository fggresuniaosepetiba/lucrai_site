using Lucrai.Core.DTOs.Contas;
using Lucrai.Core.Entities;
using Lucrai.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lucrai.API.Controllers;

[ApiController]
[Route("api/contas")]
public class ContasController : ControllerBase
{
    private readonly LucraiDbContext _context;

    public ContasController(LucraiDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Create([FromBody] CreateContaRequest request)
    {
        if (!Enum.TryParse<Core.Enums.PorteEmpresa>(request.Porte, true, out var porte))
            return BadRequest(new { error = "Porte inválido" });

        var registration = new CompanyRegistration
        {
            Nome = request.Nome,
            Email = request.Email,
            Telefone = request.Telefone,
            Senha = request.Senha,
            Empresa = request.Empresa,
            Porte = porte,
            Faturamento = request.Faturamento,
            Origem = request.Origem,
            Plano = request.Plano,
            TrialInicio = DateTime.UtcNow,
            TrialFim = DateTime.UtcNow.AddDays(14),
            PrimeiroAcesso = true
        };

        _context.CompanyRegistrations.Add(registration);
        await _context.SaveChangesAsync();

        return Ok(new ContaResponse(
            registration.Id, registration.Nome, registration.Email,
            registration.Telefone, registration.Empresa, registration.Porte.ToString(),
            registration.Faturamento, registration.Origem, registration.Plano,
            registration.CreatedAt
        ));
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        var registrations = await _context.CompanyRegistrations
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        var result = registrations.Select(r => new ContaResponse(
            r.Id, r.Nome, r.Email, r.Telefone, r.Empresa,
            r.Porte.ToString(), r.Faturamento, r.Origem, r.Plano, r.CreatedAt
        ));

        return Ok(result);
    }
}
