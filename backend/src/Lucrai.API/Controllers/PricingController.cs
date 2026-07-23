using Lucrai.Core.DTOs.Pricing;
using Lucrai.Core.Entities;
using Lucrai.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lucrai.API.Controllers;

[ApiController]
[Route("api/pricing")]
[Authorize]
public class PricingController : ControllerBase
{
    private readonly IPricingRepository _repo;

    public PricingController(IPricingRepository repo)
    {
        _repo = repo;
    }

    private string Company => HttpContext.Items["Company"] as string ?? "";
    private string UserName => HttpContext.Items["UserName"] as string ?? "";

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var products = await _repo.GetAllAsync(Company);
        var result = products.Select(ToResponse);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var p = await _repo.GetByIdAsync(id, Company);
        if (p == null)
            return NotFound(new { error = "Produto não encontrado" });

        return Ok(ToResponse(p));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePricingRequest request)
    {
        var totalCost = request.RawMaterial + request.Packaging + request.Labor + request.Freight + request.OtherCosts;
        var totalFees = request.Taxes + request.CardFee + request.MarketplaceFee + request.Commission + request.OtherFees;
        var basePrice = totalCost / (1 - request.DesiredMargin / 100m);

        var product = new PricingProduct
        {
            Name = request.Name,
            Category = request.Category,
            Sku = request.Sku,
            Description = request.Description,
            RawMaterial = request.RawMaterial,
            Packaging = request.Packaging,
            Labor = request.Labor,
            Freight = request.Freight,
            OtherCosts = request.OtherCosts,
            Taxes = request.Taxes,
            CardFee = request.CardFee,
            MarketplaceFee = request.MarketplaceFee,
            Commission = request.Commission,
            OtherFees = request.OtherFees,
            DesiredMargin = request.DesiredMargin,
            MinPrice = basePrice * 0.9m,
            HealthyPrice = basePrice,
            PremiumPrice = basePrice * 1.2m,
            NetMargin = request.DesiredMargin,
            Company = Company,
            CreatedBy = UserName
        };

        var created = await _repo.CreateAsync(product);
        return Ok(ToResponse(created));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePricingRequest request)
    {
        var existing = await _repo.GetByIdAsync(id, Company);
        if (existing == null)
            return NotFound(new { error = "Produto não encontrado" });

        if (request.Name != null) existing.Name = request.Name;
        if (request.Category != null) existing.Category = request.Category;
        if (request.Sku != null) existing.Sku = request.Sku;
        if (request.Description != null) existing.Description = request.Description;
        if (request.RawMaterial.HasValue) existing.RawMaterial = request.RawMaterial.Value;
        if (request.Packaging.HasValue) existing.Packaging = request.Packaging.Value;
        if (request.Labor.HasValue) existing.Labor = request.Labor.Value;
        if (request.Freight.HasValue) existing.Freight = request.Freight.Value;
        if (request.OtherCosts.HasValue) existing.OtherCosts = request.OtherCosts.Value;
        if (request.Taxes.HasValue) existing.Taxes = request.Taxes.Value;
        if (request.CardFee.HasValue) existing.CardFee = request.CardFee.Value;
        if (request.MarketplaceFee.HasValue) existing.MarketplaceFee = request.MarketplaceFee.Value;
        if (request.Commission.HasValue) existing.Commission = request.Commission.Value;
        if (request.OtherFees.HasValue) existing.OtherFees = request.OtherFees.Value;
        if (request.DesiredMargin.HasValue) existing.DesiredMargin = request.DesiredMargin.Value;

        var totalCost = existing.RawMaterial + existing.Packaging + existing.Labor + existing.Freight + existing.OtherCosts;
        var totalFees = existing.Taxes + existing.CardFee + existing.MarketplaceFee + existing.Commission + existing.OtherFees;
        var basePrice = totalCost / (1 - existing.DesiredMargin / 100m);

        existing.MinPrice = basePrice * 0.9m;
        existing.HealthyPrice = basePrice;
        existing.PremiumPrice = basePrice * 1.2m;
        existing.NetMargin = existing.DesiredMargin;

        var updated = await _repo.UpdateAsync(existing);
        return Ok(ToResponse(updated));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var existing = await _repo.GetByIdAsync(id, Company);
        if (existing == null)
            return NotFound(new { error = "Produto não encontrado" });

        await _repo.DeleteAsync(id, Company);
        return Ok(new { message = "Produto excluído com sucesso" });
    }

    private static PricingResponse ToResponse(PricingProduct p)
    {
        var totalCost = p.RawMaterial + p.Packaging + p.Labor + p.Freight + p.OtherCosts;
        var totalFees = p.Taxes + p.CardFee + p.MarketplaceFee + p.Commission + p.OtherFees;

        return new PricingResponse(
            p.Id, p.Name, p.Category, p.Sku, p.Description,
            p.RawMaterial, p.Packaging, p.Labor, p.Freight, p.OtherCosts, totalCost,
            p.Taxes, p.CardFee, p.MarketplaceFee, p.Commission, p.OtherFees, totalFees,
            p.DesiredMargin, p.MinPrice, p.HealthyPrice, p.PremiumPrice, p.NetMargin,
            p.Company, p.CreatedBy, p.CreatedAt, p.UpdatedAt
        );
    }
}
