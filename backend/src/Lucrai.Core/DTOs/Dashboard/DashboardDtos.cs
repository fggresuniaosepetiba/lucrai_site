namespace Lucrai.Core.DTOs.Dashboard;

public record ProjectionRequest(
    int Horizonte,
    decimal? CrescimentoReceita,
    decimal? VariacaoCustos,
    decimal? NovoCustoFixo,
    decimal? DespesaPontual,
    int? DespesaPontualMes
);

public record ProjectionResponse(
    decimal Receita,
    decimal Custos,
    decimal Margem,
    decimal SaldoFinal,
    List<RealizadoPoint> PontosRealizado,
    List<ProjetadoPoint> PontosProjetado,
    List<SimuladoPoint>? PontosSimulados
);

public record RealizadoPoint(string Mes, decimal Valor);

public record ProjetadoPoint(string Mes, decimal Valor, decimal Base, decimal IntervaloSuperior, decimal IntervaloInferior);

public record SimuladoPoint(string Mes, decimal Valor);

public record RunwayResponse(
    int Meses,
    int Dias,
    string Status,
    string Label
);

public record BreakEvenResponse(
    decimal Valor,
    decimal PercentualAtingido,
    bool Acima
);

public record HealthResponse(
    int Score,
    string Label,
    string Cor,
    string Bg,
    List<SubIndicador> SubIndicadores
);

public record SubIndicador(
    string Nome,
    int Score,
    string Tooltip
);

public record AlertResponse(
    string Id,
    string Tipo,
    string Categoria,
    string Titulo,
    string Descricao,
    List<ContextData> DadosContextuais,
    string AcaoLabel,
    string AcaoHref,
    bool Dispensado,
    string GeradoEm
);

public record ContextData(string Label, string Valor);
