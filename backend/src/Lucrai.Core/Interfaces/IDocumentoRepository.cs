using Lucrai.Core.Entities;

namespace Lucrai.Core.Interfaces;

public interface IDocumentoRepository
{
    Task<List<DocumentoFinanceiro>> GetAllAsync(string? company);
    Task<DocumentoFinanceiro?> GetByIdAsync(Guid id, string company);
    Task<DocumentoFinanceiro> CreateAsync(DocumentoFinanceiro documento);
    Task UpdateAsync(DocumentoFinanceiro documento);
    Task<(int Total, int Aguardando, int Processando, int ConvertidosMes, int RejeitadosMes, int EconomiaEstimadaMinutos, decimal ValorTotalAutomatizado)> GetStatsAsync(string? company, int mes, int ano);

    Task<List<DocumentoFinanceiro>> GetByStatusAsync(string? company, string status);

    Task MoveToTrashAsync(Guid id, string motivo, string excluidoPor, string excluidoPorNome, string company);
    Task RestoreFromTrashAsync(Guid id, string company);
    Task PermanentDeleteAsync(Guid id, string company);
    Task<List<DocumentoTrashItem>> GetAllTrashItemsAsync(string? company);
    Task<DocumentoTrashItem?> GetTrashItemAsync(Guid documentoId, string company);
    Task<int> CleanupTrashAsync(string? company = null);
}
