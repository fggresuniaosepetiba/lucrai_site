using Lucrai.Core.Entities;

namespace Lucrai.Core.Interfaces;

public interface IInvestmentRepository
{
    Task<List<Investment>> GetAllAsync(string? company);
    Task<Investment?> GetByIdAsync(Guid id, string? company);
    Task<Investment> CreateAsync(Investment investment, string? userName);
    Task<Investment> UpdateAsync(Investment investment, string? userName);
    Task DeleteAsync(Guid id);
    Task<string> GetNextDisplayIdAsync(string? company);
    Task<(decimal TotalInvestido, int ProjetosAtivos, decimal? ROIMedio)> GetSummaryAsync(string? company);
}
