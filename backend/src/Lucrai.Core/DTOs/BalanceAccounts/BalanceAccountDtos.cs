namespace Lucrai.Core.DTOs.BalanceAccounts;

public record CreateBalanceAccountRequest(
    string Code,
    string Name,
    string Nature,
    decimal Balance,
    int Year,
    int? Month,
    string? Notes
);

public record UpdateBalanceAccountRequest(
    string Code,
    string Name,
    string Nature,
    decimal Balance,
    string? Notes
);

public record BalanceAccountResponse(
    Guid Id,
    string Code,
    string Name,
    string Nature,
    decimal Balance,
    int Year,
    int? Month,
    string? Notes,
    string Company,
    string CreatedBy,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record BalanceSheetResponse(
    int Year,
    int? Month,
    List<BalanceAccountGroup> Ativo,
    List<BalanceAccountGroup> Passivo,
    List<BalanceAccountGroup> PatrimonioLiquido,
    decimal TotalAtivo,
    decimal TotalPassivo,
    decimal TotalPatrimonioLiquido
);

public record BalanceAccountGroup(
    string Nome,
    decimal Valor,
    List<BalanceAccountItem> Contas
);

public record BalanceAccountItem(
    string Codigo,
    string Nome,
    decimal Saldo
);
