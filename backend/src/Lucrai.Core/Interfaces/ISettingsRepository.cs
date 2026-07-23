using Lucrai.Core.Entities;

namespace Lucrai.Core.Interfaces;

public interface ISettingsRepository
{
    Task<CompanySettings?> GetAsync(string company, string userId);
    Task<CompanySettings> SaveAsync(CompanySettings settings, string userId);
    Task<CompanySettings> UpdateAsync(string company, string userId, CompanySettings settings);
}
