using Lucrai.Core.Entities;
using Lucrai.Core.Enums;
using Lucrai.Core.Interfaces;
using Lucrai.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Lucrai.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly LucraiDbContext _context;
    private readonly UserManager<User> _userManager;

    public UserRepository(LucraiDbContext context, UserManager<User> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    public async Task<List<User>> GetAllAsync()
    {
        return await _context.Users.OrderBy(u => u.Name).ToListAsync();
    }

    public async Task<List<User>> GetActiveAsync()
    {
        return await _context.Users.Where(u => u.Active).OrderBy(u => u.Name).ToListAsync();
    }

    public async Task<User?> GetByIdAsync(string id)
    {
        return await _context.Users.FindAsync(id);
    }

    public async Task<User?> FindByEmailAsync(string email)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<User> CreateAsync(User user, string password)
    {
        var result = await _userManager.CreateAsync(user, password);
        if (!result.Succeeded)
            throw new InvalidOperationException(
                $"Falha ao criar usuário: {string.Join(", ", result.Errors.Select(e => e.Description))}");

        return user;
    }

    public async Task<User> UpdateAsync(User user)
    {
        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            throw new InvalidOperationException(
                $"Falha ao atualizar usuário: {string.Join(", ", result.Errors.Select(e => e.Description))}");

        return user;
    }

    public async Task SoftDeleteAsync(string id, string? reason, string? deletedBy)
    {
        var user = await _context.Users.FindAsync(id)
            ?? throw new InvalidOperationException("Usuário não encontrado");

        user.Active = false;

        _context.AuditLogs.Add(new AuditLog
        {
            EntityId = Guid.Parse(id),
            EntityType = "user",
            DisplayId = user.Email ?? id,
            Action = AuditAction.Deleted,
            Description = $"Usuário {user.Name} desativado",
            User = deletedBy ?? "Sistema",
            Company = user.Company,
            Details = reason
        });

        await _context.SaveChangesAsync();
    }
}
