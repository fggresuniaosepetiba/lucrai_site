using Lucrai.Core.Entities;

namespace Lucrai.Core.Interfaces;

public interface IDocumentoAprendizadoRepository
{
    Task<List<DocumentoAprendizado>> GetByCompanyAsync(string? company);
    Task<DocumentoAprendizado?> GetByChaveAsync(string company, string chave);
    Task<DocumentoAprendizado> UpsertAsync(DocumentoAprendizado aprendizado);
    Task DeleteAsync(Guid id, string company);
    Task ClearByCompanyAsync(string company);
}
