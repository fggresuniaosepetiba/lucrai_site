namespace Lucrai.Core.Entities;

public class PricingProduct
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? Sku { get; set; }
    public string? Description { get; set; }
    public decimal RawMaterial { get; set; }
    public decimal Packaging { get; set; }
    public decimal Labor { get; set; }
    public decimal Freight { get; set; }
    public decimal OtherCosts { get; set; }
    public decimal Taxes { get; set; }
    public decimal CardFee { get; set; }
    public decimal MarketplaceFee { get; set; }
    public decimal Commission { get; set; }
    public decimal OtherFees { get; set; }
    public decimal DesiredMargin { get; set; }
    public decimal MinPrice { get; set; }
    public decimal HealthyPrice { get; set; }
    public decimal PremiumPrice { get; set; }
    public decimal NetMargin { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public string Company { get; set; } = string.Empty;
    public string CreatedBy { get; set; } = string.Empty;
}
