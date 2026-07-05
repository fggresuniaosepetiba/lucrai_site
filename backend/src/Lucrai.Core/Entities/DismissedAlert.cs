namespace Lucrai.Core.Entities;

public class DismissedAlert
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string AlertType { get; set; } = string.Empty;
    public string? EntityId { get; set; }
    public string Company { get; set; } = string.Empty;
    public string DismissedBy { get; set; } = string.Empty;
    public DateTime DismissedAt { get; set; } = DateTime.UtcNow;
}
