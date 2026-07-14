namespace Lucrai.Core.DTOs.Forecasts;

public record CreateForecastRequest(
    string Type,
    string Description,
    decimal Amount,
    string Category,
    DateTime ExpectedDate,
    string? Notes,
    bool IsRecurring,
    string? RecurrenceType,
    DateTime? RecurrenceEndDate
);

public record UpdateForecastRequest(
    string? Type,
    string? Description,
    decimal? Amount,
    string? Category,
    DateTime? ExpectedDate,
    string? Notes,
    bool? IsRecurring,
    string? RecurrenceType,
    DateTime? RecurrenceEndDate
);

public record ForecastResponse(
    Guid Id,
    string DisplayId,
    string Type,
    string Description,
    decimal Amount,
    string Category,
    DateTime ExpectedDate,
    string Status,
    string? Notes,
    string Company,
    string CreatedBy,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    string? CancelledReason,
    DateTime? CancelledAt,
    string? CancelledBy,
    bool IsRecurring,
    string? RecurrenceType,
    DateTime? RecurrenceEndDate
);

public record ForecastTotalsResponse(
    decimal PredictedIncomes,
    decimal PredictedExpenses,
    decimal AllIncomes,
    decimal AllExpenses
);

public record MarkActionResponse(
    Guid Id,
    string Status,
    string Message
);
