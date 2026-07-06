using Lucrai.Core.Entities;

namespace Lucrai.Core.Interfaces;

public interface IAuditRepository
{
    Task LogAsync(AuditLog log);
    Task<List<AuditLog>> GetAllAsync(string? company);
    Task<List<AuditLog>> GetByEntityAsync(Guid entityId);
    Task<List<AuditLog>> GetByActionAsync(Enums.AuditAction action, string? company);
}
