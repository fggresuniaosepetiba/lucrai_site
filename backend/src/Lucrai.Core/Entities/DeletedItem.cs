using Lucrai.Core.Enums;

namespace Lucrai.Core.Entities;

public class DeletedItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OriginalId { get; set; }
    public string DisplayId { get; set; } = string.Empty;
    public EntryType EntryType { get; set; }
    public TransactionType Type { get; set; }
    public decimal? Value { get; set; }
    public Guid? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime? Date { get; set; }
    public string? Observation { get; set; }
    public decimal? Amount { get; set; }
    public string? Category { get; set; }
    public DateTime? ExpectedDate { get; set; }
    public string? Notes { get; set; }
    public ForecastStatus? Status { get; set; }
    public string? CancelledReason { get; set; }
    public DateTime? CancelledAt { get; set; }
    public string? CancelledBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public string Company { get; set; } = string.Empty;
    public DateTime DeletedAt { get; set; } = DateTime.UtcNow;
    public string Reason { get; set; } = string.Empty;
    public DateTime RestoreUntil { get; set; }
}
