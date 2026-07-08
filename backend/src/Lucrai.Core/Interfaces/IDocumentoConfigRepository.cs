using Lucrai.Core.Entities;

namespace Lucrai.Core.Interfaces;

public interface IDocumentoConfigRepository
{
    Task<DocumentoConfiguracao?> GetByCompanyAsync(string company);
    Task<DocumentoConfiguracao> UpsertAsync(DocumentoConfiguracao config);
}
