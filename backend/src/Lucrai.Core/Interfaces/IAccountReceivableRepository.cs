using Lucrai.Core.Entities;

namespace Lucrai.Core.Interfaces;

public interface IAccountReceivableRepository
{
    Task<List<AccountReceivable>> GetAllAsync(string? company);
    Task<AccountReceivable?> GetByIdAsync(Guid id, string? company);
    Task<AccountReceivable> CreateAsync(AccountReceivable receivable, string? userName);
    Task<AccountReceivable> UpdateAsync(AccountReceivable receivable, string? userName);
    Task DeleteAsync(Guid id, string company);
    Task<string> GetNextDisplayIdAsync(string? company);
    Task<(decimal TotalAReceber, decimal Vencido, decimal AVencer30d, decimal AVencer60d, decimal AVencer90d, decimal Inadimplencia, int PrazoMedioRecebimento)> GetSummaryAsync(string? company);
}
