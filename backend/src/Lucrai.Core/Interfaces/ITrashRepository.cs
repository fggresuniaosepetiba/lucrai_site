using Lucrai.Core.Entities;

namespace Lucrai.Core.Interfaces;

public interface ITrashRepository
{
    Task<List<DeletedItem>> GetAllAsync(string? company);
    Task<List<DeletedItem>> GetAllExpiredAsync(string? company = null);
    Task MoveToTrashAsync(DeletedItem item, string? userName);
    Task<DeletedItem?> RestoreAsync(Guid id, string? userName, string? company = null);
    Task PermanentlyDeleteAsync(Guid id, string? userName, string? company = null);
    Task<int> CleanupAsync(string? company = null);
}
