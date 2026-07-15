using Lucrai.Core.Entities;
using Lucrai.Core.Enums;
using Lucrai.Core.Interfaces;
using Lucrai.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Lucrai.Infrastructure.Repositories;

public class DebtRepository : IDebtRepository
{
    private readonly LucraiDbContext _context;

    public DebtRepository(LucraiDbContext context)
    {
        _context = context;
    }

    public async Task<List<Debt>> GetAllAsync(string? company)
    {
        var query = _context.Debts.AsQueryable();
        if (company != null)
            query = query.Where(d => d.Company == company);
        return await query.OrderByDescending(d => d.StartDate).ToListAsync();
    }

    public async Task<Debt?> GetByIdAsync(Guid id, string? company)
    {
        var query = _context.Debts.Where(d => d.Id == id);
        if (company != null)
            query = query.Where(d => d.Company == company);
        return await query.FirstOrDefaultAsync();
    }

    public async Task<Debt> CreateAsync(Debt debt, string? userName)
    {
        debt.DisplayId = await GetNextDisplayIdAsync(debt.Company);
        debt.CreatedAt = DateTime.UtcNow;

        _context.Debts.Add(debt);

        _context.AuditLogs.Add(new AuditLog
        {
            EntityId = debt.Id,
            EntityType = "debt",
            DisplayId = debt.DisplayId,
            Action = AuditAction.Created,
            Description = $"Dívida {debt.DisplayId} criada: {debt.Creditor} - {debt.TotalAmount:C}",
            User = userName ?? "Sistema",
            Company = debt.Company
        });

        await _context.SaveChangesAsync();
        return debt;
    }

    public async Task<Debt> UpdateAsync(Debt debt, string? userName)
    {
        debt.UpdatedAt = DateTime.UtcNow;
        _context.Debts.Update(debt);

        _context.AuditLogs.Add(new AuditLog
        {
            EntityId = debt.Id,
            EntityType = "debt",
            DisplayId = debt.DisplayId,
            Action = AuditAction.Edited,
            Description = $"Dívida {debt.DisplayId} editada: {debt.Creditor}",
            User = userName ?? "Sistema",
            Company = debt.Company
        });

        await _context.SaveChangesAsync();
        return debt;
    }

    public async Task DeleteAsync(Guid id)
    {
        var debt = await _context.Debts.FindAsync(id);
        if (debt != null)
        {
            _context.Debts.Remove(debt);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<string> GetNextDisplayIdAsync(string? company)
    {
        var query = _context.Debts.AsQueryable();
        if (company != null)
            query = query.Where(d => d.Company == company);

        var count = await query.CountAsync();
        return $"#{(count + 1):D3}";
    }

    public async Task<(decimal DividaTotal, decimal DividaCurtoPrazo, decimal DividaLongoPrazo)> GetSummaryAsync(string? company)
    {
        var query = _context.Debts.AsQueryable();
        if (company != null)
            query = query.Where(d => d.Company == company);

        var all = await query.Where(d => d.Status == DebtStatus.Active).ToListAsync();
        var hoje = DateTime.UtcNow;

        var dividaTotal = all.Sum(d => d.OutstandingBalance);
        var dividaCurtoPrazo = all.Where(d => d.EndDate == null || d.EndDate <= hoje.AddYears(1)).Sum(d => d.OutstandingBalance);
        var dividaLongoPrazo = all.Where(d => d.EndDate != null && d.EndDate > hoje.AddYears(1)).Sum(d => d.OutstandingBalance);

        return (dividaTotal, dividaCurtoPrazo, dividaLongoPrazo);
    }
}
