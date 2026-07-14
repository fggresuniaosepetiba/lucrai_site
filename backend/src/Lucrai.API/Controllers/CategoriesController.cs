using Lucrai.Core.DTOs.Categories;
using Lucrai.Core.Entities;
using Lucrai.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lucrai.API.Controllers;

[ApiController]
[Route("api/categories")]
[Authorize]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryRepository _repo;

    public CategoriesController(ICategoryRepository repo)
    {
        _repo = repo;
    }

    private string Company => HttpContext.Items["Company"] as string ?? "";
    private string UserId => HttpContext.Items["UserId"] as string ?? "";

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var categories = await _repo.GetAllAsync(Company, UserId);
        var result = categories.Select(c => new CategoryResponse(
            c.Id, c.Name, c.Color, c.Icon, c.Type.ToString(),
            c.Company, c.CreatedBy, c.CreatedAt, 0
        ));
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var c = await _repo.GetByIdAsync(id, Company, UserId);
        if (c == null)
            return NotFound(new { error = "Categoria não encontrada" });

        var count = await _repo.GetTransactionCountAsync(id);
        return Ok(new CategoryResponse(
            c.Id, c.Name, c.Color, c.Icon, c.Type.ToString(),
            c.Company, c.CreatedBy, c.CreatedAt, count
        ));
    }

    [HttpGet("type/{type}")]
    public async Task<IActionResult> GetByType(string type)
    {
        if (!Enum.TryParse<Core.Enums.TransactionType>(type, true, out var tType))
            return BadRequest(new { error = "Tipo inválido. Use 'Income' ou 'Expense'" });

        var categories = await _repo.GetByTypeAsync(tType, Company, UserId);
        var result = categories.Select(c => new CategoryResponse(
            c.Id, c.Name, c.Color, c.Icon, c.Type.ToString(),
            c.Company, c.CreatedBy, c.CreatedAt, 0
        ));
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCategoryRequest request)
    {
        if (!Enum.TryParse<Core.Enums.TransactionType>(request.Type, true, out var tType))
            return BadRequest(new { error = "Tipo inválido. Use 'Income' ou 'Expense'" });

        var category = new Category
        {
            Name = request.Name,
            Color = request.Color,
            Icon = request.Icon,
            Type = tType,
            Company = Company,
            CreatedBy = UserId
        };

        var created = await _repo.CreateAsync(category);
        return Ok(new CategoryResponse(
            created.Id, created.Name, created.Color, created.Icon,
            created.Type.ToString(), created.Company, created.CreatedBy, created.CreatedAt, 0
        ));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCategoryRequest request)
    {
        var existing = await _repo.GetByIdAsync(id, Company, UserId);
        if (existing == null)
            return NotFound(new { error = "Categoria não encontrada" });

        if (request.Name != null) existing.Name = request.Name;
        if (request.Color != null) existing.Color = request.Color;
        if (request.Icon != null) existing.Icon = request.Icon;
        if (request.Type != null && Enum.TryParse<Core.Enums.TransactionType>(request.Type, true, out var tType))
            existing.Type = tType;

        var updated = await _repo.UpdateAsync(existing);
        var count = await _repo.GetTransactionCountAsync(id);
        return Ok(new CategoryResponse(
            updated.Id, updated.Name, updated.Color, updated.Icon,
            updated.Type.ToString(), updated.Company, updated.CreatedBy, updated.CreatedAt, count
        ));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var existing = await _repo.GetByIdAsync(id, Company, UserId);
        if (existing == null)
            return NotFound(new { error = "Categoria não encontrada" });

        var hasTransactions = await _repo.HasTransactionsAsync(id);
        if (hasTransactions)
            return BadRequest(new { error = "Categoria não pode ser excluída pois possui transações vinculadas" });

        await _repo.DeleteAsync(id);
        return Ok(new { message = "Categoria excluída com sucesso" });
    }

    [HttpPost("remove-duplicates")]
    public async Task<IActionResult> RemoveDuplicates()
    {
        var removed = await _repo.RemoveDuplicatesAsync(Company);
        return Ok(new RemoveDuplicatesResponse(removed));
    }
}
