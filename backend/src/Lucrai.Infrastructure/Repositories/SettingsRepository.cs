using System.Text.Json;
using Lucrai.Core.Entities;
using Lucrai.Core.Enums;
using Lucrai.Core.Interfaces;
using Lucrai.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Lucrai.Infrastructure.Repositories;

public class SettingsRepository : ISettingsRepository
{
    private readonly LucraiDbContext _context;
    private readonly IAuditRepository _auditRepo;

    public SettingsRepository(LucraiDbContext context, IAuditRepository auditRepo)
    {
        _context = context;
        _auditRepo = auditRepo;
    }

    public async Task<CompanySettings?> GetAsync(string company, string userId)
    {
        return await _context.CompanySettings
            .FirstOrDefaultAsync(s => s.Company == company && s.UserId == userId);
    }

    public async Task<CompanySettings> SaveAsync(CompanySettings settings, string userId)
    {
        var existing = await GetAsync(settings.Company, userId);
        if (existing != null)
        {
            existing.CompanyName = settings.CompanyName;
            existing.LogoUrl = settings.LogoUrl;
            existing.PrimaryColor = settings.PrimaryColor;
            _context.CompanySettings.Update(existing);
            await _context.SaveChangesAsync();
            await LogAudit(existing, null, userId);
            return existing;
        }

        settings.UserId = userId;
        _context.CompanySettings.Add(settings);
        await _context.SaveChangesAsync();
        await LogAudit(settings, null, userId);
        return settings;
    }

    public async Task<CompanySettings> UpdateAsync(string company, string userId, CompanySettings settings)
    {
        var existing = await GetAsync(company, userId);
        if (existing == null)
        {
            settings.Company = company;
            settings.UserId = userId;
            return await SaveAsync(settings, userId);
        }

        var before = new { existing.CompanyName, existing.LogoUrl, existing.PrimaryColor };

        existing.CompanyName = settings.CompanyName;
        existing.LogoUrl = settings.LogoUrl;
        existing.PrimaryColor = settings.PrimaryColor;

        _context.CompanySettings.Update(existing);
        await _context.SaveChangesAsync();
        await LogAudit(existing, before, userId);
        return existing;
    }

    private async Task LogAudit(CompanySettings saved, object? before, string userName)
    {
        await _auditRepo.LogAsync(new AuditLog
        {
            EntityId = saved.Id,
            EntityType = "settings",
            DisplayId = saved.Company,
            Action = before != null ? AuditAction.Edited : AuditAction.Created,
            Description = $"Configurações {(before != null ? "atualizadas" : "criadas")} para {saved.Company}",
            User = userName,
            Company = saved.Company,
            Details = JsonSerializer.Serialize(new
            {
                before,
                after = new { saved.CompanyName, saved.LogoUrl, saved.PrimaryColor }
            })
        });
    }
}
