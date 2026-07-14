using Lucrai.Core.Entities;

namespace Lucrai.Core.Interfaces;

public interface ICategoryRepository
{
    Task<List<Category>> GetAllAsync(string? company, string? userId = null);
    Task<List<Category>> GetByTypeAsync(Enums.TransactionType type, string? company, string? userId = null);
    Task<Category?> GetByIdAsync(Guid id, string? company, string? userId = null);
    Task<Category> CreateAsync(Category category);
    Task<Category> UpdateAsync(Category category);
    Task DeleteAsync(Guid id);
    Task<bool> HasTransactionsAsync(Guid categoryId);
    Task<int> GetTransactionCountAsync(Guid categoryId);
    Task<List<IGrouping<string, Category>>> FindDuplicatesAsync(string? company);
    Task<int> RemoveDuplicatesAsync(string? company);
}
