using Lucrai.Core.Enums;

namespace Lucrai.Core.Entities;

public class Debt
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string DisplayId { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string Creditor { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal OutstandingBalance { get; set; }
    public decimal InterestRate { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int InstallmentCount { get; set; }
    public decimal InstallmentValue { get; set; }
    public DebtStatus Status { get; set; } = DebtStatus.Active;
    public DebtType Type { get; set; } = DebtType.Other;
    public string? Notes { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
