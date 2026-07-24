using Lucrai.Core.Entities;
using Lucrai.Core.Interfaces;
using Lucrai.Core.Services;
using Lucrai.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Lucrai.Infrastructure.Repositories;

public class ReciboRepository : IReciboRepository
{
    private readonly LucraiDbContext _context;

    public ReciboRepository(LucraiDbContext context)
    {
        _context = context;
    }

    public async Task<List<Recibo>> GetAllAsync(string company)
    {
        return await _context.Recibos
            .Where(r => r.Company == company && r.ExcluidoEm == null)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<Recibo?> GetByIdAsync(Guid id, string company)
    {
        return await _context.Recibos
            .FirstOrDefaultAsync(r => r.Id == id && r.Company == company && r.ExcluidoEm == null);
    }

    public async Task<Recibo> CreateAsync(Recibo recibo)
    {
        recibo.Numero = await GetProximoNumeroAsync(recibo.Company);
        recibo.DisplayId = await GetProximoDisplayIdAsync(recibo.Company);
        recibo.ValorPorExtenso = ValorPorExtensoHelper.Converter(recibo.Valor);

        _context.Recibos.Add(recibo);
        await _context.SaveChangesAsync();
        return recibo;
    }

    public async Task<Recibo> UpdateAsync(Recibo recibo)
    {
        recibo.ValorPorExtenso = ValorPorExtensoHelper.Converter(recibo.Valor);
        recibo.UpdatedAt = DateTime.UtcNow;

        _context.Recibos.Update(recibo);
        await _context.SaveChangesAsync();
        return recibo;
    }

    public async Task DeleteAsync(Guid id, string company, string? deletedBy = null)
    {
        var recibo = await _context.Recibos
            .FirstOrDefaultAsync(r => r.Id == id && r.Company == company);
        if (recibo == null) return;

        var now = DateTime.UtcNow;
        recibo.ExcluidoEm = now;
        recibo.ExcluidoPor = deletedBy;
        recibo.ExpiracaoEm = now.AddDays(30);
        recibo.UpdatedAt = now;
        await _context.SaveChangesAsync();
    }

    public async Task<Recibo?> GetByLancamentoIdAsync(Guid lancamentoId, string company)
    {
        return await _context.Recibos
            .FirstOrDefaultAsync(r => r.LancamentoId == lancamentoId && r.Company == company);
    }

    public async Task<List<Recibo>> GetTrashAsync(string company)
    {
        return await _context.Recibos
            .Where(r => r.Company == company && r.ExcluidoEm != null)
            .OrderByDescending(r => r.ExcluidoEm)
            .ToListAsync();
    }

    public async Task<Recibo?> GetByIdIncludingDeletedAsync(Guid id, string company)
    {
        return await _context.Recibos
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(r => r.Id == id && r.Company == company);
    }

    public async Task RestoreFromTrashAsync(Recibo recibo)
    {
        recibo.ExcluidoEm = null;
        recibo.ExcluidoPor = null;
        recibo.ExpiracaoEm = null;
        recibo.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

    public async Task PermanentDeleteAsync(Recibo recibo)
    {
        _context.Recibos.Remove(recibo);
        await _context.SaveChangesAsync();
    }

    public async Task CleanupTrashAsync()
    {
        var expired = await _context.Recibos
            .Where(r => r.ExpiracaoEm != null && r.ExpiracaoEm <= DateTime.UtcNow)
            .ToListAsync();

        if (expired.Count > 0)
        {
            _context.Recibos.RemoveRange(expired);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<string> GetProximoNumeroAsync(string company)
    {
        var year = DateTime.UtcNow.Year;
        var prefix = $"REC-{year}-";

        var maxNumero = await _context.Recibos
            .Where(r => r.Company == company && r.Numero.StartsWith(prefix))
            .Select(r => r.Numero)
            .OrderByDescending(n => n)
            .FirstOrDefaultAsync();

        if (maxNumero == null)
            return $"{prefix}000001";

        var sequencial = int.Parse(maxNumero[^6..]) + 1;
        return $"{prefix}{sequencial:D6}";
    }

    private async Task<string> GetProximoDisplayIdAsync(string company)
    {
        var maxDisplayId = await _context.Recibos
            .Where(r => r.Company == company && r.DisplayId.StartsWith("RE-"))
            .Select(r => r.DisplayId)
            .OrderByDescending(d => d)
            .FirstOrDefaultAsync();

        if (maxDisplayId == null)
            return "RE-00001";

        var sequencial = int.Parse(maxDisplayId[3..]) + 1;
        return $"RE-{sequencial:D5}";
    }
}
