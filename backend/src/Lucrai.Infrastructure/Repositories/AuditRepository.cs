using Lucrai.Core.Entities;
using Lucrai.Core.Enums;
using Lucrai.Core.Interfaces;
using Lucrai.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Lucrai.Infrastructure.Repositories;

public class AuditRepository : IAuditRepository
{
    private readonly LucraiDbContext _context;

    public AuditRepository(LucraiDbContext context)
    {
        _context = context;
    }

    public async Task LogAsync(AuditLog log)
    {
        _context.AuditLogs.Add(log);
        await _context.SaveChangesAsync();
    }

    public async Task<List<AuditLog>> GetAllAsync(string? company)
    {
        var query = _context.AuditLogs.AsQueryable();
        if (company != null)
            query = query.Where(a => a.Company == company);
        return await query.OrderByDescending(a => a.Timestamp).ToListAsync();
    }

    public async Task<List<AuditLog>> GetByEntityAsync(Guid entityId, string? company)
    {
        var query = _context.AuditLogs.Where(a => a.EntityId == entityId);
        if (company != null)
            query = query.Where(a => a.Company == company);
        return await query
            .OrderByDescending(a => a.Timestamp)
            .ToListAsync();
    }

    public async Task<List<AuditLog>> GetByActionAsync(AuditAction action, string? company)
    {
        var query = _context.AuditLogs.Where(a => a.Action == action);
        if (company != null)
            query = query.Where(a => a.Company == company);
        return await query.OrderByDescending(a => a.Timestamp).ToListAsync();
    }
}
