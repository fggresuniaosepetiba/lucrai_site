namespace Lucrai.Core.DTOs.Trash;

public record TrashResponse(
    Guid Id,
    Guid OriginalId,
    string DisplayId,
    string EntryType,
    string Type,
    decimal? Value,
    string? CategoryName,
    string Description,
    DateTime? Date,
    decimal? Amount,
    string? Category,
    DateTime? ExpectedDate,
    string? Status,
    string Company,
    string CreatedBy,
    DateTime DeletedAt,
    string Reason,
    DateTime RestoreUntil
);

public record RestoreResponse(
    Guid Id,
    string Message
);

public record CleanupResponse(
    int RemovedCount
);
