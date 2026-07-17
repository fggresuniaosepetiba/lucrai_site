using Lucrai.Core.DTOs.Transactions;
using Lucrai.Core.Entities;
using Lucrai.Core.Enums;
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
    private readonly ITrashRepository _trashRepo;

    public TransactionsController(ITransactionRepository repo, ITrashRepository trashRepo)
    {
        _repo = repo;
        _trashRepo = trashRepo;
    }

    private string Company => HttpContext.Items["Company"] as string ?? "";
    private string UserId => HttpContext.Items["UserId"] as string ?? "";
    private string UserName => HttpContext.Items["UserName"] as string ?? "";

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var transactions = await _repo.GetAllAsync(Company, UserId);
        var result = transactions.Select(t => new TransactionResponse(
            t.Id, t.DisplayId, t.Type.ToString(), t.Value,
            t.CategoryId, t.CategoryName, t.Description, t.Date,
            t.Observation, t.Company, t.CreatedBy, t.CreatedAt, t.UpdatedAt
        ));
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var t = await _repo.GetByIdAsync(id, Company, UserId);
        if (t == null)
            return NotFound(new { error = "Transação não encontrada" });

        return Ok(new TransactionResponse(
            t.Id, t.DisplayId, t.Type.ToString(), t.Value,
            t.CategoryId, t.CategoryName, t.Description, t.Date,
            t.Observation, t.Company, t.CreatedBy, t.CreatedAt, t.UpdatedAt
        ));
    }

    [HttpGet("type/{type}")]
    public async Task<IActionResult> GetByType(string type)
    {
        if (!Enum.TryParse<Core.Enums.TransactionType>(type, true, out var tType))
            return BadRequest(new { error = "Tipo inválido. Use 'Income' ou 'Expense'" });

        var transactions = await _repo.GetByTypeAsync(tType, Company, UserId);
        var result = transactions.Select(t => new TransactionResponse(
            t.Id, t.DisplayId, t.Type.ToString(), t.Value,
            t.CategoryId, t.CategoryName, t.Description, t.Date,
            t.Observation, t.Company, t.CreatedBy, t.CreatedAt, t.UpdatedAt
        ));
        return Ok(result);
    }

    [HttpGet("month/{year}")]
    public async Task<IActionResult> GetByMonth(int year, [FromQuery] int? month)
    {
        var transactions = await _repo.GetByMonthAsync(year, month, Company, UserId);
        var result = transactions.Select(t => new TransactionResponse(
            t.Id, t.DisplayId, t.Type.ToString(), t.Value,
            t.CategoryId, t.CategoryName, t.Description, t.Date,
            t.Observation, t.Company, t.CreatedBy, t.CreatedAt, t.UpdatedAt
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
            Date = DateTime.SpecifyKind(request.Date, DateTimeKind.Unspecified),
            Observation = request.Observation,
            Company = Company,
            CreatedBy = UserId
        };

        var created = await _repo.CreateAsync(transaction, UserName);
        return Ok(new TransactionResponse(
            created.Id, created.DisplayId, created.Type.ToString(), created.Value,
            created.CategoryId, created.CategoryName, created.Description, created.Date,
            created.Observation, created.Company, created.CreatedBy, created.CreatedAt, created.UpdatedAt
        ));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTransactionRequest request)
    {
        var existing = await _repo.GetByIdAsync(id, Company, UserId);
        if (existing == null)
            return NotFound(new { error = "Transação não encontrada" });

        if (!Enum.TryParse<Core.Enums.TransactionType>(request.Type, true, out var tType))
            return BadRequest(new { error = "Tipo inválido. Use 'Income' ou 'Expense'" });

        existing.Type = tType;
        existing.Value = request.Value;
        existing.CategoryId = request.CategoryId;
        existing.CategoryName = request.CategoryName;
        existing.Description = request.Description;
        existing.Date = DateTime.SpecifyKind(request.Date, DateTimeKind.Unspecified);
        existing.Observation = request.Observation;

        var updated = await _repo.UpdateAsync(existing, UserName);
        return Ok(new TransactionResponse(
            updated.Id, updated.DisplayId, updated.Type.ToString(), updated.Value,
            updated.CategoryId, updated.CategoryName, updated.Description, updated.Date,
            updated.Observation, updated.Company, updated.CreatedBy, updated.CreatedAt, updated.UpdatedAt
        ));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, [FromQuery] string? reason = null)
    {
        var existing = await _repo.GetByIdAsync(id, Company, UserId);
        if (existing == null)
            return NotFound(new { error = "Transação não encontrada" });

        await _trashRepo.MoveToTrashAsync(new DeletedItem
        {
            OriginalId = existing.Id,
            DisplayId = existing.DisplayId,
            EntryType = EntryType.Transaction,
            Type = existing.Type,
            Value = existing.Value,
            CategoryId = existing.CategoryId,
            CategoryName = existing.CategoryName,
            Description = existing.Description,
            Date = existing.Date,
            Observation = existing.Observation,
            CreatedBy = existing.CreatedBy,
            Company = existing.Company,
            Reason = reason ?? "Excluído pelo usuário",
            DeletedAt = DateTime.UtcNow,
            RestoreUntil = DateTime.UtcNow.AddDays(30),
        }, UserName);

        await _repo.DeleteAsync(id);
        return Ok(new { message = "Transação excluída com sucesso" });
    }

    [HttpGet("summary/{year}")]
    public async Task<IActionResult> GetSummary(int year, [FromQuery] int? month)
    {
        var (incomes, expenses, balance) = await _repo.GetSummaryAsync(year, month, Company, UserId);
        var count = (await _repo.GetByMonthAsync(year, month, Company, UserId)).Count;
        return Ok(new TransactionSummaryResponse(incomes, expenses, balance, count));
    }

    [HttpGet("summary/yearly/{year}")]
    public async Task<IActionResult> GetYearlySummary(int year)
    {
        var (incomes, expenses, balance, total) = await _repo.GetYearlySummaryAsync(year, Company, UserId);
        return Ok(new YearlySummaryResponse(year, incomes, expenses, balance, total));
    }

    [HttpGet("balance")]
    public async Task<IActionResult> GetBalance()
    {
        var (incomes, expenses, balance) = await _repo.GetAllBalanceAsync(Company, UserId);
        return Ok(new BalanceResponse(incomes, expenses, balance));
    }
}
