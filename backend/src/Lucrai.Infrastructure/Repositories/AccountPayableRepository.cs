using Lucrai.Core.Entities;
using Lucrai.Core.Enums;
using Lucrai.Core.Interfaces;
using Lucrai.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Lucrai.Infrastructure.Repositories;

public class AccountPayableRepository : IAccountPayableRepository
{
    private readonly LucraiDbContext _context;

    public AccountPayableRepository(LucraiDbContext context)
    {
        _context = context;
    }

    public async Task<List<AccountPayable>> GetAllAsync(string? company)
    {
        var query = _context.AccountsPayable.AsQueryable();
        if (company != null)
            query = query.Where(a => a.Company == company);
        return await query.OrderByDescending(a => a.DueDate).ToListAsync();
    }

    public async Task<AccountPayable?> GetByIdAsync(Guid id, string? company)
    {
        var query = _context.AccountsPayable.Where(a => a.Id == id);
        if (company != null)
            query = query.Where(a => a.Company == company);
        return await query.FirstOrDefaultAsync();
    }

    public async Task<AccountPayable> CreateAsync(AccountPayable payable, string? userName)
    {
        payable.DisplayId = await GetNextDisplayIdAsync(payable.Company);
        payable.CreatedAt = DateTime.UtcNow;

        _context.AccountsPayable.Add(payable);

        _context.AuditLogs.Add(new AuditLog
        {
            EntityId = payable.Id,
            EntityType = "account_payable",
            DisplayId = payable.DisplayId,
            Action = AuditAction.Created,
            Description = $"Conta a Pagar {payable.DisplayId} criada: {payable.SupplierName} - {payable.Value:C}",
            User = userName ?? "Sistema",
            Company = payable.Company
        });

        await _context.SaveChangesAsync();
        return payable;
    }

    public async Task<AccountPayable> UpdateAsync(AccountPayable payable, string? userName)
    {
        payable.UpdatedAt = DateTime.UtcNow;
        _context.AccountsPayable.Update(payable);

        _context.AuditLogs.Add(new AuditLog
        {
            EntityId = payable.Id,
            EntityType = "account_payable",
            DisplayId = payable.DisplayId,
            Action = AuditAction.Edited,
            Description = $"Conta a Pagar {payable.DisplayId} editada: {payable.SupplierName}",
            User = userName ?? "Sistema",
            Company = payable.Company
        });

        await _context.SaveChangesAsync();
        return payable;
    }

    public async Task DeleteAsync(Guid id)
    {
        var payable = await _context.AccountsPayable.FindAsync(id);
        if (payable != null)
        {
            _context.AccountsPayable.Remove(payable);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<string> GetNextDisplayIdAsync(string? company)
    {
        var query = _context.AccountsPayable.AsQueryable();
        if (company != null)
            query = query.Where(a => a.Company == company);

        var count = await query.CountAsync();
        return $"#{(count + 1):D3}";
    }

    public async Task<(decimal TotalAPagar, decimal Vencido, decimal AVencer30d, decimal AVencer60d, decimal AVencer90d, int PrazoMedioPagamento)> GetSummaryAsync(string? company)
    {
        var query = _context.AccountsPayable.AsQueryable();
        if (company != null)
            query = query.Where(a => a.Company == company);

        var hoje = DateTime.UtcNow;
        var em30d = hoje.AddDays(30);
        var em60d = hoje.AddDays(60);
        var em90d = hoje.AddDays(90);

        var all = await query.ToListAsync();

        var totalAPagar = all.Where(a => a.Status != AccountPayableStatus.Cancelled).Sum(a => a.Value);
        var vencido = all.Where(a => a.Status == AccountPayableStatus.Overdue || (a.Status == AccountPayableStatus.Pending && a.DueDate < hoje)).Sum(a => a.Value);
        var aVencer30d = all.Where(a => a.DueDate >= hoje && a.DueDate <= em30d && a.Status == AccountPayableStatus.Pending).Sum(a => a.Value);
        var aVencer60d = all.Where(a => a.DueDate > em30d && a.DueDate <= em60d && a.Status == AccountPayableStatus.Pending).Sum(a => a.Value);
        var aVencer90d = all.Where(a => a.DueDate > em60d && a.DueDate <= em90d && a.Status == AccountPayableStatus.Pending).Sum(a => a.Value);

        var pagas = all.Where(a => a.Status == AccountPayableStatus.Paid && a.PaymentDate != null).ToList();
        var prazoMedio = pagas.Count > 0
            ? (int)pagas.Average(a => (a.PaymentDate!.Value - a.IssueDate).Days)
            : 0;

        return (totalAPagar, vencido, aVencer30d, aVencer60d, aVencer90d, prazoMedio);
    }
}
