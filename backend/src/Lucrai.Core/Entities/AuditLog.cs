using Lucrai.Core.Enums;

namespace Lucrai.Core.Entities;

public class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EntityId { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public string DisplayId { get; set; } = string.Empty;
    public AuditAction Action { get; set; }
    public string Description { get; set; } = string.Empty;
    public string User { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string? Details { get; set; }
}
