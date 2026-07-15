using Lucrai.Core.Entities;
using Lucrai.Core.Enums;
using Lucrai.Core.Interfaces;
using Lucrai.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Lucrai.Infrastructure.Repositories;

public class BalanceAccountRepository : IBalanceAccountRepository
{
    private readonly LucraiDbContext _context;

    public BalanceAccountRepository(LucraiDbContext context)
    {
        _context = context;
    }

    public async Task<List<BalanceAccount>> GetAllAsync(string? company, int? year = null, int? month = null)
    {
        var query = _context.BalanceAccounts.AsQueryable();
        if (company != null)
            query = query.Where(a => a.Company == company);
        if (year.HasValue)
            query = query.Where(a => a.Year == year.Value);
        if (month.HasValue)
            query = query.Where(a => a.Month == month.Value || a.Month == null);

        return await query.OrderBy(a => a.Code).ToListAsync();
    }

    public async Task<BalanceAccount?> GetByIdAsync(Guid id, string? company)
    {
        var query = _context.BalanceAccounts.Where(a => a.Id == id);
        if (company != null)
            query = query.Where(a => a.Company == company);
        return await query.FirstOrDefaultAsync();
    }

    public async Task<List<BalanceAccount>> GetByNatureAsync(AccountNature nature, string? company, int? year = null, int? month = null)
    {
        var query = _context.BalanceAccounts.Where(a => a.Nature == nature);
        if (company != null)
            query = query.Where(a => a.Company == company);
        if (year.HasValue)
            query = query.Where(a => a.Year == year.Value);
        if (month.HasValue)
            query = query.Where(a => a.Month == month.Value || a.Month == null);

        return await query.OrderBy(a => a.Code).ToListAsync();
    }

    public async Task<BalanceAccount> CreateAsync(BalanceAccount account, string? userName)
    {
        account.CreatedAt = DateTime.UtcNow;
        _context.BalanceAccounts.Add(account);

        _context.AuditLogs.Add(new AuditLog
        {
            EntityId = account.Id,
            EntityType = "balance_account",
            DisplayId = account.Code,
            Action = AuditAction.Created,
            Description = $"Conta patrimonial criada: {account.Code} - {account.Name}",
            User = userName ?? "Sistema",
            Company = account.Company
        });

        await _context.SaveChangesAsync();
        return account;
    }

    public async Task<BalanceAccount> UpdateAsync(BalanceAccount account, string? userName)
    {
        account.UpdatedAt = DateTime.UtcNow;
        _context.BalanceAccounts.Update(account);

        _context.AuditLogs.Add(new AuditLog
        {
            EntityId = account.Id,
            EntityType = "balance_account",
            DisplayId = account.Code,
            Action = AuditAction.Edited,
            Description = $"Conta patrimonial editada: {account.Code} - {account.Name}",
            User = userName ?? "Sistema",
            Company = account.Company
        });

        await _context.SaveChangesAsync();
        return account;
    }

    public async Task DeleteAsync(Guid id)
    {
        var account = await _context.BalanceAccounts.FindAsync(id);
        if (account != null)
        {
            _context.BalanceAccounts.Remove(account);
            await _context.SaveChangesAsync();
        }
    }
}
