using Lucrai.Core.Entities;

namespace Lucrai.Core.Interfaces;

public interface IReciboRepository
{
    Task<List<Recibo>> GetAllAsync(string company);
    Task<Recibo?> GetByIdAsync(Guid id, string company);
    Task<Recibo> CreateAsync(Recibo recibo);
    Task<Recibo> UpdateAsync(Recibo recibo);
    Task DeleteAsync(Guid id, string company);
    Task<Recibo?> GetByLancamentoIdAsync(Guid lancamentoId, string company);
    Task<string> GetProximoNumeroAsync(string company);
}
