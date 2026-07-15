using Lucrai.Core.Entities;
using Lucrai.Core.Enums;
using Lucrai.Core.Interfaces;
using Lucrai.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Lucrai.Infrastructure.Repositories;

public class AccountReceivableRepository : IAccountReceivableRepository
{
    private readonly LucraiDbContext _context;

    public AccountReceivableRepository(LucraiDbContext context)
    {
        _context = context;
    }

    public async Task<List<AccountReceivable>> GetAllAsync(string? company)
    {
        var query = _context.AccountsReceivable.AsQueryable();
        if (company != null)
            query = query.Where(a => a.Company == company);
        return await query.OrderByDescending(a => a.DueDate).ToListAsync();
    }

    public async Task<AccountReceivable?> GetByIdAsync(Guid id, string? company)
    {
        var query = _context.AccountsReceivable.Where(a => a.Id == id);
        if (company != null)
            query = query.Where(a => a.Company == company);
        return await query.FirstOrDefaultAsync();
    }

    public async Task<AccountReceivable> CreateAsync(AccountReceivable receivable, string? userName)
    {
        receivable.DisplayId = await GetNextDisplayIdAsync(receivable.Company);
        receivable.CreatedAt = DateTime.UtcNow;

        _context.AccountsReceivable.Add(receivable);

        _context.AuditLogs.Add(new AuditLog
        {
            EntityId = receivable.Id,
            EntityType = "account_receivable",
            DisplayId = receivable.DisplayId,
            Action = AuditAction.Created,
            Description = $"Conta a Receber {receivable.DisplayId} criada: {receivable.ClientName} - {receivable.Value:C}",
            User = userName ?? "Sistema",
            Company = receivable.Company
        });

        await _context.SaveChangesAsync();
        return receivable;
    }

    public async Task<AccountReceivable> UpdateAsync(AccountReceivable receivable, string? userName)
    {
        receivable.UpdatedAt = DateTime.UtcNow;
        _context.AccountsReceivable.Update(receivable);

        _context.AuditLogs.Add(new AuditLog
        {
            EntityId = receivable.Id,
            EntityType = "account_receivable",
            DisplayId = receivable.DisplayId,
            Action = AuditAction.Edited,
            Description = $"Conta a Receber {receivable.DisplayId} editada: {receivable.ClientName}",
            User = userName ?? "Sistema",
            Company = receivable.Company
        });

        await _context.SaveChangesAsync();
        return receivable;
    }

    public async Task DeleteAsync(Guid id)
    {
        var receivable = await _context.AccountsReceivable.FindAsync(id);
        if (receivable != null)
        {
            _context.AccountsReceivable.Remove(receivable);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<string> GetNextDisplayIdAsync(string? company)
    {
        var query = _context.AccountsReceivable.AsQueryable();
        if (company != null)
            query = query.Where(a => a.Company == company);

        var count = await query.CountAsync();
        return $"#{(count + 1):D3}";
    }

    public async Task<(decimal TotalAReceber, decimal Vencido, decimal AVencer30d, decimal AVencer60d, decimal AVencer90d, decimal Inadimplencia, int PrazoMedioRecebimento)> GetSummaryAsync(string? company)
    {
        var query = _context.AccountsReceivable.AsQueryable();
        if (company != null)
            query = query.Where(a => a.Company == company);

        var hoje = DateTime.UtcNow;
        var em30d = hoje.AddDays(30);
        var em60d = hoje.AddDays(60);
        var em90d = hoje.AddDays(90);

        var all = await query.ToListAsync();

        var totalAReceber = all.Where(a => a.Status != AccountReceivableStatus.Cancelled).Sum(a => a.Value);
        var vencido = all.Where(a => a.Status == AccountReceivableStatus.Overdue || (a.Status == AccountReceivableStatus.Pending && a.DueDate < hoje)).Sum(a => a.Value);
        var aVencer30d = all.Where(a => a.DueDate >= hoje && a.DueDate <= em30d && a.Status == AccountReceivableStatus.Pending).Sum(a => a.Value);
        var aVencer60d = all.Where(a => a.DueDate > em30d && a.DueDate <= em60d && a.Status == AccountReceivableStatus.Pending).Sum(a => a.Value);
        var aVencer90d = all.Where(a => a.DueDate > em60d && a.DueDate <= em90d && a.Status == AccountReceivableStatus.Pending).Sum(a => a.Value);

        var totalVencido = vencido;
        var totalPendente = totalAReceber;
        var inadimplencia = totalPendente > 0 ? (totalVencido / totalPendente) * 100 : 0;

        var recebidos = all.Where(a => a.Status == AccountReceivableStatus.Received && a.ReceivedDate != null).ToList();
        var prazoMedio = recebidos.Count > 0
            ? (int)recebidos.Average(a => (a.ReceivedDate!.Value - a.IssueDate).Days)
            : 0;

        return (totalAReceber, vencido, aVencer30d, aVencer60d, aVencer90d, inadimplencia, prazoMedio);
    }
}
