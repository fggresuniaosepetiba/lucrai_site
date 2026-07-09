using Lucrai.Core.Entities;
using Lucrai.Core.Interfaces;
using Lucrai.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Lucrai.Infrastructure.Repositories;

public class InsumoRepository : IInsumoRepository
{
    private readonly LucraiDbContext _context;

    public InsumoRepository(LucraiDbContext context)
    {
        _context = context;
    }

    public async Task<List<Insumo>> GetAllAsync(string company)
    {
        return await _context.Insumos
            .Where(i => i.Company == company)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();
    }

    public async Task<Insumo?> GetByIdAsync(Guid id)
    {
        return await _context.Insumos.FindAsync(id);
    }

    public async Task<Insumo> CreateAsync(Insumo insumo)
    {
        _context.Insumos.Add(insumo);
        await _context.SaveChangesAsync();
        return insumo;
    }

    public async Task<Insumo> UpdateAsync(Insumo insumo)
    {
        _context.Insumos.Update(insumo);
        await _context.SaveChangesAsync();
        return insumo;
    }

    public async Task DeleteAsync(Guid id)
    {
        var insumo = await _context.Insumos.FindAsync(id);
        if (insumo != null)
        {
            _context.Insumos.Remove(insumo);
            await _context.SaveChangesAsync();
        }
    }
}
