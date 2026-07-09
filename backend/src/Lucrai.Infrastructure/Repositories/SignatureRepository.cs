using Lucrai.Core.Entities;
using Lucrai.Core.Interfaces;
using Lucrai.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Lucrai.Infrastructure.Repositories;

public class SignatureRepository : ISignatureRepository
{
    private readonly LucraiDbContext _context;

    public SignatureRepository(LucraiDbContext context)
    {
        _context = context;
    }

    public async Task<SignatureConfig?> GetAsync(string? company)
    {
        return await _context.SignatureConfigs
            .FirstOrDefaultAsync(s => company == null || s.Company == company);
    }

    public async Task<SignatureConfig> SaveAsync(SignatureConfig config)
    {
        var existing = await GetAsync(config.Company);
        if (existing != null)
        {
            existing.ImagemBase64 = config.ImagemBase64;
            existing.NomeResponsavel = config.NomeResponsavel;
            existing.Cargo = config.Cargo;
            existing.PermitirUso = config.PermitirUso;
            await _context.SaveChangesAsync();
            return existing;
        }

        _context.SignatureConfigs.Add(config);
        await _context.SaveChangesAsync();
        return config;
    }
}
