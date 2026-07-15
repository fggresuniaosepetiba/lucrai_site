namespace Lucrai.Core.DTOs.Debts;

public record CreateDebtRequest(
    string Creditor,
    string? Description,
    decimal TotalAmount,
    decimal OutstandingBalance,
    decimal InterestRate,
    DateTime StartDate,
    DateTime? EndDate,
    int InstallmentCount,
    decimal InstallmentValue,
    string Type,
    string? Notes
);

public record UpdateDebtRequest(
    string Creditor,
    string? Description,
    decimal TotalAmount,
    decimal OutstandingBalance,
    decimal InterestRate,
    DateTime StartDate,
    DateTime? EndDate,
    int InstallmentCount,
    decimal InstallmentValue,
    string Status,
    string Type,
    string? Notes
);

public record DebtResponse(
    Guid Id,
    string DisplayId,
    string Creditor,
    string? Description,
    decimal TotalAmount,
    decimal OutstandingBalance,
    decimal InterestRate,
    DateTime StartDate,
    DateTime? EndDate,
    int InstallmentCount,
    decimal InstallmentValue,
    string Status,
    string Type,
    string? Notes,
    string Company,
    string CreatedBy,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record DebtSummaryResponse(
    decimal DividaTotal,
    decimal DividaCurtoPrazo,
    decimal DividaLongoPrazo,
    decimal DividaLiquida,
    decimal Alavancagem,
    decimal CoberturaJuros,
    decimal ComprometimentoReceita,
    int TotalDividas
);
