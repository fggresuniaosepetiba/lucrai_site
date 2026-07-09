using Lucrai.Core.Entities;
using Lucrai.Core.Interfaces;
using Lucrai.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Lucrai.Infrastructure.Repositories;

public class FixedCostRepository : IFixedCostRepository
{
    private readonly LucraiDbContext _context;

    public FixedCostRepository(LucraiDbContext context)
    {
        _context = context;
    }

    public async Task<FixedCost?> GetAsync(string? company)
    {
        return await _context.FixedCosts
            .FirstOrDefaultAsync(f => company == null || f.Company == company);
    }

    public async Task<FixedCost> SaveAsync(FixedCost fixedCost)
    {
        var existing = await GetAsync(fixedCost.Company);
        if (existing != null)
        {
            existing.Aluguel = fixedCost.Aluguel;
            existing.Energia = fixedCost.Energia;
            existing.Agua = fixedCost.Agua;
            existing.Internet = fixedCost.Internet;
            existing.Contador = fixedCost.Contador;
            existing.ProLabore = fixedCost.ProLabore;
            existing.Softwares = fixedCost.Softwares;
            existing.Telefone = fixedCost.Telefone;
            existing.Marketing = fixedCost.Marketing;
            existing.Limpeza = fixedCost.Limpeza;
            existing.Outros = fixedCost.Outros;
            existing.CustomCosts = fixedCost.CustomCosts;
            existing.Total = fixedCost.Total;
            existing.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return existing;
        }

        _context.FixedCosts.Add(fixedCost);
        await _context.SaveChangesAsync();
        return fixedCost;
    }
}
