using Lucrai.Core.Entities;
using Lucrai.Core.Interfaces;
using Lucrai.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Lucrai.Infrastructure.Repositories;

public class DocumentoLogRepository : IDocumentoLogRepository
{
    private readonly LucraiDbContext _context;

    public DocumentoLogRepository(LucraiDbContext context)
    {
        _context = context;
    }

    public async Task<DocumentoLog> CreateAsync(DocumentoLog log)
    {
        log.Id = Guid.NewGuid();
        log.CriadoEm = DateTime.UtcNow;
        _context.Set<DocumentoLog>().Add(log);
        await _context.SaveChangesAsync();
        return log;
    }

    public async Task<List<DocumentoLog>> GetByDocumentoAsync(Guid documentoId, string company)
    {
        return await _context.Set<DocumentoLog>()
            .Where(l => l.DocumentoId == documentoId && l.Company == company)
            .OrderByDescending(l => l.CriadoEm)
            .ToListAsync();
    }

    public async Task<List<DocumentoLog>> GetByCompanyAsync(string? company, int limit = 50)
    {
        var query = _context.Set<DocumentoLog>().AsQueryable();
        if (company != null)
            query = query.Where(l => l.Company == company);
        return await query
            .OrderByDescending(l => l.CriadoEm)
            .Take(limit)
            .ToListAsync();
    }
}
