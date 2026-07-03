using Lucrai.Core.Enums;

namespace Lucrai.Core.Entities;

public class CashForecast
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string DisplayId { get; set; } = string.Empty;
    public TransactionType Type { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Category { get; set; } = string.Empty;
    public DateTime ExpectedDate { get; set; }
    public ForecastStatus Status { get; set; } = ForecastStatus.Predicted;
    public string? Notes { get; set; }
    public string Company { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public string? CancelledReason { get; set; }
    public DateTime? CancelledAt { get; set; }
    public string? CancelledBy { get; set; }
    public bool IsRecurring { get; set; }
    public RecurrenceType? RecurrenceType { get; set; }
    public DateTime? RecurrenceEndDate { get; set; }
}
