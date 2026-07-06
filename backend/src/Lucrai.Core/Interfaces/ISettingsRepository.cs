using Lucrai.Core.Entities;

namespace Lucrai.Core.Interfaces;

public interface ISettingsRepository
{
    Task<CompanySettings?> GetAsync(string? company);
    Task<CompanySettings> SaveAsync(CompanySettings settings);
    Task<CompanySettings> UpdateAsync(string? company, CompanySettings settings);
}
