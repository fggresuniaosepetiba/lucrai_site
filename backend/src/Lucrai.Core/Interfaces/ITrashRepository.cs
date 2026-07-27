using Lucrai.Core.Entities;

namespace Lucrai.Core.Interfaces;

public interface ITrashRepository
{
    Task<List<DeletedItem>> GetAllAsync(string company);
    Task<List<DeletedItem>> GetAllExpiredAsync(string company);
    Task MoveToTrashAsync(DeletedItem item, string? userName);
    Task<DeletedItem?> RestoreAsync(Guid id, string? userName, string company);
    Task PermanentlyDeleteAsync(Guid id, string? userName, string company);
    Task<int> CleanupAsync(string company);
}
