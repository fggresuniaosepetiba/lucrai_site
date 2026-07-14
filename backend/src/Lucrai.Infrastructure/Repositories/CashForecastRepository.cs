using Lucrai.Core.Entities;
using Lucrai.Core.Enums;
using Lucrai.Core.Interfaces;
using Lucrai.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Lucrai.Infrastructure.Repositories;

public class CashForecastRepository : ICashForecastRepository
{
    private readonly LucraiDbContext _context;

    public CashForecastRepository(LucraiDbContext context)
    {
        _context = context;
    }

    public async Task<List<CashForecast>> GetAllAsync(string? company, string? userId = null)
    {
        var query = _context.CashForecasts.AsQueryable();
        if (company != null)
        {
            query = query.Where(f => f.Company == company);
            if (!string.IsNullOrEmpty(userId))
                query = query.Where(f => f.CreatedBy == userId);
        }
        return await query.OrderBy(f => f.ExpectedDate).ToListAsync();
    }

    public async Task<CashForecast?> GetByIdAsync(Guid id, string? company, string? userId = null)
    {
        var query = _context.CashForecasts.Where(f => f.Id == id);
        if (company != null)
        {
            query = query.Where(f => f.Company == company);
            if (!string.IsNullOrEmpty(userId))
                query = query.Where(f => f.CreatedBy == userId);
        }
        return await query.FirstOrDefaultAsync();
    }

    public async Task<List<CashForecast>> GetByStatusAsync(ForecastStatus status, string? company, string? userId = null)
    {
        var query = _context.CashForecasts.Where(f => f.Status == status);
        if (company != null)
        {
            query = query.Where(f => f.Company == company);
            if (!string.IsNullOrEmpty(userId))
                query = query.Where(f => f.CreatedBy == userId);
        }
        return await query.OrderBy(f => f.ExpectedDate).ToListAsync();
    }

    public async Task<CashForecast> CreateAsync(CashForecast forecast, string? userName)
    {
        forecast.DisplayId = await GetNextDisplayIdAsync(forecast.Company);
        forecast.CreatedAt = DateTime.UtcNow;
        forecast.UpdatedAt = DateTime.UtcNow;

        _context.CashForecasts.Add(forecast);

        _context.AuditLogs.Add(new AuditLog
        {
            EntityId = forecast.Id,
            EntityType = "forecast",
            DisplayId = forecast.DisplayId,
            Action = AuditAction.Created,
            Description = $"Previsão {forecast.DisplayId} criada: {forecast.Description}",
            User = userName ?? "Sistema",
            Company = forecast.Company
        });

        await _context.SaveChangesAsync();
        return forecast;
    }

    public async Task<CashForecast> UpdateAsync(CashForecast forecast, string? userName)
    {
        forecast.UpdatedAt = DateTime.UtcNow;
        _context.CashForecasts.Update(forecast);

        _context.AuditLogs.Add(new AuditLog
        {
            EntityId = forecast.Id,
            EntityType = "forecast",
            DisplayId = forecast.DisplayId,
            Action = AuditAction.Edited,
            Description = $"Previsão {forecast.DisplayId} editada: {forecast.Description}",
            User = userName ?? "Sistema",
            Company = forecast.Company
        });

        await _context.SaveChangesAsync();
        return forecast;
    }

    public async Task DeleteAsync(Guid id)
    {
        var forecast = await _context.CashForecasts.FindAsync(id);
        if (forecast != null)
        {
            _context.CashForecasts.Remove(forecast);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<CashForecast> MarkAsReceivedAsync(Guid id, string? userName)
    {
        var forecast = await _context.CashForecasts.FindAsync(id)
            ?? throw new InvalidOperationException("Previsão não encontrada");

        forecast.Status = ForecastStatus.Received;
        forecast.UpdatedAt = DateTime.UtcNow;

        var transaction = new Transaction
        {
            Type = TransactionType.Income,
            Value = forecast.Amount,
            CategoryName = forecast.Category,
            Description = forecast.Description,
            Date = DateTime.UtcNow,
            Observation = $"Originado da previsão {forecast.DisplayId}",
            Company = forecast.Company,
            CreatedBy = forecast.CreatedBy
        };

        var txRepo = new TransactionRepository(_context);
        await txRepo.CreateAsync(transaction, userName);

        _context.AuditLogs.Add(new AuditLog
        {
            EntityId = forecast.Id,
            EntityType = "forecast",
            DisplayId = forecast.DisplayId,
            Action = AuditAction.Received,
            Description = $"Previsão {forecast.DisplayId} marcada como recebida: {forecast.Description}",
            User = userName ?? "Sistema",
            Company = forecast.Company,
            Details = $"TransactionId: {transaction.Id}"
        });

        await _context.SaveChangesAsync();
        return forecast;
    }

    public async Task<CashForecast> MarkAsPaidAsync(Guid id, string? userName)
    {
        var forecast = await _context.CashForecasts.FindAsync(id)
            ?? throw new InvalidOperationException("Previsão não encontrada");

        forecast.Status = ForecastStatus.Paid;
        forecast.UpdatedAt = DateTime.UtcNow;

        var transaction = new Transaction
        {
            Type = TransactionType.Expense,
            Value = forecast.Amount,
            CategoryName = forecast.Category,
            Description = forecast.Description,
            Date = DateTime.UtcNow,
            Observation = $"Originado da previsão {forecast.DisplayId}",
            Company = forecast.Company,
            CreatedBy = forecast.CreatedBy
        };

        var txRepo = new TransactionRepository(_context);
        await txRepo.CreateAsync(transaction, userName);

        _context.AuditLogs.Add(new AuditLog
        {
            EntityId = forecast.Id,
            EntityType = "forecast",
            DisplayId = forecast.DisplayId,
            Action = AuditAction.Paid,
            Description = $"Previsão {forecast.DisplayId} marcada como paga: {forecast.Description}",
            User = userName ?? "Sistema",
            Company = forecast.Company,
            Details = $"TransactionId: {transaction.Id}"
        });

        await _context.SaveChangesAsync();
        return forecast;
    }

    public async Task<CashForecast> MarkAsCancelledAsync(Guid id, string? reason, string? userName)
    {
        var forecast = await _context.CashForecasts.FindAsync(id)
            ?? throw new InvalidOperationException("Previsão não encontrada");

        forecast.Status = ForecastStatus.Cancelled;
        forecast.CancelledReason = reason;
        forecast.CancelledAt = DateTime.UtcNow;
        forecast.CancelledBy = userName;
        forecast.UpdatedAt = DateTime.UtcNow;

        _context.AuditLogs.Add(new AuditLog
        {
            EntityId = forecast.Id,
            EntityType = "forecast",
            DisplayId = forecast.DisplayId,
            Action = AuditAction.Cancelled,
            Description = $"Previsão {forecast.DisplayId} cancelada: {reason}",
            User = userName ?? "Sistema",
            Company = forecast.Company,
            Details = reason
        });

        await _context.SaveChangesAsync();
        return forecast;
    }

    public async Task<(decimal PredictedIncomes, decimal PredictedExpenses, decimal AllIncomes, decimal AllExpenses)> GetTotalsAsync(string? company, string? userId = null)
    {
        var predictedIncomesQuery = _context.CashForecasts.Where(f => f.Status == ForecastStatus.Predicted && f.Type == TransactionType.Income);
        var predictedExpensesQuery = _context.CashForecasts.Where(f => f.Status == ForecastStatus.Predicted && f.Type == TransactionType.Expense);
        var allIncomesQuery = _context.CashForecasts.Where(f => f.Type == TransactionType.Income);
        var allExpensesQuery = _context.CashForecasts.Where(f => f.Type == TransactionType.Expense);

        if (company != null)
        {
            predictedIncomesQuery = predictedIncomesQuery.Where(f => f.Company == company);
            predictedExpensesQuery = predictedExpensesQuery.Where(f => f.Company == company);
            allIncomesQuery = allIncomesQuery.Where(f => f.Company == company);
            allExpensesQuery = allExpensesQuery.Where(f => f.Company == company);
            if (!string.IsNullOrEmpty(userId))
            {
                predictedIncomesQuery = predictedIncomesQuery.Where(f => f.CreatedBy == userId);
                predictedExpensesQuery = predictedExpensesQuery.Where(f => f.CreatedBy == userId);
                allIncomesQuery = allIncomesQuery.Where(f => f.CreatedBy == userId);
                allExpensesQuery = allExpensesQuery.Where(f => f.CreatedBy == userId);
            }
        }

        var predictedIncomes = await predictedIncomesQuery.SumAsync(f => f.Amount);
        var predictedExpenses = await predictedExpensesQuery.SumAsync(f => f.Amount);
        var allIncomes = await allIncomesQuery.SumAsync(f => f.Amount);
        var allExpenses = await allExpensesQuery.SumAsync(f => f.Amount);

        return (predictedIncomes, predictedExpenses, allIncomes, allExpenses);
    }

    public async Task<string> GetNextDisplayIdAsync(string? company)
    {
        var query = _context.CashForecasts.AsQueryable();
        if (company != null)
            query = query.Where(f => f.Company == company);

        var count = await query.CountAsync();
        return $"#{(count + 1):D3}";
    }
}
