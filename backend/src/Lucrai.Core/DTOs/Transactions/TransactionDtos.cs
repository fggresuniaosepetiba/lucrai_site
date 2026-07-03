namespace Lucrai.Core.DTOs.Transactions;

public record CreateTransactionRequest(
    string Type,
    decimal Value,
    Guid CategoryId,
    string CategoryName,
    string Description,
    DateTime Date,
    string? Observation
);

public record UpdateTransactionRequest(
    string Type,
    decimal Value,
    Guid CategoryId,
    string CategoryName,
    string Description,
    DateTime Date,
    string? Observation
);

public record TransactionResponse(
    Guid Id,
    string DisplayId,
    string Type,
    decimal Value,
    Guid CategoryId,
    string CategoryName,
    string Description,
    DateTime Date,
    string? Observation,
    string Company,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record TransactionSummaryResponse(
    decimal Incomes,
    decimal Expenses,
    decimal Balance,
    int Count
);

public record YearlySummaryResponse(
    int Year,
    decimal Incomes,
    decimal Expenses,
    decimal Balance,
    decimal Total
);

public record BalanceResponse(
    decimal Incomes,
    decimal Expenses,
    decimal Balance
);
