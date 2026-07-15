using Lucrai.Core.DTOs.BalanceAccounts;
using Lucrai.Core.Entities;
using Lucrai.Core.Enums;
using Lucrai.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lucrai.API.Controllers;

[ApiController]
[Route("api/balance-accounts")]
[Authorize]
public class BalanceAccountsController : ControllerBase
{
    private readonly IBalanceAccountRepository _repo;

    public BalanceAccountsController(IBalanceAccountRepository repo)
    {
        _repo = repo;
    }

    private string Company => HttpContext.Items["Company"] as string ?? "";

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? year, [FromQuery] int? month)
    {
        var items = await _repo.GetAllAsync(Company, year, month);
        var result = items.Select(a => new BalanceAccountResponse(
            a.Id, a.Code, a.Name, a.Nature.ToString(), a.Balance,
            a.Year, a.Month, a.Notes, a.Company, a.CreatedBy, a.CreatedAt, a.UpdatedAt
        ));
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var a = await _repo.GetByIdAsync(id, Company);
        if (a == null)
            return NotFound(new { error = "Conta patrimonial não encontrada" });

        return Ok(new BalanceAccountResponse(
            a.Id, a.Code, a.Name, a.Nature.ToString(), a.Balance,
            a.Year, a.Month, a.Notes, a.Company, a.CreatedBy, a.CreatedAt, a.UpdatedAt
        ));
    }

    [HttpGet("balanco")]
    public async Task<IActionResult> GetBalanco([FromQuery] int? year, [FromQuery] int? month)
    {
        var ativos = await _repo.GetByNatureAsync(AccountNature.Asset, Company, year, month);
        var passivos = await _repo.GetByNatureAsync(AccountNature.Liability, Company, year, month);
        var pl = await _repo.GetByNatureAsync(AccountNature.Equity, Company, year, month);

        var agrupar = (List<BalanceAccount> contas) =>
        {
            var grupos = new Dictionary<string, List<BalanceAccountItem>>();
            foreach (var c in contas)
            {
                var prefixo = c.Code.Split('.').Length > 1 ? c.Code.Split('.')[0] : "outros";
                if (!grupos.ContainsKey(prefixo))
                    grupos[prefixo] = [];
                grupos[prefixo].Add(new BalanceAccountItem(c.Code, c.Name, c.Balance));
            }
            return grupos.Select(g => new BalanceAccountGroup(
                $"Grupo {g.Key}",
                g.Value.Sum(x => x.Saldo),
                g.Value
            )).ToList();
        };

        var response = new BalanceSheetResponse(
            year ?? DateTime.UtcNow.Year,
            month,
            agrupar(ativos),
            agrupar(passivos),
            agrupar(pl),
            ativos.Sum(a => a.Balance),
            passivos.Sum(a => a.Balance),
            pl.Sum(a => a.Balance)
        );

        return Ok(response);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBalanceAccountRequest request)
    {
        if (!Enum.TryParse<AccountNature>(request.Nature, true, out var nature))
            return BadRequest(new { error = "Natureza inválida. Use: Asset, Liability, Equity, Revenue, Expense" });

        var account = new BalanceAccount
        {
            Code = request.Code,
            Name = request.Name,
            Nature = nature,
            Balance = request.Balance,
            Year = request.Year,
            Month = request.Month,
            Notes = request.Notes,
            Company = Company,
            CreatedBy = HttpContext.Items["UserId"] as string ?? ""
        };

        var created = await _repo.CreateAsync(account, HttpContext.Items["UserName"] as string);
        return Ok(new BalanceAccountResponse(
            created.Id, created.Code, created.Name, created.Nature.ToString(), created.Balance,
            created.Year, created.Month, created.Notes, created.Company, created.CreatedBy, created.CreatedAt, created.UpdatedAt
        ));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateBalanceAccountRequest request)
    {
        var existing = await _repo.GetByIdAsync(id, Company);
        if (existing == null)
            return NotFound(new { error = "Conta patrimonial não encontrada" });

        if (!Enum.TryParse<AccountNature>(request.Nature, true, out var nature))
            return BadRequest(new { error = "Natureza inválida. Use: Asset, Liability, Equity, Revenue, Expense" });

        existing.Code = request.Code;
        existing.Name = request.Name;
        existing.Nature = nature;
        existing.Balance = request.Balance;
        existing.Notes = request.Notes;

        var updated = await _repo.UpdateAsync(existing, HttpContext.Items["UserName"] as string);
        return Ok(new BalanceAccountResponse(
            updated.Id, updated.Code, updated.Name, updated.Nature.ToString(), updated.Balance,
            updated.Year, updated.Month, updated.Notes, updated.Company, updated.CreatedBy, updated.CreatedAt, updated.UpdatedAt
        ));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var existing = await _repo.GetByIdAsync(id, Company);
        if (existing == null)
            return NotFound(new { error = "Conta patrimonial não encontrada" });

        await _repo.DeleteAsync(id);
        return Ok(new { message = "Conta patrimonial excluída com sucesso" });
    }
}
