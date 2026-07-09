using Lucrai.Core.Entities;

namespace Lucrai.Core.Interfaces;

public interface IReciboRepository
{
    Task<List<Recibo>> GetAllAsync(string company);
    Task<Recibo?> GetByIdAsync(Guid id);
    Task<Recibo> CreateAsync(Recibo recibo);
    Task<Recibo> UpdateAsync(Recibo recibo);
    Task DeleteAsync(Guid id);
    Task<Recibo?> GetByLancamentoIdAsync(Guid lancamentoId);
    Task<string> GetProximoNumeroAsync(string company);
}
