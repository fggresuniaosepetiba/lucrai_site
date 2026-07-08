using Lucrai.Core.Entities;
using Lucrai.Core.Interfaces;
using Lucrai.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Lucrai.Infrastructure.Repositories;

public class DocumentoRepository : IDocumentoRepository
{
    private readonly LucraiDbContext _context;

    public DocumentoRepository(LucraiDbContext context)
    {
        _context = context;
    }

    public async Task<List<DocumentoFinanceiro>> GetAllAsync(string? company)
    {
        var query = _context.Documentos.AsQueryable();
        if (company != null)
            query = query.Where(d => d.Company == company);
        return await query
            .Where(d => d.ExcluidoEm == null)
            .OrderByDescending(d => d.CriadoEm)
            .ToListAsync();
    }

    public async Task<DocumentoFinanceiro?> GetByIdAsync(Guid id)
    {
        return await _context.Documentos.FindAsync(id);
    }

    public async Task<DocumentoFinanceiro> CreateAsync(DocumentoFinanceiro documento)
    {
        documento.CriadoEm = DateTime.UtcNow;
        documento.AtualizadoEm = DateTime.UtcNow;
        _context.Documentos.Add(documento);
        await _context.SaveChangesAsync();
        return documento;
    }

    public async Task UpdateAsync(DocumentoFinanceiro documento)
    {
        documento.AtualizadoEm = DateTime.UtcNow;
        _context.Documentos.Update(documento);
        await _context.SaveChangesAsync();
    }

    public async Task<(int Total, int Aguardando, int Processando, int ConvertidosMes, int RejeitadosMes, int EconomiaEstimadaMinutos, decimal ValorTotalAutomatizado)> GetStatsAsync(string? company, int mes, int ano)
    {
        var query = _context.Documentos.AsQueryable();
        if (company != null)
            query = query.Where(d => d.Company == company);

        var all = await query.Where(d => d.ExcluidoEm == null).ToListAsync();

        var total = all.Count;
        var aguardando = all.Count(d => d.Status == "AGUARDANDO_CONFERENCIA");
        var processando = all.Count(d => d.Status == "PROCESSANDO");

        var prefix = $"{ano}-{mes:D2}";
        var convertidosMes = all.Count(d => d.Status == "CONVERTIDO" && d.CriadoEm.ToString("yyyy-MM").StartsWith(prefix));
        var rejeitadosMes = all.Count(d => d.Status == "REJEITADO" && d.CriadoEm.ToString("yyyy-MM").StartsWith(prefix));
        var economia = convertidosMes * 6;
        var valorTotal = all
            .Where(d => d.Status == "CONVERTIDO" && d.ValorExtraido.HasValue)
            .Sum(d => d.ValorExtraido ?? 0);

        return (total, aguardando, processando, convertidosMes, rejeitadosMes, economia, valorTotal);
    }
}
