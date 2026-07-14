using Lucrai.Core.Entities;
using Lucrai.Core.Enums;
using Lucrai.Core.Interfaces;
using Lucrai.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Lucrai.Infrastructure.Repositories;

public class TrashRepository : ITrashRepository
{
    private readonly LucraiDbContext _context;

    public TrashRepository(LucraiDbContext context)
    {
        _context = context;
    }

    public async Task<List<DeletedItem>> GetAllAsync(string? company)
    {
        var now = DateTime.UtcNow;
        var query = _context.DeletedItems.Where(d => d.RestoreUntil > now);
        if (company != null)
            query = query.Where(d => d.Company == company);
        return await query.OrderByDescending(d => d.DeletedAt).ToListAsync();
    }

    public async Task<List<DeletedItem>> GetAllExpiredAsync()
    {
        var now = DateTime.UtcNow;
        return await _context.DeletedItems
            .Where(d => d.RestoreUntil <= now)
            .ToListAsync();
    }

    public async Task MoveToTrashAsync(DeletedItem item, string? userName)
    {
        _context.DeletedItems.Add(item);

        _context.AuditLogs.Add(new AuditLog
        {
            EntityId = item.Id,
            EntityType = item.EntryType == EntryType.Transaction ? "transaction" : "forecast",
            DisplayId = item.DisplayId,
            Action = AuditAction.MovedToTrash,
            Description = $"{item.DisplayId} movido para lixeira: {item.Description}",
            User = userName ?? "Sistema",
            Company = item.Company,
            Details = item.Reason
        });

        await _context.SaveChangesAsync();
    }

    public async Task<DeletedItem?> RestoreAsync(Guid id, string? userName, string? company = null)
    {
        var deleted = await _context.DeletedItems.FirstOrDefaultAsync(d => d.Id == id && (company == null || d.Company == company));
        if (deleted == null) return null;

        if (deleted.EntryType == EntryType.Transaction)
        {
            var transaction = new Transaction
            {
                DisplayId = deleted.DisplayId,
                Type = deleted.Type,
                Value = deleted.Value ?? 0,
                CategoryId = deleted.CategoryId ?? Guid.Empty,
                CategoryName = deleted.CategoryName ?? "",
                Description = deleted.Description,
                Date = deleted.Date ?? DateTime.UtcNow,
                Observation = deleted.Observation,
                Company = deleted.Company
            };

            _context.Transactions.Add(transaction);
        }
        else
        {
            var forecast = new CashForecast
            {
                DisplayId = deleted.DisplayId,
                Type = deleted.Type,
                Description = deleted.Description,
                Amount = deleted.Amount ?? 0,
                Category = deleted.Category ?? "",
                ExpectedDate = deleted.ExpectedDate ?? DateTime.UtcNow,
                Status = deleted.Status ?? ForecastStatus.Predicted,
                Notes = deleted.Notes,
                Company = deleted.Company,
                IsRecurring = false
            };

            _context.CashForecasts.Add(forecast);
        }

        _context.DeletedItems.Remove(deleted);

        _context.AuditLogs.Add(new AuditLog
        {
            EntityId = id,
            EntityType = "trash",
            DisplayId = deleted.DisplayId,
            Action = AuditAction.Restored,
            Description = $"{deleted.DisplayId} restaurado da lixeira",
            User = userName ?? "Sistema",
            Company = deleted.Company
        });

        await _context.SaveChangesAsync();
        return deleted;
    }

    public async Task PermanentlyDeleteAsync(Guid id, string? userName, string? company = null)
    {
        var deleted = await _context.DeletedItems.FirstOrDefaultAsync(d => d.Id == id && (company == null || d.Company == company));
        if (deleted == null) return;

        _context.DeletedItems.Remove(deleted);

        _context.AuditLogs.Add(new AuditLog
        {
            EntityId = id,
            EntityType = "trash",
            DisplayId = deleted.DisplayId,
            Action = AuditAction.Deleted,
            Description = $"{deleted.DisplayId} excluído permanentemente",
            User = userName ?? "Sistema",
            Company = deleted.Company
        });

        await _context.SaveChangesAsync();
    }

    public async Task<int> CleanupAsync()
    {
        var expired = await GetAllExpiredAsync();
        if (expired.Count == 0) return 0;

        _context.DeletedItems.RemoveRange(expired);
        await _context.SaveChangesAsync();
        return expired.Count;
    }
}
