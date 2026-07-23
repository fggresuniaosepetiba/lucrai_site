using Lucrai.Core.Entities;
using Lucrai.Core.Enums;
using Lucrai.Core.Interfaces;
using Lucrai.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Lucrai.Infrastructure.Repositories;

public class TransactionRepository : ITransactionRepository
{
    private readonly LucraiDbContext _context;

    public TransactionRepository(LucraiDbContext context)
    {
        _context = context;
    }

    public async Task<List<Transaction>> GetAllAsync(string? company, string? userId = null)
    {
        var query = _context.Transactions.AsQueryable();
        if (company != null)
        {
            query = query.Where(t => t.Company == company);
            if (!string.IsNullOrEmpty(userId))
                query = query.Where(t => t.CreatedBy == userId);
        }
        return await query.OrderBy(t => t.DisplayId).ToListAsync();
    }

    public async Task<Transaction?> GetByIdAsync(Guid id, string? company, string? userId = null)
    {
        var query = _context.Transactions.Where(t => t.Id == id);
        if (company != null)
        {
            query = query.Where(t => t.Company == company);
            if (!string.IsNullOrEmpty(userId))
                query = query.Where(t => t.CreatedBy == userId);
        }
        return await query.FirstOrDefaultAsync();
    }

    public async Task<List<Transaction>> GetByTypeAsync(TransactionType type, string? company, string? userId = null)
    {
        var query = _context.Transactions.Where(t => t.Type == type);
        if (company != null)
        {
            query = query.Where(t => t.Company == company);
            if (!string.IsNullOrEmpty(userId))
                query = query.Where(t => t.CreatedBy == userId);
        }
        return await query.OrderBy(t => t.DisplayId).ToListAsync();
    }

    public async Task<List<Transaction>> GetByMonthAsync(int year, int? month, string? company, string? userId = null)
    {
        var query = _context.Transactions.Where(t => t.Date.Year == year);
        if (company != null)
        {
            query = query.Where(t => t.Company == company);
            if (!string.IsNullOrEmpty(userId))
                query = query.Where(t => t.CreatedBy == userId);
        }

        if (month.HasValue)
            query = query.Where(t => t.Date.Month == month.Value);

        return await query.OrderBy(t => t.DisplayId).ToListAsync();
    }

    public async Task<Transaction> CreateAsync(Transaction transaction, string? userName)
    {
        transaction.DisplayId = await GetNextDisplayIdAsync(transaction.Company, transaction.CreatedBy);
        transaction.CreatedAt = DateTime.UtcNow;
        transaction.UpdatedAt = DateTime.UtcNow;

        _context.Transactions.Add(transaction);

        _context.AuditLogs.Add(new AuditLog
        {
            EntityId = transaction.Id,
            EntityType = "transaction",
            DisplayId = transaction.DisplayId,
            Action = AuditAction.Created,
            Description = $"Transação {transaction.DisplayId} criada: {transaction.Description}",
            User = userName ?? "Sistema",
            Company = transaction.Company
        });

        await _context.SaveChangesAsync();
        return transaction;
    }

    public async Task<Transaction> UpdateAsync(Transaction transaction, string? userName)
    {
        transaction.UpdatedAt = DateTime.UtcNow;
        _context.Transactions.Update(transaction);

        _context.AuditLogs.Add(new AuditLog
        {
            EntityId = transaction.Id,
            EntityType = "transaction",
            DisplayId = transaction.DisplayId,
            Action = AuditAction.Edited,
            Description = $"Transação {transaction.DisplayId} editada: {transaction.Description}",
            User = userName ?? "Sistema",
            Company = transaction.Company
        });

        await _context.SaveChangesAsync();
        return transaction;
    }

    public async Task DeleteAsync(Guid id, string company)
    {
        var transaction = await _context.Transactions.FirstOrDefaultAsync(t => t.Id == id && t.Company == company);
        if (transaction != null)
        {
            _context.Transactions.Remove(transaction);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<(decimal Incomes, decimal Expenses, decimal Balance)> GetSummaryAsync(int year, int? month, string? company, string? userId = null)
    {
        var query = _context.Transactions.Where(t => t.Date.Year == year);
        if (company != null)
        {
            query = query.Where(t => t.Company == company);
            if (!string.IsNullOrEmpty(userId))
                query = query.Where(t => t.CreatedBy == userId);
        }

        if (month.HasValue)
            query = query.Where(t => t.Date.Month == month.Value);

        var incomes = await query.Where(t => t.Type == TransactionType.Income).SumAsync(t => t.Value);
        var expenses = await query.Where(t => t.Type == TransactionType.Expense).SumAsync(t => t.Value);

        return (incomes, expenses, incomes - expenses);
    }

    public async Task<(decimal Incomes, decimal Expenses, decimal Balance, decimal Total)> GetYearlySummaryAsync(int year, string? company, string? userId = null)
    {
        var query = _context.Transactions.Where(t => t.Date.Year == year);
        if (company != null)
        {
            query = query.Where(t => t.Company == company);
            if (!string.IsNullOrEmpty(userId))
                query = query.Where(t => t.CreatedBy == userId);
        }

        var incomes = await query.Where(t => t.Type == TransactionType.Income).SumAsync(t => t.Value);
        var expenses = await query.Where(t => t.Type == TransactionType.Expense).SumAsync(t => t.Value);

        return (incomes, expenses, incomes - expenses, incomes + expenses);
    }

    public async Task<(decimal Incomes, decimal Expenses, decimal Balance)> GetAllBalanceAsync(string? company, string? userId = null)
    {
        var incomesQuery = _context.Transactions.Where(t => t.Type == TransactionType.Income);
        var expensesQuery = _context.Transactions.Where(t => t.Type == TransactionType.Expense);
        if (company != null)
        {
            incomesQuery = incomesQuery.Where(t => t.Company == company);
            expensesQuery = expensesQuery.Where(t => t.Company == company);
            if (!string.IsNullOrEmpty(userId))
            {
                incomesQuery = incomesQuery.Where(t => t.CreatedBy == userId);
                expensesQuery = expensesQuery.Where(t => t.CreatedBy == userId);
            }
        }

        var incomes = await incomesQuery.SumAsync(t => t.Value);
        var expenses = await expensesQuery.SumAsync(t => t.Value);

        return (incomes, expenses, incomes - expenses);
    }

    public async Task<string> GetNextDisplayIdAsync(string? company, string? userId)
    {
        var query = _context.Transactions.Where(t => !string.IsNullOrEmpty(t.DisplayId));
        if (company != null)
            query = query.Where(t => t.Company == company);
        if (!string.IsNullOrEmpty(userId))
            query = query.Where(t => t.CreatedBy == userId);

        var displayIds = await query.Select(t => t.DisplayId).ToListAsync();

        var used = displayIds
            .Select(id =>
            {
                var match = System.Text.RegularExpressions.Regex.Match(id, @"#(\d+)");
                return match.Success ? int.Parse(match.Groups[1].Value) : 0;
            })
            .Where(n => n > 0)
            .ToHashSet();

        var next = 1;
        while (used.Contains(next)) next++;

        return $"#{next:D3}";
    }
}
