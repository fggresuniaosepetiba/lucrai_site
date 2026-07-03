using Lucrai.Core.DTOs.Dashboard;
using Lucrai.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lucrai.API.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly ITransactionRepository _transactionRepo;
    private readonly ICashForecastRepository _forecastRepo;

    public DashboardController(
        ITransactionRepository transactionRepo,
        ICashForecastRepository forecastRepo)
    {
        _transactionRepo = transactionRepo;
        _forecastRepo = forecastRepo;
    }

    private string Company => HttpContext.Items["Company"] as string ?? "";

    [HttpPost("projection")]
    public async Task<IActionResult> GetProjection([FromBody] ProjectionRequest request)
    {
        var currentYear = DateTime.UtcNow.Year;
        var transactions = await _transactionRepo.GetAllAsync(Company);
        var forecasts = await _forecastRepo.GetAllAsync(Company);

        var monthlyData = transactions
            .GroupBy(t => new { t.Date.Year, t.Date.Month })
            .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
            .Select(g => new
            {
                g.Key.Year,
                g.Key.Month,
                Incomes = g.Where(t => t.Type == Core.Enums.TransactionType.Income).Sum(t => t.Value),
                Expenses = g.Where(t => t.Type == Core.Enums.TransactionType.Expense).Sum(t => t.Value)
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

        var totalReceita = transactions.Where(t => t.Type == Core.Enums.TransactionType.Income).Sum(t => t.Value);
        var totalCustos = transactions.Where(t => t.Type == Core.Enums.TransactionType.Expense).Sum(t => t.Value);

        return Ok(new ProjectionResponse(
            totalReceita, totalCustos, totalReceita - totalCustos, simSaldo,
            realizados, projetados, null
        ));
    }

    [HttpGet("runway")]
    public async Task<IActionResult> GetRunway()
    {
        var (incomes, expenses, balance) = await _transactionRepo.GetAllBalanceAsync(Company);

        if (expenses <= 0 || balance <= 0)
            return Ok(new RunwayResponse(0, 0, "positive", "Saldo positivo — sem risco de caixa"));

        var monthlyBurn = expenses / 12;
        if (monthlyBurn <= 0)
            return Ok(new RunwayResponse(0, 0, "stable", "Sem despesas registradas"));

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

        return Ok(new RunwayResponse(meses, dias, status, label));
    }

    [HttpGet("breakeven")]
    public async Task<IActionResult> GetBreakEven()
    {
        var transactions = await _transactionRepo.GetAllAsync(Company);
        var receita = transactions.Where(t => t.Type == Core.Enums.TransactionType.Income).Sum(t => t.Value);
        var custos = transactions.Where(t => t.Type == Core.Enums.TransactionType.Expense).Sum(t => t.Value);

        if (receita <= 0)
            return Ok(new BreakEvenResponse(0, 0, false));

        var percentual = custos > 0 ? (receita - custos) / receita * 100 : 100;
        return Ok(new BreakEvenResponse(receita - custos, percentual, receita > custos));
    }

    [HttpGet("health")]
    public async Task<IActionResult> GetHealth()
    {
        var transactions = await _transactionRepo.GetAllAsync(Company);
        var receita = transactions.Where(t => t.Type == Core.Enums.TransactionType.Income).Sum(t => t.Value);
        var custos = transactions.Where(t => t.Type == Core.Enums.TransactionType.Expense).Sum(t => t.Value);
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

        return Ok(new HealthResponse(
            score, label, cor, bg,
            new List<SubIndicador>
            {
                new("Margem", margemScore, "Relação receita/despesas"),
                new("Diversificação", diversificacaoScore, $"{diversificacao} categorias com movimento"),
                new("Consistência", consistencia, "Regularidade de resultados")
            }
        ));
    }

    [HttpGet("alerts")]
    public async Task<IActionResult> GetAlerts()
    {
        var (incomes, expenses, balance) = await _transactionRepo.GetAllBalanceAsync(Company);
        var forecasts = await _forecastRepo.GetAllAsync(Company);

        var alerts = new List<AlertResponse>();

        if (balance < 0)
        {
            alerts.Add(new AlertResponse(
                Guid.NewGuid().ToString(), "critical", "financeiro",
                "Saldo negativo",
                "Seu saldo está negativo. Reveja suas despesas urgentemente.",
                new List<ContextData> { new("Saldo atual", balance.ToString("C")) },
                "Ver transações", "/transactions", false,
                DateTime.UtcNow.ToString("o")
            ));
        }

        if (expenses > incomes * 0.9m)
        {
            alerts.Add(new AlertResponse(
                Guid.NewGuid().ToString(), "warning", "financeiro",
                "Margem apertada",
                "Suas despesas estão próximas da receita total.",
                new List<ContextData> { new("Receita", incomes.ToString("C")), new("Despesas", expenses.ToString("C")) },
                "Ver relatórios", "/reports", false,
                DateTime.UtcNow.ToString("o")
            ));
        }

        var vencendoHoje = forecasts.Where(f =>
            f.Status == Core.Enums.ForecastStatus.Predicted &&
            f.ExpectedDate.Date <= DateTime.UtcNow.Date);

        foreach (var f in vencendoHoje)
        {
            alerts.Add(new AlertResponse(
                Guid.NewGuid().ToString(), "info", "previsoes",
                "Previsão vencida",
                $"A previsão \"{f.Description}\" de {f.Amount:C} está vencida desde {f.ExpectedDate:dd/MM/yyyy}.",
                new List<ContextData>
                {
                    new("Descrição", f.Description),
                    new("Valor", f.Amount.ToString("C")),
                    new("Vencimento", f.ExpectedDate.ToString("dd/MM/yyyy"))
                },
                "Ver previsões", "/forecasts", false,
                DateTime.UtcNow.ToString("o")
            ));
        }

        return Ok(alerts);
    }
}
