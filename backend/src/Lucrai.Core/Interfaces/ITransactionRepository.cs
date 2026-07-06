using Lucrai.Core.Entities;

namespace Lucrai.Core.Interfaces;

public interface ITransactionRepository
{
    Task<List<Transaction>> GetAllAsync(string? company);
    Task<Transaction?> GetByIdAsync(Guid id);
    Task<List<Transaction>> GetByTypeAsync(Enums.TransactionType type, string? company);
    Task<List<Transaction>> GetByMonthAsync(int year, int? month, string? company);
    Task<Transaction> CreateAsync(Transaction transaction, string? userName);
    Task<Transaction> UpdateAsync(Transaction transaction, string? userName);
    Task DeleteAsync(Guid id);
    Task<(decimal Incomes, decimal Expenses, decimal Balance)> GetSummaryAsync(int year, int? month, string? company);
    Task<(decimal Incomes, decimal Expenses, decimal Balance, decimal Total)> GetYearlySummaryAsync(int year, string? company);
    Task<(decimal Incomes, decimal Expenses, decimal Balance)> GetAllBalanceAsync(string? company);
    Task<string> GetNextDisplayIdAsync(string? company);
}
