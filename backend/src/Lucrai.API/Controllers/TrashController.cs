using Lucrai.Core.DTOs.Trash;
using Lucrai.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lucrai.API.Controllers;

[ApiController]
[Route("api/trash")]
[Authorize]
public class TrashController : ControllerBase
{
    private readonly ITrashRepository _repo;

    public TrashController(ITrashRepository repo)
    {
        _repo = repo;
    }

    private string Company => HttpContext.Items["Company"] as string ?? "";
    private string UserName => HttpContext.Items["UserName"] as string ?? "";

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await _repo.GetAllAsync(Company);
        var result = items.Select(i => new TrashResponse(
            i.Id, i.OriginalId, i.DisplayId, i.EntryType.ToString(),
            i.Type.ToString(), i.Value, i.CategoryName, i.Description,
            i.Date, i.Amount, i.Category, i.ExpectedDate,
            i.Status?.ToString(), i.Company, i.CreatedBy, i.DeletedAt, i.Reason, i.RestoreUntil
        ));
        return Ok(result);
    }

    [HttpPost("{id:guid}/restore")]
    public async Task<IActionResult> Restore(Guid id)
    {
        var item = await _repo.RestoreAsync(id, UserName, Company);
        if (item == null)
            return NotFound(new { error = "Item não encontrado na lixeira" });

        return Ok(new RestoreResponse(item.Id, "Item restaurado com sucesso"));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> PermanentlyDelete(Guid id)
    {
        await _repo.PermanentlyDeleteAsync(id, UserName, Company);
        return Ok(new { message = "Item excluído permanentemente" });
    }

    [HttpPost("cleanup")]
    public async Task<IActionResult> Cleanup()
    {
        var removed = await _repo.CleanupAsync(Company);
        return Ok(new CleanupResponse(removed));
    }
}
