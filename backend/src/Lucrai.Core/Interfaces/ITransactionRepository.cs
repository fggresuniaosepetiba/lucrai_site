using Lucrai.Core.Entities;

namespace Lucrai.Core.Interfaces;

public interface ITransactionRepository
{
    Task<List<Transaction>> GetAllAsync(string? company, string? userId = null);
    Task<Transaction?> GetByIdAsync(Guid id, string? company, string? userId = null);
    Task<List<Transaction>> GetByTypeAsync(Enums.TransactionType type, string? company, string? userId = null);
    Task<List<Transaction>> GetByMonthAsync(int year, int? month, string? company, string? userId = null);
    Task<Transaction> CreateAsync(Transaction transaction, string? userName);
    Task<Transaction> UpdateAsync(Transaction transaction, string? userName);
    Task DeleteAsync(Guid id, string company);
    Task<(decimal Incomes, decimal Expenses, decimal Balance)> GetSummaryAsync(int year, int? month, string? company, string? userId = null);
    Task<(decimal Incomes, decimal Expenses, decimal Balance, decimal Total)> GetYearlySummaryAsync(int year, string? company, string? userId = null);
    Task<(decimal Incomes, decimal Expenses, decimal Balance)> GetAllBalanceAsync(string? company, string? userId = null);
    Task<string> GetNextDisplayIdAsync(string? company, string? userId);
}
