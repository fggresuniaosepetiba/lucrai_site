namespace Lucrai.Core.DTOs.AccountsPayable;

public record CreateAccountPayableRequest(
    string SupplierName,
    string? SupplierDocument,
    string? Description,
    decimal Value,
    DateTime IssueDate,
    DateTime DueDate,
    string? Category,
    string? Notes
);

public record UpdateAccountPayableRequest(
    string SupplierName,
    string? SupplierDocument,
    string? Description,
    decimal Value,
    DateTime IssueDate,
    DateTime DueDate,
    DateTime? PaymentDate,
    string Status,
    string? Category,
    string? Notes
);

public record AccountPayableResponse(
    Guid Id,
    string DisplayId,
    string SupplierName,
    string? SupplierDocument,
    string? Description,
    decimal Value,
    DateTime IssueDate,
    DateTime DueDate,
    DateTime? PaymentDate,
    string Status,
    string? Category,
    string? Notes,
    string Company,
    string CreatedBy,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record AccountsPayableSummaryResponse(
    decimal TotalAPagar,
    decimal Vencido,
    decimal AVencer30d,
    decimal AVencer60d,
    decimal AVencer90d,
    int PrazoMedioPagamento,
    int TotalContas
);
