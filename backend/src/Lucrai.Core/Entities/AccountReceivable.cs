using Lucrai.Core.Enums;

namespace Lucrai.Core.Entities;

public class AccountReceivable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string DisplayId { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string ClientName { get; set; } = string.Empty;
    public string? ClientDocument { get; set; }
    public string? Description { get; set; }
    public decimal Value { get; set; }
    public DateTime IssueDate { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime? ReceivedDate { get; set; }
    public AccountReceivableStatus Status { get; set; } = AccountReceivableStatus.Pending;
    public string? Category { get; set; }
    public string? Notes { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
