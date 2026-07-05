using Lucrai.Core.Entities;
using Lucrai.Core.Interfaces;
using Lucrai.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Lucrai.Infrastructure.Repositories;

public class DismissedAlertRepository : IDismissedAlertRepository
{
    private readonly LucraiDbContext _context;

    public DismissedAlertRepository(LucraiDbContext context)
    {
        _context = context;
    }

    public async Task<List<string>> GetDismissedIdsAsync(string company)
    {
        return await _context.DismissedAlerts
            .Where(d => d.Company == company)
            .Select(d => d.AlertType + (d.EntityId != null ? "-" + d.EntityId : ""))
            .ToListAsync();
    }

    public async Task<bool> IsDismissedAsync(string alertType, string? entityId, string company)
    {
        var key = alertType + (entityId != null ? "-" + entityId : "");
        var ids = await GetDismissedIdsAsync(company);
        return ids.Contains(key);
    }

    public async Task DismissAsync(string alertType, string? entityId, string company, string dismissedBy)
    {
        var dismissed = new DismissedAlert
        {
            AlertType = alertType,
            EntityId = entityId,
            Company = company,
            DismissedBy = dismissedBy
        };
        _context.DismissedAlerts.Add(dismissed);
        await _context.SaveChangesAsync();
    }

    public async Task RestoreAsync(string alertType, string? entityId, string company)
    {
        var entries = await _context.DismissedAlerts
            .Where(d => d.Company == company
                && d.AlertType == alertType
                && d.EntityId == entityId)
            .ToListAsync();

        _context.DismissedAlerts.RemoveRange(entries);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> ExistsAsync(string alertType, string? entityId, string company)
    {
        return await _context.DismissedAlerts
            .AnyAsync(d => d.Company == company
                && d.AlertType == alertType
                && d.EntityId == entityId);
    }
}
