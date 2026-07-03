namespace Lucrai.Core.DTOs.Pricing;

public record CreatePricingRequest(
    string Name,
    string Category,
    string? Sku,
    string? Description,
    decimal RawMaterial,
    decimal Packaging,
    decimal Labor,
    decimal Freight,
    decimal OtherCosts,
    decimal Taxes,
    decimal CardFee,
    decimal MarketplaceFee,
    decimal Commission,
    decimal OtherFees,
    decimal DesiredMargin
);

public record UpdatePricingRequest(
    string? Name,
    string? Category,
    string? Sku,
    string? Description,
    decimal? RawMaterial,
    decimal? Packaging,
    decimal? Labor,
    decimal? Freight,
    decimal? OtherCosts,
    decimal? Taxes,
    decimal? CardFee,
    decimal? MarketplaceFee,
    decimal? Commission,
    decimal? OtherFees,
    decimal? DesiredMargin
);

public record PricingResponse(
    Guid Id,
    string Name,
    string Category,
    string? Sku,
    string? Description,
    decimal RawMaterial,
    decimal Packaging,
    decimal Labor,
    decimal Freight,
    decimal OtherCosts,
    decimal TotalCost,
    decimal Taxes,
    decimal CardFee,
    decimal MarketplaceFee,
    decimal Commission,
    decimal OtherFees,
    decimal TotalFees,
    decimal DesiredMargin,
    decimal MinPrice,
    decimal HealthyPrice,
    decimal PremiumPrice,
    decimal NetMargin,
    string Company,
    string CreatedBy,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
