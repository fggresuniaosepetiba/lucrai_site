using System.Text.Json;
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

    public async Task<List<DocumentoFinanceiro>> GetByStatusAsync(string? company, string status)
    {
        var query = _context.Documentos.AsQueryable();
        if (company != null)
            query = query.Where(d => d.Company == company);
        return await query
            .Where(d => d.Status == status)
            .OrderByDescending(d => d.CriadoEm)
            .ToListAsync();
    }

    public async Task MoveToTrashAsync(Guid id, string motivo, string excluidoPor, string excluidoPorNome)
    {
        var doc = await _context.Documentos.FindAsync(id)
            ?? throw new KeyNotFoundException("Documento não encontrado");

        var now = DateTime.UtcNow;
        doc.Status = "EXCLUIDO";
        doc.MotivoExclusao = motivo;
        doc.ExcluidoPor = excluidoPor;
        doc.ExcluidoEm = now;
        doc.AtualizadoEm = now;

        var config = await _context.Set<DocumentoConfiguracao>()
            .FirstOrDefaultAsync(c => c.Company == doc.Company);
        var diasRetencao = config?.DiasRetencaoLixeira ?? 30;

        var snapshotJson = JsonSerializer.Serialize(new
        {
            doc.NomeArquivoOriginal,
            doc.TipoArquivo,
            doc.TamanhoBytes,
            doc.Status,
            doc.ValorExtraido,
            doc.DataExtraida,
            doc.FavorecidoExtraido,
            doc.EmitenteExtraido,
            doc.DescricaoExtraida,
            doc.TipoMovimentacaoSugerido,
            doc.CategoriaSugeridaId,
            doc.ConfiancaExtracao,
            doc.LancamentoId
        });

        var trashItem = new DocumentoTrashItem
        {
            DocumentoId = doc.Id,
            Company = doc.Company,
            NomeArquivoOriginal = doc.NomeArquivoOriginal,
            TipoArquivo = doc.TipoArquivo,
            TamanhoBytes = doc.TamanhoBytes,
            StatusOriginal = doc.Status,
            MotivoExclusao = motivo,
            ExcluidoPor = excluidoPorNome,
            ExcluidoEm = now,
            ExpiracaoEm = now.AddDays(diasRetencao),
            SnapshotJson = snapshotJson
        };

        _context.Set<DocumentoTrashItem>().Add(trashItem);
        await _context.SaveChangesAsync();
    }

    public async Task RestoreFromTrashAsync(Guid id)
    {
        var doc = await _context.Documentos.FindAsync(id)
            ?? throw new KeyNotFoundException("Documento não encontrado");

        var trashItem = await _context.Set<DocumentoTrashItem>()
            .FirstOrDefaultAsync(t => t.DocumentoId == id)
            ?? throw new KeyNotFoundException("Item não encontrado na lixeira");

        var now = DateTime.UtcNow;
        doc.Status = trashItem.StatusOriginal;
        doc.MotivoExclusao = null;
        doc.ExcluidoPor = null;
        doc.ExcluidoEm = null;
        doc.AtualizadoEm = now;

        _context.Set<DocumentoTrashItem>().Remove(trashItem);
        await _context.SaveChangesAsync();
    }

    public async Task PermanentDeleteAsync(Guid id)
    {
        var doc = await _context.Documentos.FindAsync(id);
        var trashItem = await _context.Set<DocumentoTrashItem>()
            .FirstOrDefaultAsync(t => t.DocumentoId == id);

        if (doc != null)
            _context.Documentos.Remove(doc);
        if (trashItem != null)
            _context.Set<DocumentoTrashItem>().Remove(trashItem);

        await _context.SaveChangesAsync();
    }

    public async Task<List<DocumentoTrashItem>> GetAllTrashItemsAsync(string? company)
    {
        var query = _context.Set<DocumentoTrashItem>().AsQueryable();
        if (company != null)
            query = query.Where(t => t.Company == company);
        return await query
            .OrderByDescending(t => t.ExcluidoEm)
            .ToListAsync();
    }

    public async Task<DocumentoTrashItem?> GetTrashItemAsync(Guid documentoId)
    {
        return await _context.Set<DocumentoTrashItem>()
            .FirstOrDefaultAsync(t => t.DocumentoId == documentoId);
    }

    public async Task<int> CleanupTrashAsync(string? company = null)
    {
        var query = _context.Set<DocumentoTrashItem>()
            .Where(t => t.ExpiracaoEm < DateTime.UtcNow);
        if (company != null)
            query = query.Where(t => t.Company == company);
        var expired = await query.ToListAsync();

        if (expired.Count == 0)
            return 0;

        var docIds = expired.Select(t => t.DocumentoId).ToList();
        var docs = await _context.Documentos
            .Where(d => docIds.Contains(d.Id))
            .ToListAsync();

        _context.Documentos.RemoveRange(docs);
        _context.Set<DocumentoTrashItem>().RemoveRange(expired);
        await _context.SaveChangesAsync();

        return expired.Count;
    }
}
