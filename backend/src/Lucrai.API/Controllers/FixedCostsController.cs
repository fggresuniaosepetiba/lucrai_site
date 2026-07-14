using Lucrai.Core.DTOs.FixedCosts;
using Lucrai.Core.Entities;
using Lucrai.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lucrai.API.Controllers;

[ApiController]
[Route("api/fixed-costs")]
[Authorize]
public class FixedCostsController : ControllerBase
{
    private readonly IFixedCostRepository _repo;

    public FixedCostsController(IFixedCostRepository repo)
    {
        _repo = repo;
    }

    private string Company => HttpContext.Items["Company"] as string ?? "";

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var data = await _repo.GetAsync(Company);
        if (data == null)
            return NotFound(new { error = "Custos fixos não encontrados" });

        var customCosts = FixedCostRequest.DeserializeCustomCosts(data.CustomCosts);
        return Ok(new FixedCostResponse(
            data.Id, data.Aluguel, data.Energia, data.Agua, data.Internet,
            data.Contador, data.ProLabore, data.Softwares, data.Telefone,
            data.Marketing, data.Limpeza, data.Outros, customCosts,
            data.Total, data.CreatedAt, data.UpdatedAt, data.Company
        ));
    }

    [HttpPut]
    public async Task<IActionResult> Save([FromBody] FixedCostRequest request)
    {
        var entity = new FixedCost
        {
            Company = Company,
            Aluguel = request.Aluguel,
            Energia = request.Energia,
            Agua = request.Agua,
            Internet = request.Internet,
            Contador = request.Contador,
            ProLabore = request.ProLabore,
            Softwares = request.Softwares,
            Telefone = request.Telefone,
            Marketing = request.Marketing,
            Limpeza = request.Limpeza,
            Outros = request.Outros,
            CustomCosts = request.SerializeCustomCosts(),
            Total = request.CalculateTotal()
        };

        var saved = await _repo.SaveAsync(entity);
        var customCosts = FixedCostRequest.DeserializeCustomCosts(saved.CustomCosts);
        return Ok(new FixedCostResponse(
            saved.Id, saved.Aluguel, saved.Energia, saved.Agua, saved.Internet,
            saved.Contador, saved.ProLabore, saved.Softwares, saved.Telefone,
            saved.Marketing, saved.Limpeza, saved.Outros, customCosts,
            saved.Total, saved.CreatedAt, saved.UpdatedAt, saved.Company
        ));
    }
}
