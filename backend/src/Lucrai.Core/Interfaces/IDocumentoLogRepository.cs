using Lucrai.Core.Entities;

namespace Lucrai.Core.Interfaces;

public interface IDocumentoLogRepository
{
    Task<DocumentoLog> CreateAsync(DocumentoLog log);
    Task<List<DocumentoLog>> GetByDocumentoAsync(Guid documentoId, string company);
    Task<List<DocumentoLog>> GetByCompanyAsync(string? company, int limit = 50);
}
