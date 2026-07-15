using Lucrai.Core.Enums;

namespace Lucrai.Core.Entities;

public class AccountPayable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string DisplayId { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string SupplierName { get; set; } = string.Empty;
    public string? SupplierDocument { get; set; }
    public string? Description { get; set; }
    public decimal Value { get; set; }
    public DateTime IssueDate { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime? PaymentDate { get; set; }
    public AccountPayableStatus Status { get; set; } = AccountPayableStatus.Pending;
    public string? Category { get; set; }
    public string? Notes { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
