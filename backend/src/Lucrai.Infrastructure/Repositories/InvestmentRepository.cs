using Lucrai.Core.Entities;
using Lucrai.Core.Enums;
using Lucrai.Core.Interfaces;
using Lucrai.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Lucrai.Infrastructure.Repositories;

public class InvestmentRepository : IInvestmentRepository
{
    private readonly LucraiDbContext _context;

    public InvestmentRepository(LucraiDbContext context)
    {
        _context = context;
    }

    public async Task<List<Investment>> GetAllAsync(string? company)
    {
        var query = _context.Investments.AsQueryable();
        if (company != null)
            query = query.Where(i => i.Company == company);
        return await query.OrderByDescending(i => i.StartDate).ToListAsync();
    }

    public async Task<Investment?> GetByIdAsync(Guid id, string? company)
    {
        var query = _context.Investments.Where(i => i.Id == id);
        if (company != null)
            query = query.Where(i => i.Company == company);
        return await query.FirstOrDefaultAsync();
    }

    public async Task<Investment> CreateAsync(Investment investment, string? userName)
    {
        investment.DisplayId = await GetNextDisplayIdAsync(investment.Company);
        investment.CreatedAt = DateTime.UtcNow;

        _context.Investments.Add(investment);

        _context.AuditLogs.Add(new AuditLog
        {
            EntityId = investment.Id,
            EntityType = "investment",
            DisplayId = investment.DisplayId,
            Action = AuditAction.Created,
            Description = $"Investimento {investment.DisplayId} criado: {investment.Name} - {investment.InvestedAmount:C}",
            User = userName ?? "Sistema",
            Company = investment.Company
        });

        await _context.SaveChangesAsync();
        return investment;
    }

    public async Task<Investment> UpdateAsync(Investment investment, string? userName)
    {
        investment.UpdatedAt = DateTime.UtcNow;
        _context.Investments.Update(investment);

        _context.AuditLogs.Add(new AuditLog
        {
            EntityId = investment.Id,
            EntityType = "investment",
            DisplayId = investment.DisplayId,
            Action = AuditAction.Edited,
            Description = $"Investimento {investment.DisplayId} editado: {investment.Name}",
            User = userName ?? "Sistema",
            Company = investment.Company
        });

        await _context.SaveChangesAsync();
        return investment;
    }

    public async Task DeleteAsync(Guid id, string company)
    {
        var investment = await _context.Investments.FirstOrDefaultAsync(i => i.Id == id && i.Company == company);
        if (investment != null)
        {
            _context.Investments.Remove(investment);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<string> GetNextDisplayIdAsync(string? company)
    {
        var query = _context.Investments.AsQueryable();
        if (company != null)
            query = query.Where(i => i.Company == company);

        var count = await query.CountAsync();
        return $"#{(count + 1):D3}";
    }

    public async Task<(decimal TotalInvestido, int ProjetosAtivos, decimal? ROIMedio)> GetSummaryAsync(string? company)
    {
        var query = _context.Investments.AsQueryable();
        if (company != null)
            query = query.Where(i => i.Company == company);

        var all = await query.ToListAsync();

        var totalInvestido = all.Sum(i => i.InvestedAmount);
        var projetosAtivos = all.Count(i => i.Status == InvestmentStatus.Active);
        var comROI = all.Where(i => i.ActualROI.HasValue).ToList();
        var roiMedio = comROI.Count > 0 ? comROI.Average(i => i.ActualROI!.Value) : (decimal?)null;

        return (totalInvestido, projetosAtivos, roiMedio);
    }
}
