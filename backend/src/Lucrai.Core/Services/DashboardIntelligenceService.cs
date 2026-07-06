using Lucrai.Core.DTOs.Dashboard;
using Lucrai.Core.Enums;
using Lucrai.Core.Interfaces;

namespace Lucrai.Core.Services;

public class DashboardIntelligenceService : IDashboardIntelligenceService
{
    private readonly ITransactionRepository _transactionRepo;
    private readonly ICashForecastRepository _forecastRepo;

    public DashboardIntelligenceService(
        ITransactionRepository transactionRepo,
        ICashForecastRepository forecastRepo)
    {
        _transactionRepo = transactionRepo;
        _forecastRepo = forecastRepo;
    }

    public async Task<ProjectionResponse> CalcularProjecaoAsync(ProjectionRequest request, string? company)
    {
        var transactions = await _transactionRepo.GetAllAsync(company);
        var forecasts = await _forecastRepo.GetAllAsync(company);

        var monthlyData = transactions
            .GroupBy(t => new { t.Date.Year, t.Date.Month })
            .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
            .Select(g => new
            {
                g.Key.Year,
                g.Key.Month,
                Incomes = g.Where(t => t.Type == TransactionType.Income).Sum(t => t.Value),
                Expenses = g.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Value)
            })
            .ToList();

        var realizados = monthlyData.Select(m => new RealizadoPoint(
            $"{m.Year}-{m.Month:D2}", m.Incomes - m.Expenses
        )).ToList();

        var mediaMensal = realizados.Any()
            ? realizados.Average(r => r.Valor)
            : 0;

        var projectedMonths = request.Horizonte;
        var crescimento = request.CrescimentoReceita ?? 0;
        var variacaoCustos = request.VariacaoCustos ?? 0;

        var projetados = new List<ProjetadoPoint>();
        var simSaldo = mediaMensal;

        for (int i = 1; i <= projectedMonths; i++)
        {
            var m = (DateTime.UtcNow.Month + i - 1) % 12 + 1;
            var y = DateTime.UtcNow.Year + (DateTime.UtcNow.Month + i - 1) / 12;
            var label = $"{y}-{m:D2}";

            var receita = mediaMensal * (1 + crescimento / 100 * i / 12);
            var custos = mediaMensal * (1 + variacaoCustos / 100 * i / 12);

            if (request.DespesaPontual.HasValue && request.DespesaPontualMes == i)
                custos += request.DespesaPontual.Value;

            var valor = receita - custos;
            simSaldo += valor;

            projetados.Add(new ProjetadoPoint(
                label, simSaldo, valor,
                valor * 1.15m, valor * 0.85m
            ));
        }

        var totalReceita = transactions.Where(t => t.Type == TransactionType.Income).Sum(t => t.Value);
        var totalCustos = transactions.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Value);

        return new ProjectionResponse(
            totalReceita, totalCustos, totalReceita - totalCustos, simSaldo,
            realizados, projetados, null
        );
    }

    public async Task<RunwayResponse> CalcularRunwayAsync(string? company)
    {
        var (incomes, expenses, balance) = await _transactionRepo.GetAllBalanceAsync(company);

        if (expenses <= 0 || balance <= 0)
            return new RunwayResponse(0, 0, "positive", "Saldo positivo — sem risco de caixa");

        var monthlyBurn = expenses / 12;
        if (monthlyBurn <= 0)
            return new RunwayResponse(0, 0, "stable", "Sem despesas registradas");

        var meses = (int)(balance / monthlyBurn);
        var dias = (int)((balance / monthlyBurn - meses) * 30);

        var status = meses >= 6 ? "healthy" : meses >= 3 ? "warning" : "critical";
        var label = status switch
        {
            "healthy" => $"Caixa suficiente para {meses} meses",
            "warning" => $"Atenção: caixa para apenas {meses} meses",
            "critical" => $"Crítico: caixa para apenas {meses} meses",
            _ => $"{meses} meses de caixa"
        };

        return new RunwayResponse(meses, dias, status, label);
    }

    public async Task<BreakEvenResponse> CalcularBreakEvenAsync(string? company)
    {
        var transactions = await _transactionRepo.GetAllAsync(company);
        var receita = transactions.Where(t => t.Type == TransactionType.Income).Sum(t => t.Value);
        var custos = transactions.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Value);

        if (receita <= 0)
            return new BreakEvenResponse(0, 0, false);

        var percentual = custos > 0 ? (receita - custos) / receita * 100 : 100;
        return new BreakEvenResponse(receita - custos, percentual, receita > custos);
    }

    public async Task<HealthResponse> CalcularSaudeAsync(string? company)
    {
        var transactions = await _transactionRepo.GetAllAsync(company);
        var receita = transactions.Where(t => t.Type == TransactionType.Income).Sum(t => t.Value);
        var custos = transactions.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Value);
        var total = receita + custos;

        var margemScore = total > 0 ? (int)((receita - custos) / total * 100) : 0;
        var diversificacao = transactions.Select(t => t.CategoryId).Distinct().Count();
        var diversificacaoScore = Math.Min(diversificacao * 10, 100);
        var consistencia = receita > custos ? 80 : 30;

        var score = (margemScore + diversificacaoScore + consistencia) / 3;
        score = Math.Clamp(score, 0, 100);

        var (label, cor, bg) = score switch
        {
            >= 80 => ("Saudável", "#22c55e", "#f0fdf4"),
            >= 50 => ("Atenção", "#f59e0b", "#fffbeb"),
            _ => ("Crítico", "#ef4444", "#fef2f2")
        };

        return new HealthResponse(
            score, label, cor, bg,
            new List<SubIndicador>
            {
                new("Margem", margemScore, "Relação receita/despesas"),
                new("Diversificação", diversificacaoScore, $"{diversificacao} categorias com movimento"),
                new("Consistência", consistencia, "Regularidade de resultados")
            }
        );
    }

    public async Task<List<SparklinePoint>> CalcularSparklineAsync(int months, string? company)
    {
        var transactions = await _transactionRepo.GetAllAsync(company);
        var now = DateTime.UtcNow;

        var points = new List<SparklinePoint>();
        for (int i = months - 1; i >= 0; i--)
        {
            var target = now.AddMonths(-i);
            var incomes = transactions
                .Where(t => t.Type == TransactionType.Income
                    && t.Date.Year == target.Year
                    && t.Date.Month == target.Month)
                .Sum(t => t.Value);
            var expenses = transactions
                .Where(t => t.Type == TransactionType.Expense
                    && t.Date.Year == target.Year
                    && t.Date.Month == target.Month)
                .Sum(t => t.Value);
            points.Add(new SparklinePoint(
                $"{target.Year}-{target.Month:D2}",
                incomes - expenses
            ));
        }

        return points;
    }

    public async Task<NotaCFOResponse> GerarNotaCFOAsync(string? company)
    {
        var (incomes, expenses, balance) = await _transactionRepo.GetAllBalanceAsync(company);
        var health = await CalcularSaudeAsync(company);
        var total = incomes + expenses;
        var margem = total > 0 ? (incomes - expenses) / total * 100 : 0;

        var resumo = $"{incomes:C} em receitas, {expenses:C} em despesas, saldo de {balance:C}";
        var nota = $"Sua empresa registrou {resumo}. " +
            $"Margem líquida de {margem:F1}% e saúde financeira avaliada em {health.Score}/100. " +
            (balance > 0
                ? "O saldo positivo indica que as receitas cobrem as despesas atuais."
                : "O saldo negativo requer atenção imediata para reequilibrar as contas.");

        var forca = new List<string>();
        var atencao = new List<string>();

        if (margem >= 30)
            forca.Add($"Margem líquida de {margem:F1}% — excelente resultado");
        else if (margem >= 10)
            forca.Add($"Margem positiva de {margem:F1}%");
        else
            atencao.Add($"Margem apertada de {margem:F1}%");

        if (balance > 0)
            forca.Add("Saldo positivo no período");
        else
            atencao.Add("Saldo negativo — revise despesas urgentemente");

        if (health.Score >= 80)
            forca.Add("Saúde financeira classificada como Saudável");
        else if (health.Score >= 50)
            atencao.Add("Saúde financeira em nível de atenção");
        else
            atencao.Add("Saúde financeira em nível crítico");

        return new NotaCFOResponse(resumo, nota, forca, atencao);
    }

    public async Task<List<AcaoRecomendada>> GerarAcoesRecomendadasAsync(string? company)
    {
        var (incomes, expenses, balance) = await _transactionRepo.GetAllBalanceAsync(company);
        var runway = await CalcularRunwayAsync(company);
        var health = await CalcularSaudeAsync(company);

        var acoes = new List<AcaoRecomendada>();

        if (expenses > incomes * 0.9m)
            acoes.Add(new AcaoRecomendada(
                "Reduzir despesas operacionais",
                "Suas despesas estão consumindo mais de 90% da receita. Identifique cortes possíveis.",
                "alta", "custos", "/transactions?type=expense"
            ));

        if (balance < 0)
            acoes.Add(new AcaoRecomendada(
                "Urgência: saldo negativo",
                "Busque alternativas de capital de giro ou renegocie prazos com fornecedores.",
                "alta", "financeiro", null
            ));

        if (runway.Status == "critical")
            acoes.Add(new AcaoRecomendada(
                "Aumentar reserva de caixa",
                $"Com apenas {runway.Meses} meses de caixa, priorize aumentar a liquidez.",
                "alta", "caixa", null
            ));

        if (runway.Status == "warning")
            acoes.Add(new AcaoRecomendada(
                "Monitorar queima de caixa",
                $"Caixa atual dura {runway.Meses} meses. Acompanhe de perto o fluxo mensal.",
                "media", "caixa", null
            ));

        if (health.Score < 50)
            acoes.Add(new AcaoRecomendada(
                "Melhorar saúde financeira",
                "Diversifique receitas e reduza custos para melhorar o score de saúde financeira.",
                "alta", "geral", null
            ));

        if (incomes > 0 && expenses > 0)
            acoes.Add(new AcaoRecomendada(
                "Revisar precificação",
                "Analise se os preços praticados cobrem todos os custos e geram margem saudável.",
                "media", "precificacao", "/pricing"
            ));

        acoes.Add(new AcaoRecomendada(
            "Revisar previsões futuras",
            "Compare suas previsões de fluxo de caixa com os resultados realizados para ajustar projeções.",
            "baixa", "planejamento", "/forecasts"
        ));

        return acoes;
    }
}
