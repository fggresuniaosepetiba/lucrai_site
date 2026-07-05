using Lucrai.Core.DTOs.Dashboard;
using Lucrai.Core.Enums;
using Lucrai.Core.Interfaces;

namespace Lucrai.Core.Services;

public class AlertasService : IAlertasService
{
    private readonly ITransactionRepository _transactionRepo;
    private readonly ICashForecastRepository _forecastRepo;
    private readonly IDismissedAlertRepository _dismissedRepo;

    public AlertasService(
        ITransactionRepository transactionRepo,
        ICashForecastRepository forecastRepo,
        IDismissedAlertRepository dismissedRepo)
    {
        _transactionRepo = transactionRepo;
        _forecastRepo = forecastRepo;
        _dismissedRepo = dismissedRepo;
    }

    public async Task<List<AlertResponse>> GetAlertsAsync(string company)
    {
        var transactions = await _transactionRepo.GetAllAsync(company);
        var forecasts = await _forecastRepo.GetAllAsync(company);
        var (incomes, expenses, balance) = await _transactionRepo.GetAllBalanceAsync(company);
        var dismissed = await _dismissedRepo.GetDismissedIdsAsync(company);

        var alerts = new List<AlertResponse>();
        var now = DateTime.UtcNow;

        // 1. Fluxo de caixa negativo
        if (balance < 0)
            alerts.Add(CriarAlerta("negative-balance", "critical", "financeiro",
                "Saldo negativo",
                "Seu saldo está negativo. Reveja suas despesas urgentemente.",
                new List<ContextData> { new("Saldo atual", balance.ToString("C")) },
                "Ver transações", "/transactions", now));

        // 2. Custos acima da receita (margem apertada)
        if (expenses > incomes * 0.9m && incomes > 0)
            alerts.Add(CriarAlerta("tight-margin", "warning", "financeiro",
                "Margem apertada",
                "Suas despesas estão próximas da receita total.",
                new List<ContextData>
                {
                    new("Receita", incomes.ToString("C")),
                    new("Despesas", expenses.ToString("C")),
                    new("Margem", $"{(incomes - expenses) / incomes * 100:F1}%")
                },
                "Ver relatórios", "/reports", now));

        // 3. Queda de margem (comparar mês atual com média dos últimos 3 meses)
        var monthlyData = transactions
            .GroupBy(t => new { t.Date.Year, t.Date.Month })
            .OrderByDescending(g => g.Key.Year).ThenByDescending(g => g.Key.Month)
            .Take(4)
            .ToList();

        if (monthlyData.Count >= 4)
        {
            var current = monthlyData[0];
            var currentIncomes = current.Where(t => t.Type == TransactionType.Income).Sum(t => t.Value);
            var currentExpenses = current.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Value);
            var currentMargin = currentIncomes > 0
                ? (currentIncomes - currentExpenses) / currentIncomes * 100
                : 0;

            var prevMargins = monthlyData.Skip(1).Select(g =>
            {
                var inc = g.Where(t => t.Type == TransactionType.Income).Sum(t => t.Value);
                var exp = g.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Value);
                return inc > 0 ? (inc - exp) / inc * 100 : 0;
            }).ToList();

            var avgPrevMargin = prevMargins.Any() ? prevMargins.Average() : 0;

            if (avgPrevMargin > 0 && currentMargin < avgPrevMargin * 0.7m)
            {
                alerts.Add(CriarAlerta("margin-drop", "warning", "margem",
                    "Queda significativa na margem",
                    $"A margem deste mês ({currentMargin:F1}%) caiu mais de 30% em relação à média dos meses anteriores ({avgPrevMargin:F1}%).",
                    new List<ContextData>
                    {
                        new("Margem atual", $"{currentMargin:F1}%"),
                        new("Média anterior", $"{avgPrevMargin:F1}%"),
                        new("Queda", $"{((avgPrevMargin - currentMargin) / avgPrevMargin * 100):F0}%")
                    },
                    "Ver relatórios", "/reports", now));
            }
        }

        // 4. Pico anômalo de despesas
        if (monthlyData.Count >= 3)
        {
            var expensesByMonth = monthlyData
                .Select(g => g.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Value))
                .ToList();

            var mean = expensesByMonth.Average();
            var variance = expensesByMonth.Select(v => Math.Pow((double)(v - mean), 2)).Average();
            var stddev = (decimal)Math.Sqrt(variance);

            if (stddev > 0)
            {
                for (int i = 0; i < expensesByMonth.Count; i++)
                {
                    if (expensesByMonth[i] > mean + 2 * stddev)
                    {
                        var g = monthlyData[i];
                        alerts.Add(CriarAlerta($"expense-spike-{g.Key.Year}-{g.Key.Month}", "warning", "custos",
                            "Pico anômalo de despesas",
                            $"As despesas de {g.Key.Month:D2}/{g.Key.Year} ({expensesByMonth[i]:C}) estão muito acima da média ({mean:C}).",
                            new List<ContextData>
                            {
                                new("Mês", $"{g.Key.Month:D2}/{g.Key.Year}"),
                                new("Despesas", expensesByMonth[i].ToString("C")),
                                new("Média mensal", mean.ToString("C")),
                                new("Variação", $"{((expensesByMonth[i] - mean) / mean * 100):F0}%")
                            },
                            "Ver despesas", $"/transactions?type=expense&month={g.Key.Month}&year={g.Key.Year}", now));
                    }
                }
            }
        }

        // 5. Inadimplência / previsões vencidas (>7 e >15 dias)
        var vencidas = forecasts
            .Where(f => f.Status == ForecastStatus.Predicted && f.ExpectedDate.Date <= now.Date)
            .ToList();

        foreach (var f in vencidas)
        {
            var diasAtraso = (now.Date - f.ExpectedDate.Date).Days;
            if (diasAtraso > 15)
            {
                alerts.Add(CriarAlerta($"overdue-15-{f.Id}", "critical", "previsoes",
                    "Previsão crítica — mais de 15 dias em atraso",
                    $"A previsão \"{f.Description}\" de {f.Amount:C} está {diasAtraso} dias vencida.",
                    new List<ContextData>
                    {
                        new("Descrição", f.Description),
                        new("Valor", f.Amount.ToString("C")),
                        new("Vencimento", f.ExpectedDate.ToString("dd/MM/yyyy")),
                        new("Dias em atraso", diasAtraso.ToString())
                    },
                    "Ver previsões", "/forecasts", now));
            }
            else if (diasAtraso > 7)
            {
                alerts.Add(CriarAlerta($"overdue-7-{f.Id}", "warning", "previsoes",
                    "Previsão vencida há mais de 7 dias",
                    $"A previsão \"{f.Description}\" de {f.Amount:C} está {diasAtraso} dias vencida.",
                    new List<ContextData>
                    {
                        new("Descrição", f.Description),
                        new("Valor", f.Amount.ToString("C")),
                        new("Vencimento", f.ExpectedDate.ToString("dd/MM/yyyy")),
                        new("Dias em atraso", diasAtraso.ToString())
                    },
                    "Ver previsões", "/forecasts", now));
            }
            else
            {
                alerts.Add(CriarAlerta($"overdue-{f.Id}", "info", "previsoes",
                    "Previsão vencida",
                    $"A previsão \"{f.Description}\" de {f.Amount:C} está vencida desde {f.ExpectedDate:dd/MM/yyyy}.",
                    new List<ContextData>
                    {
                        new("Descrição", f.Description),
                        new("Valor", f.Amount.ToString("C")),
                        new("Vencimento", f.ExpectedDate.ToString("dd/MM/yyyy"))
                    },
                    "Ver previsões", "/forecasts", now));
            }
        }

        // 6. Insights positivos
        if (monthlyData.Count >= 2)
        {
            var bestMonth = monthlyData
                .Select(g => new
                {
                    g.Key.Year, g.Key.Month,
                    Net = g.Where(t => t.Type == TransactionType.Income).Sum(t => t.Value)
                        - g.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Value)
                })
                .OrderByDescending(x => x.Net)
                .First();

            alerts.Add(CriarAlerta($"best-month-{bestMonth.Year}-{bestMonth.Month}", "success", "insights",
                "Melhor período",
                $"{bestMonth.Month:D2}/{bestMonth.Year} foi seu melhor mês, com saldo de {bestMonth.Net:C}.",
                new List<ContextData>
                {
                    new("Mês", $"{bestMonth.Month:D2}/{bestMonth.Year}"),
                    new("Saldo", bestMonth.Net.ToString("C"))
                },
                "Ver detalhes", $"/transactions?month={bestMonth.Month}&year={bestMonth.Year}", now));

            // Margem expandindo (comparar último mês com primeiro do período)
            if (monthlyData.Count >= 3)
            {
                var first = monthlyData.Last();
                var firstInc = first.Where(t => t.Type == TransactionType.Income).Sum(t => t.Value);
                var firstExp = first.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Value);
                var firstMargin = firstInc > 0 ? (firstInc - firstExp) / firstInc * 100 : 0;

                var last = monthlyData.First();
                var lastInc = last.Where(t => t.Type == TransactionType.Income).Sum(t => t.Value);
                var lastExp = last.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Value);
                var lastMargin = lastInc > 0 ? (lastInc - lastExp) / lastInc * 100 : 0;

                if (firstMargin > 0 && lastMargin > firstMargin * 1.1m)
                {
                    alerts.Add(CriarAlerta("margin-expanding", "success", "insights",
                        "Margem em expansão",
                        $"Sua margem cresceu de {firstMargin:F1}% para {lastMargin:F1}% nos últimos meses.",
                        new List<ContextData>
                        {
                            new("Margem anterior", $"{firstMargin:F1}%"),
                            new("Margem atual", $"{lastMargin:F1}%"),
                            new("Crescimento", $"{((lastMargin - firstMargin) / firstMargin * 100):F0}%")
                        },
                        "Ver relatórios", "/reports", now));
                }

                // Consistência de saldo positivo
                var positiveMonths = monthlyData.Count(g =>
                {
                    var inc = g.Where(t => t.Type == TransactionType.Income).Sum(t => t.Value);
                    var exp = g.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Value);
                    return inc > exp;
                });

                if (positiveMonths == monthlyData.Count)
                {
                    alerts.Add(CriarAlerta("consistent-positive", "success", "insights",
                        "Consistência financeira",
                        "Todos os meses do período apresentaram saldo positivo. Excelente gestão!",
                        new List<ContextData>
                        {
                            new("Meses analisados", monthlyData.Count.ToString()),
                            new("Meses positivos", positiveMonths.ToString())
                        },
                        "Ver dashboard", "/dashboard", now));
                }
            }
        }

        // Filtrar alertas dispensados
        return alerts.Where(a => !dismissed.Contains(a.Id)).ToList();
    }

    public async Task DismissAlertAsync(string alertId, string company, string? userName)
    {
        var parts = alertId.Split('-');
        var alertType = parts[0];
        var entityId = parts.Length > 1 ? alertId[(alertType.Length + 1)..] : null;

        if (!await _dismissedRepo.ExistsAsync(alertType, entityId, company))
            await _dismissedRepo.DismissAsync(alertType, entityId, company, userName ?? "system");
    }

    public async Task RestoreAlertAsync(string alertId, string company)
    {
        var parts = alertId.Split('-');
        var alertType = parts[0];
        var entityId = parts.Length > 1 ? alertId[(alertType.Length + 1)..] : null;

        await _dismissedRepo.RestoreAsync(alertType, entityId, company);
    }

    private AlertResponse CriarAlerta(
        string id, string tipo, string categoria, string titulo, string descricao,
        List<ContextData> dados, string acaoLabel, string acaoHref, DateTime now)
    {
        return new AlertResponse(
            id, tipo, categoria, titulo, descricao,
            dados, acaoLabel, acaoHref, false,
            now.ToString("o")
        );
    }
}
