using Lucrai.Core.DTOs.Transactions;
using Lucrai.Core.Entities;
using Lucrai.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lucrai.API.Controllers;

[ApiController]
[Route("api/transactions")]
[Authorize]
public class TransactionsController : ControllerBase
{
    private readonly ITransactionRepository _repo;

    public TransactionsController(ITransactionRepository repo)
    {
        _repo = repo;
    }

    private string Company => HttpContext.Items["Company"] as string ?? "";
    private string UserName => HttpContext.Items["UserName"] as string ?? "";

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var transactions = await _repo.GetAllAsync(Company);
        var result = transactions.Select(t => new TransactionResponse(
            t.Id, t.DisplayId, t.Type.ToString(), t.Value,
            t.CategoryId, t.CategoryName, t.Description, t.Date,
            t.Observation, t.Company, t.CreatedAt, t.UpdatedAt
        ));
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var t = await _repo.GetByIdAsync(id);
        if (t == null || t.Company != Company)
            return NotFound(new { error = "Transação não encontrada" });

        return Ok(new TransactionResponse(
            t.Id, t.DisplayId, t.Type.ToString(), t.Value,
            t.CategoryId, t.CategoryName, t.Description, t.Date,
            t.Observation, t.Company, t.CreatedAt, t.UpdatedAt
        ));
    }

    [HttpGet("type/{type}")]
    public async Task<IActionResult> GetByType(string type)
    {
        if (!Enum.TryParse<Core.Enums.TransactionType>(type, true, out var tType))
            return BadRequest(new { error = "Tipo inválido. Use 'Income' ou 'Expense'" });

        var transactions = await _repo.GetByTypeAsync(tType, Company);
        var result = transactions.Select(t => new TransactionResponse(
            t.Id, t.DisplayId, t.Type.ToString(), t.Value,
            t.CategoryId, t.CategoryName, t.Description, t.Date,
            t.Observation, t.Company, t.CreatedAt, t.UpdatedAt
        ));
        return Ok(result);
    }

    [HttpGet("month/{year}")]
    public async Task<IActionResult> GetByMonth(int year, [FromQuery] int? month)
    {
        var transactions = await _repo.GetByMonthAsync(year, month, Company);
        var result = transactions.Select(t => new TransactionResponse(
            t.Id, t.DisplayId, t.Type.ToString(), t.Value,
            t.CategoryId, t.CategoryName, t.Description, t.Date,
            t.Observation, t.Company, t.CreatedAt, t.UpdatedAt
        ));
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTransactionRequest request)
    {
        if (!Enum.TryParse<Core.Enums.TransactionType>(request.Type, true, out var tType))
            return BadRequest(new { error = "Tipo inválido. Use 'Income' ou 'Expense'" });

        var transaction = new Transaction
        {
            Type = tType,
            Value = request.Value,
            CategoryId = request.CategoryId,
            CategoryName = request.CategoryName,
            Description = request.Description,
            Date = request.Date,
            Observation = request.Observation,
            Company = Company
        };

        var created = await _repo.CreateAsync(transaction, UserName);
        return Ok(new TransactionResponse(
            created.Id, created.DisplayId, created.Type.ToString(), created.Value,
            created.CategoryId, created.CategoryName, created.Description, created.Date,
            created.Observation, created.Company, created.CreatedAt, created.UpdatedAt
        ));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTransactionRequest request)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing == null || existing.Company != Company)
            return NotFound(new { error = "Transação não encontrada" });

        if (!Enum.TryParse<Core.Enums.TransactionType>(request.Type, true, out var tType))
            return BadRequest(new { error = "Tipo inválido. Use 'Income' ou 'Expense'" });

        existing.Type = tType;
        existing.Value = request.Value;
        existing.CategoryId = request.CategoryId;
        existing.CategoryName = request.CategoryName;
        existing.Description = request.Description;
        existing.Date = request.Date;
        existing.Observation = request.Observation;

        var updated = await _repo.UpdateAsync(existing, UserName);
        return Ok(new TransactionResponse(
            updated.Id, updated.DisplayId, updated.Type.ToString(), updated.Value,
            updated.CategoryId, updated.CategoryName, updated.Description, updated.Date,
            updated.Observation, updated.Company, updated.CreatedAt, updated.UpdatedAt
        ));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing == null || existing.Company != Company)
            return NotFound(new { error = "Transação não encontrada" });

        await _repo.DeleteAsync(id);
        return Ok(new { message = "Transação excluída com sucesso" });
    }

    [HttpGet("summary/{year}")]
    public async Task<IActionResult> GetSummary(int year, [FromQuery] int? month)
    {
        var (incomes, expenses, balance) = await _repo.GetSummaryAsync(year, month, Company);
        var count = (await _repo.GetByMonthAsync(year, month, Company)).Count;
        return Ok(new TransactionSummaryResponse(incomes, expenses, balance, count));
    }

    [HttpGet("summary/yearly/{year}")]
    public async Task<IActionResult> GetYearlySummary(int year)
    {
        var (incomes, expenses, balance, total) = await _repo.GetYearlySummaryAsync(year, Company);
        return Ok(new YearlySummaryResponse(year, incomes, expenses, balance, total));
    }

    [HttpGet("balance")]
    public async Task<IActionResult> GetBalance()
    {
        var (incomes, expenses, balance) = await _repo.GetAllBalanceAsync(Company);
        return Ok(new BalanceResponse(incomes, expenses, balance));
    }
}
