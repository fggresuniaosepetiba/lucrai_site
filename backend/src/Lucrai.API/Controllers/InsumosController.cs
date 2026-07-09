using Lucrai.Core.DTOs.Insumos;
using Lucrai.Core.Entities;
using Lucrai.Core.Enums;
using Lucrai.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lucrai.API.Controllers;

[ApiController]
[Route("api/insumos")]
[Authorize]
public class InsumosController : ControllerBase
{
    private readonly IInsumoRepository _repo;

    public InsumosController(IInsumoRepository repo)
    {
        _repo = repo;
    }

    private string Company => HttpContext.Items["Company"] as string ?? "";

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var insumos = await _repo.GetAllAsync(Company);
        var result = insumos.Select(i => new InsumoResponse(
            i.Id, i.Nome, i.Categoria, i.UnidadeMedida.ToString(),
            i.QuantidadeComprada, i.ValorPago, i.CustoPorUnidade,
            i.Company, i.CreatedAt, i.UpdatedAt
        ));
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var i = await _repo.GetByIdAsync(id);
        if (i == null || i.Company != Company)
            return NotFound(new { error = "Insumo não encontrado" });

        return Ok(new InsumoResponse(
            i.Id, i.Nome, i.Categoria, i.UnidadeMedida.ToString(),
            i.QuantidadeComprada, i.ValorPago, i.CustoPorUnidade,
            i.Company, i.CreatedAt, i.UpdatedAt
        ));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateInsumoRequest request)
    {
        if (!Enum.TryParse<UnidadeMedida>(request.UnidadeMedida, true, out var unidade))
            return BadRequest(new { error = "Unidade de medida inválida" });

        var custoPorUnidade = request.QuantidadeComprada > 0
            ? request.ValorPago / request.QuantidadeComprada
            : 0;

        var insumo = new Insumo
        {
            Nome = request.Nome,
            Categoria = request.Categoria,
            UnidadeMedida = unidade,
            QuantidadeComprada = request.QuantidadeComprada,
            ValorPago = request.ValorPago,
            CustoPorUnidade = custoPorUnidade,
            Company = Company
        };

        var created = await _repo.CreateAsync(insumo);
        return Ok(new InsumoResponse(
            created.Id, created.Nome, created.Categoria, created.UnidadeMedida.ToString(),
            created.QuantidadeComprada, created.ValorPago, created.CustoPorUnidade,
            created.Company, created.CreatedAt, created.UpdatedAt
        ));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateInsumoRequest request)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing == null || existing.Company != Company)
            return NotFound(new { error = "Insumo não encontrado" });

        if (request.Nome != null) existing.Nome = request.Nome;
        if (request.Categoria != null) existing.Categoria = request.Categoria;
        if (request.UnidadeMedida != null && Enum.TryParse<UnidadeMedida>(request.UnidadeMedida, true, out var unidade))
            existing.UnidadeMedida = unidade;
        if (request.QuantidadeComprada.HasValue) existing.QuantidadeComprada = request.QuantidadeComprada.Value;
        if (request.ValorPago.HasValue) existing.ValorPago = request.ValorPago.Value;

        existing.CustoPorUnidade = existing.QuantidadeComprada > 0
            ? existing.ValorPago / existing.QuantidadeComprada
            : 0;
        existing.UpdatedAt = DateTime.UtcNow;

        var updated = await _repo.UpdateAsync(existing);
        return Ok(new InsumoResponse(
            updated.Id, updated.Nome, updated.Categoria, updated.UnidadeMedida.ToString(),
            updated.QuantidadeComprada, updated.ValorPago, updated.CustoPorUnidade,
            updated.Company, updated.CreatedAt, updated.UpdatedAt
        ));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing == null || existing.Company != Company)
            return NotFound(new { error = "Insumo não encontrado" });

        await _repo.DeleteAsync(id);
        return Ok(new { message = "Insumo excluído com sucesso" });
    }
}
