using Lucrai.Core.Entities;

namespace Lucrai.Core.Interfaces;

public interface IPricingRepository
{
    Task<List<PricingProduct>> GetAllAsync(string? company);
    Task<PricingProduct?> GetByIdAsync(Guid id, string company);
    Task<PricingProduct> CreateAsync(PricingProduct product);
    Task<PricingProduct> UpdateAsync(PricingProduct product);
    Task DeleteAsync(Guid id, string company);
}
