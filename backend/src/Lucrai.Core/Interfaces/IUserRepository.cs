using Lucrai.Core.Entities;

namespace Lucrai.Core.Interfaces;

public interface IUserRepository
{
    Task<List<User>> GetAllAsync();
    Task<List<User>> GetActiveAsync();
    Task<User?> GetByIdAsync(string id);
    Task<User?> FindByEmailAsync(string email);
    Task<User> CreateAsync(User user, string password);
    Task<User> UpdateAsync(User user);
    Task SoftDeleteAsync(string id, string? reason, string? deletedBy);
}
