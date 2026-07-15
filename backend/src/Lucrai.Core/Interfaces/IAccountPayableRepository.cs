using Lucrai.Core.Entities;

namespace Lucrai.Core.Interfaces;

public interface IAccountPayableRepository
{
    Task<List<AccountPayable>> GetAllAsync(string? company);
    Task<AccountPayable?> GetByIdAsync(Guid id, string? company);
    Task<AccountPayable> CreateAsync(AccountPayable payable, string? userName);
    Task<AccountPayable> UpdateAsync(AccountPayable payable, string? userName);
    Task DeleteAsync(Guid id);
    Task<string> GetNextDisplayIdAsync(string? company);
    Task<(decimal TotalAPagar, decimal Vencido, decimal AVencer30d, decimal AVencer60d, decimal AVencer90d, int PrazoMedioPagamento)> GetSummaryAsync(string? company);
}
