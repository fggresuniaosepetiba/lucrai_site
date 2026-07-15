using Lucrai.Core.Enums;

namespace Lucrai.Core.Entities;

public class Investment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string DisplayId { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public InvestmentType Type { get; set; } = InvestmentType.Other;
    public decimal InvestedAmount { get; set; }
    public decimal? CurrentValue { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public decimal? ExpectedROI { get; set; }
    public decimal? ActualROI { get; set; }
    public decimal? IRR { get; set; }
    public decimal? NPV { get; set; }
    public int? PaybackMonths { get; set; }
    public InvestmentStatus Status { get; set; } = InvestmentStatus.Active;
    public string? Notes { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
