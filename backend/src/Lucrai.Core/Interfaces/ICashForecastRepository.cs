using Lucrai.Core.Entities;

namespace Lucrai.Core.Interfaces;

public interface ICashForecastRepository
{
    Task<List<CashForecast>> GetAllAsync(string? company, string? userId = null);
    Task<CashForecast?> GetByIdAsync(Guid id, string? company, string? userId = null);
    Task<List<CashForecast>> GetByStatusAsync(Enums.ForecastStatus status, string? company, string? userId = null);
    Task<CashForecast> CreateAsync(CashForecast forecast, string? userName);
    Task<CashForecast> UpdateAsync(CashForecast forecast, string? userName);
    Task DeleteAsync(Guid id);
    Task<CashForecast> MarkAsReceivedAsync(Guid id, string? userName);
    Task<CashForecast> MarkAsPaidAsync(Guid id, string? userName);
    Task<CashForecast> MarkAsCancelledAsync(Guid id, string? reason, string? userName);
    Task<(decimal PredictedIncomes, decimal PredictedExpenses, decimal AllIncomes, decimal AllExpenses)> GetTotalsAsync(string? company, string? userId = null);
    Task<string> GetNextDisplayIdAsync(string? company, string? userId);
}
