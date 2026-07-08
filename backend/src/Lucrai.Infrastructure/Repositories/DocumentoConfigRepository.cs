using Lucrai.Core.Entities;
using Lucrai.Core.Interfaces;
using Lucrai.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Lucrai.Infrastructure.Repositories;

public class DocumentoConfigRepository : IDocumentoConfigRepository
{
    private readonly LucraiDbContext _context;

    public DocumentoConfigRepository(LucraiDbContext context)
    {
        _context = context;
    }

    public async Task<DocumentoConfiguracao?> GetByCompanyAsync(string company)
    {
        return await _context.Set<DocumentoConfiguracao>()
            .FirstOrDefaultAsync(c => c.Company == company);
    }

    public async Task<DocumentoConfiguracao> UpsertAsync(DocumentoConfiguracao config)
    {
        var existing = await _context.Set<DocumentoConfiguracao>()
            .FirstOrDefaultAsync(c => c.Company == config.Company);

        var now = DateTime.UtcNow;

        if (existing != null)
        {
            existing.CategorizacaoAutomatica = config.CategorizacaoAutomatica;
            existing.CriarLancamentoAutomatico = config.CriarLancamentoAutomatico;
            existing.DiasRetencaoLixeira = config.DiasRetencaoLixeira;
            existing.AtualizadoEm = now;
            _context.Set<DocumentoConfiguracao>().Update(existing);
            await _context.SaveChangesAsync();
            return existing;
        }

        config.Id = Guid.NewGuid();
        config.CriadoEm = now;
        config.AtualizadoEm = now;
        _context.Set<DocumentoConfiguracao>().Add(config);
        await _context.SaveChangesAsync();
        return config;
    }
}
