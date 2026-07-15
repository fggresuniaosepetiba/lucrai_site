namespace Lucrai.Core.DTOs.Dashboard;

public record DfcResponse(
    string Periodo,
    decimal SaldoInicial,
    decimal FluxoOperacional,
    decimal FluxoInvestimento,
    decimal FluxoFinanciamento,
    decimal VariacaoLiquida,
    decimal SaldoFinal,
    List<DfcItem> Itens
);

public record DfcItem(
    string Descricao,
    decimal Valor,
    string Grupo
);

public record BalanceteResponse(
    int Year,
    int? Month,
    List<BalanceteItem> Itens,
    decimal TotalDebito,
    decimal TotalCredito
);

public record BalanceteItem(
    string Codigo,
    string Conta,
    decimal SaldoAnterior,
    decimal Debito,
    decimal Credito,
    decimal SaldoFinal
);

public record RazaoResponse(
    string ContaCodigo,
    string ContaNome,
    int Year,
    int? Month,
    List<RazaoLancamento> Lancamentos,
    decimal SaldoInicial,
    decimal SaldoFinal
);

public record RazaoLancamento(
    DateTime Data,
    string Descricao,
    string Tipo,
    decimal Valor,
    decimal Saldo
);
