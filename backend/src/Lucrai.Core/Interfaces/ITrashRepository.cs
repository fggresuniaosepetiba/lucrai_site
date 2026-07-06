using Lucrai.Core.Entities;

namespace Lucrai.Core.Interfaces;

public interface ITrashRepository
{
    Task<List<DeletedItem>> GetAllAsync(string? company);
    Task<List<DeletedItem>> GetAllExpiredAsync();
    Task MoveToTrashAsync(DeletedItem item, string? userName);
    Task<DeletedItem?> RestoreAsync(Guid id, string? userName);
    Task PermanentlyDeleteAsync(Guid id, string? userName);
    Task<int> CleanupAsync();
}
