using Lucrai.Core.Entities;

namespace Lucrai.Core.Interfaces;

public interface IDebtRepository
{
    Task<List<Debt>> GetAllAsync(string? company);
    Task<Debt?> GetByIdAsync(Guid id, string? company);
    Task<Debt> CreateAsync(Debt debt, string? userName);
    Task<Debt> UpdateAsync(Debt debt, string? userName);
    Task DeleteAsync(Guid id, string company);
    Task<string> GetNextDisplayIdAsync(string? company);
    Task<(decimal DividaTotal, decimal DividaCurtoPrazo, decimal DividaLongoPrazo)> GetSummaryAsync(string? company);
}
