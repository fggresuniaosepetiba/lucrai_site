using Lucrai.Core.Entities;

namespace Lucrai.Core.Interfaces;

public interface IDocumentoRepository
{
    Task<List<DocumentoFinanceiro>> GetAllAsync(string? company);
    Task<DocumentoFinanceiro?> GetByIdAsync(Guid id);
    Task<DocumentoFinanceiro> CreateAsync(DocumentoFinanceiro documento);
    Task UpdateAsync(DocumentoFinanceiro documento);
    Task<(int Total, int Aguardando, int Processando, int ConvertidosMes, int RejeitadosMes, int EconomiaEstimadaMinutos, decimal ValorTotalAutomatizado)> GetStatsAsync(string? company, int mes, int ano);

    Task<List<DocumentoFinanceiro>> GetByStatusAsync(string? company, string status);

    Task MoveToTrashAsync(Guid id, string motivo, string excluidoPor, string excluidoPorNome);
    Task RestoreFromTrashAsync(Guid id);
    Task PermanentDeleteAsync(Guid id);
    Task<List<DocumentoTrashItem>> GetAllTrashItemsAsync(string? company);
    Task<DocumentoTrashItem?> GetTrashItemAsync(Guid documentoId);
    Task<int> CleanupTrashAsync(string? company = null);
}
