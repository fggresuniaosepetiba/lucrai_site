using Lucrai.Core.Entities;

namespace Lucrai.Core.Interfaces;

public interface IDocumentoRepository
{
    Task<List<DocumentoFinanceiro>> GetAllAsync(string? company);
    Task<DocumentoFinanceiro?> GetByIdAsync(Guid id);
    Task<DocumentoFinanceiro> CreateAsync(DocumentoFinanceiro documento);
    Task UpdateAsync(DocumentoFinanceiro documento);
    Task<(int Total, int Aguardando, int Processando, int ConvertidosMes, int RejeitadosMes, int EconomiaEstimadaMinutos, decimal ValorTotalAutomatizado)> GetStatsAsync(string? company, int mes, int ano);
}
