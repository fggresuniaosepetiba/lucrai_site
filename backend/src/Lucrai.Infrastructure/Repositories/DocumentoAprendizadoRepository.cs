using Lucrai.Core.Entities;
using Lucrai.Core.Interfaces;
using Lucrai.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Lucrai.Infrastructure.Repositories;

public class DocumentoAprendizadoRepository : IDocumentoAprendizadoRepository
{
    private readonly LucraiDbContext _context;

    public DocumentoAprendizadoRepository(LucraiDbContext context)
    {
        _context = context;
    }

    public async Task<List<DocumentoAprendizado>> GetByCompanyAsync(string? company)
    {
        var query = _context.Set<DocumentoAprendizado>().AsQueryable();
        if (company != null)
            query = query.Where(a => a.Company == company);
        return await query
            .OrderByDescending(a => a.AtualizadoEm)
            .ToListAsync();
    }

    public async Task<DocumentoAprendizado?> GetByChaveAsync(string company, string chave)
    {
        return await _context.Set<DocumentoAprendizado>()
            .FirstOrDefaultAsync(a => a.Company == company && a.Chave == chave);
    }

    public async Task<DocumentoAprendizado> UpsertAsync(DocumentoAprendizado aprendizado)
    {
        var existing = await _context.Set<DocumentoAprendizado>()
            .FirstOrDefaultAsync(a => a.Company == aprendizado.Company && a.Chave == aprendizado.Chave);

        var now = DateTime.UtcNow;

        if (existing != null)
        {
            existing.CategoriaId = aprendizado.CategoriaId;
            existing.TipoMovimentacao = aprendizado.TipoMovimentacao;
            existing.ConfiancaMinima = aprendizado.ConfiancaMinima;
            existing.Ativo = aprendizado.Ativo;
            existing.AtualizadoEm = now;
            _context.Set<DocumentoAprendizado>().Update(existing);
            await _context.SaveChangesAsync();
            return existing;
        }

        aprendizado.Id = Guid.NewGuid();
        aprendizado.CriadoEm = now;
        aprendizado.AtualizadoEm = now;
        _context.Set<DocumentoAprendizado>().Add(aprendizado);
        await _context.SaveChangesAsync();
        return aprendizado;
    }

    public async Task DeleteAsync(Guid id)
    {
        var item = await _context.Set<DocumentoAprendizado>().FirstOrDefaultAsync(a => a.Id == id);
        if (item != null)
        {
            _context.Set<DocumentoAprendizado>().Remove(item);
            await _context.SaveChangesAsync();
        }
    }

    public async Task ClearByCompanyAsync(string company)
    {
        var items = await _context.Set<DocumentoAprendizado>()
            .Where(a => a.Company == company)
            .ToListAsync();
        _context.Set<DocumentoAprendizado>().RemoveRange(items);
        await _context.SaveChangesAsync();
    }
}
