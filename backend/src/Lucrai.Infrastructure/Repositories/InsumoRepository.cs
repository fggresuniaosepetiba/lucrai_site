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

    public async Task<Insumo?> GetByIdAsync(Guid id, string company)
    {
        return await _context.Insumos.FirstOrDefaultAsync(i => i.Id == id && i.Company == company);
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

    public async Task DeleteAsync(Guid id, string company)
    {
        var insumo = await _context.Insumos.FirstOrDefaultAsync(i => i.Id == id && i.Company == company);
        if (insumo != null)
        {
            _context.Insumos.Remove(insumo);
            await _context.SaveChangesAsync();
        }
    }
}
