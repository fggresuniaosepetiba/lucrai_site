using Lucrai.Core.Entities;

namespace Lucrai.Core.Interfaces;

public interface IFixedCostRepository
{
    Task<FixedCost?> GetAsync(string? company);
    Task<FixedCost> SaveAsync(FixedCost fixedCost);
}
