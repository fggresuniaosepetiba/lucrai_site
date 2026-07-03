namespace Lucrai.Core.DTOs.Audit;

public record AuditResponse(
    Guid Id,
    Guid EntityId,
    string EntityType,
    string DisplayId,
    string Action,
    string Description,
    string User,
    string Company,
    DateTime Timestamp,
    string? Details
);
