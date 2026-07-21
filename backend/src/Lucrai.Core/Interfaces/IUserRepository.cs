using Lucrai.Core.Entities;

namespace Lucrai.Core.Interfaces;

public interface IUserRepository
{
    Task<List<User>> GetAllAsync(string company);
    Task<List<User>> GetActiveAsync(string company);
    Task<User?> GetByIdAsync(string id, string company);
    Task<User?> FindByEmailAsync(string email);
    Task<User> CreateAsync(User user, string password);
    Task<User> UpdateAsync(User user);
    Task SoftDeleteAsync(string id, string? reason, string? deletedBy, string company);
}
