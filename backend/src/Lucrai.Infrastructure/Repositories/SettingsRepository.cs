using Lucrai.Core.Entities;
using Lucrai.Core.Interfaces;
using Lucrai.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Lucrai.Infrastructure.Repositories;

public class SettingsRepository : ISettingsRepository
{
    private readonly LucraiDbContext _context;

    public SettingsRepository(LucraiDbContext context)
    {
        _context = context;
    }

    public async Task<CompanySettings?> GetAsync(string? company)
    {
        return await _context.CompanySettings
            .FirstOrDefaultAsync(s => company == null || s.Company == company);
    }

    public async Task<CompanySettings> SaveAsync(CompanySettings settings)
    {
        var existing = await GetAsync(settings.Company);
        if (existing != null)
        {
            existing.CompanyName = settings.CompanyName;
            existing.LogoUrl = settings.LogoUrl;
            existing.PrimaryColor = settings.PrimaryColor;
            _context.CompanySettings.Update(existing);
            await _context.SaveChangesAsync();
            return existing;
        }

        _context.CompanySettings.Add(settings);
        await _context.SaveChangesAsync();
        return settings;
    }

    public async Task<CompanySettings> UpdateAsync(string? company, CompanySettings settings)
    {
        var existing = await GetAsync(company);
        if (existing == null)
        {
            settings.Company = company ?? settings.Company;
            return await SaveAsync(settings);
        }

        existing.CompanyName = settings.CompanyName;
        existing.LogoUrl = settings.LogoUrl;
        existing.PrimaryColor = settings.PrimaryColor;

        _context.CompanySettings.Update(existing);
        await _context.SaveChangesAsync();
        return existing;
    }
}
