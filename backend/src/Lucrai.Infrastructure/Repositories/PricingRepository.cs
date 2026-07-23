using Lucrai.Core.Entities;
using Lucrai.Core.Interfaces;
using Lucrai.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Lucrai.Infrastructure.Repositories;

public class PricingRepository : IPricingRepository
{
    private readonly LucraiDbContext _context;

    public PricingRepository(LucraiDbContext context)
    {
        _context = context;
    }

    public async Task<List<PricingProduct>> GetAllAsync(string? company)
    {
        var query = _context.PricingProducts.AsQueryable();
        if (company != null)
            query = query.Where(p => p.Company == company);
        return await query.OrderByDescending(p => p.CreatedAt).ToListAsync();
    }

    public async Task<PricingProduct?> GetByIdAsync(Guid id, string company)
    {
        return await _context.PricingProducts.FirstOrDefaultAsync(p => p.Id == id && p.Company == company);
    }

    public async Task<PricingProduct> CreateAsync(PricingProduct product)
    {
        product.CreatedAt = DateTime.UtcNow;
        product.UpdatedAt = DateTime.UtcNow;
        _context.PricingProducts.Add(product);
        await _context.SaveChangesAsync();
        return product;
    }

    public async Task<PricingProduct> UpdateAsync(PricingProduct product)
    {
        product.UpdatedAt = DateTime.UtcNow;
        _context.PricingProducts.Update(product);
        await _context.SaveChangesAsync();
        return product;
    }

    public async Task DeleteAsync(Guid id, string company)
    {
        var product = await _context.PricingProducts.FirstOrDefaultAsync(p => p.Id == id && p.Company == company);
        if (product != null)
        {
            _context.PricingProducts.Remove(product);
            await _context.SaveChangesAsync();
        }
    }
}
