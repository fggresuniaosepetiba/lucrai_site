using Lucrai.Core.Entities;

namespace Lucrai.Core.Interfaces;

public interface IDismissedAlertRepository
{
    Task<List<string>> GetDismissedIdsAsync(string company);
    Task<bool> IsDismissedAsync(string alertType, string? entityId, string company);
    Task DismissAsync(string alertType, string? entityId, string company, string dismissedBy);
    Task RestoreAsync(string alertType, string? entityId, string company);
    Task<bool> ExistsAsync(string alertType, string? entityId, string company);
}
