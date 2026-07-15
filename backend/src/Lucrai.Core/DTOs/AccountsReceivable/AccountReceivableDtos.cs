namespace Lucrai.Core.DTOs.AccountsReceivable;

public record CreateAccountReceivableRequest(
    string ClientName,
    string? ClientDocument,
    string? Description,
    decimal Value,
    DateTime IssueDate,
    DateTime DueDate,
    string? Category,
    string? Notes
);

public record UpdateAccountReceivableRequest(
    string ClientName,
    string? ClientDocument,
    string? Description,
    decimal Value,
    DateTime IssueDate,
    DateTime DueDate,
    DateTime? ReceivedDate,
    string Status,
    string? Category,
    string? Notes
);

public record AccountReceivableResponse(
    Guid Id,
    string DisplayId,
    string ClientName,
    string? ClientDocument,
    string? Description,
    decimal Value,
    DateTime IssueDate,
    DateTime DueDate,
    DateTime? ReceivedDate,
    string Status,
    string? Category,
    string? Notes,
    string Company,
    string CreatedBy,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record AccountsReceivableSummaryResponse(
    decimal TotalAReceber,
    decimal Vencido,
    decimal AVencer30d,
    decimal AVencer60d,
    decimal AVencer90d,
    decimal Inadimplencia,
    int PrazoMedioRecebimento,
    int TotalContas
);
