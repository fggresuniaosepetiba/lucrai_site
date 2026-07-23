using Lucrai.Core.Entities;
using Lucrai.Core.Enums;

namespace Lucrai.Core.Interfaces;

public interface IBalanceAccountRepository
{
    Task<List<BalanceAccount>> GetAllAsync(string? company, int? year = null, int? month = null);
    Task<BalanceAccount?> GetByIdAsync(Guid id, string? company);
    Task<List<BalanceAccount>> GetByNatureAsync(AccountNature nature, string? company, int? year = null, int? month = null);
    Task<BalanceAccount> CreateAsync(BalanceAccount account, string? userName);
    Task<BalanceAccount> UpdateAsync(BalanceAccount account, string? userName);
    Task DeleteAsync(Guid id, string company);
}
