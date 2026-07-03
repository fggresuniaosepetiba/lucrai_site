using Lucrai.Core.Entities;
using Lucrai.Core.Enums;
using Lucrai.Core.Interfaces;
using Lucrai.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Lucrai.Infrastructure.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly LucraiDbContext _context;

    public CategoryRepository(LucraiDbContext context)
    {
        _context = context;
    }

    public async Task<List<Category>> GetAllAsync(string company)
    {
        return await _context.Categories
            .Where(c => c.Company == company)
            .OrderBy(c => c.Type)
            .ThenBy(c => c.Name)
            .ToListAsync();
    }

    public async Task<List<Category>> GetByTypeAsync(TransactionType type, string company)
    {
        return await _context.Categories
            .Where(c => c.Company == company && c.Type == type)
            .OrderBy(c => c.Name)
            .ToListAsync();
    }

    public async Task<Category?> GetByIdAsync(Guid id)
    {
        return await _context.Categories.FindAsync(id);
    }

    public async Task<Category> CreateAsync(Category category)
    {
        category.CreatedAt = DateTime.UtcNow;
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();
        return category;
    }

    public async Task<Category> UpdateAsync(Category category)
    {
        _context.Categories.Update(category);
        await _context.SaveChangesAsync();
        return category;
    }

    public async Task DeleteAsync(Guid id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category != null)
        {
            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> HasTransactionsAsync(Guid categoryId)
    {
        return await _context.Transactions.AnyAsync(t => t.CategoryId == categoryId);
    }

    public async Task<int> GetTransactionCountAsync(Guid categoryId)
    {
        return await _context.Transactions.CountAsync(t => t.CategoryId == categoryId);
    }

    public async Task<List<IGrouping<string, Category>>> FindDuplicatesAsync(string company)
    {
        var categories = await _context.Categories
            .Where(c => c.Company == company)
            .ToListAsync();

        var normalized = categories
            .GroupBy(c => $"{c.Name.Trim().ToLowerInvariant()}|{c.Type}")
            .Where(g => g.Count() > 1)
            .ToList();

        return normalized;
    }

    public async Task<int> RemoveDuplicatesAsync(string company)
    {
        var duplicates = await FindDuplicatesAsync(company);
        var removedCount = 0;

        foreach (var group in duplicates)
        {
            var ordered = group.OrderBy(c => c.CreatedAt).ToList();
            var keep = ordered.First();
            var toRemove = ordered.Skip(1);

            foreach (var dup in toRemove)
            {
                var transactions = await _context.Transactions
                    .Where(t => t.CategoryId == dup.Id)
                    .ToListAsync();

                foreach (var tx in transactions)
                {
                    tx.CategoryId = keep.Id;
                    tx.CategoryName = keep.Name;
                }

                _context.Categories.Remove(dup);
                removedCount++;
            }
        }

        await _context.SaveChangesAsync();
        return removedCount;
    }
}
