using Lucrai.Core.Entities;

namespace Lucrai.Core.Interfaces;

public interface IInsumoRepository
{
    Task<List<Insumo>> GetAllAsync(string company);
    Task<Insumo?> GetByIdAsync(Guid id);
    Task<Insumo> CreateAsync(Insumo insumo);
    Task<Insumo> UpdateAsync(Insumo insumo);
    Task DeleteAsync(Guid id);
}
