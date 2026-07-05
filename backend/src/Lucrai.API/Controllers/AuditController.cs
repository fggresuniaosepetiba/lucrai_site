using Lucrai.Core.DTOs.Audit;
using Lucrai.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lucrai.API.Controllers;

[ApiController]
[Route("api/audit")]
[Authorize(Roles = "Admin")]
public class AuditController : ControllerBase
{
    private readonly IAuditRepository _repo;

    public AuditController(IAuditRepository repo)
    {
        _repo = repo;
    }

    private string Company => HttpContext.Items["Company"] as string ?? "";

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var logs = await _repo.GetAllAsync(Company);
        var result = logs.Select(l => new AuditResponse(
            l.Id, l.EntityId, l.EntityType, l.DisplayId,
            l.Action.ToString(), l.Description, l.User,
            l.Company, l.Timestamp, l.Details
        ));
        return Ok(result);
    }

    [HttpGet("entity/{entityId:guid}")]
    public async Task<IActionResult> GetByEntity(Guid entityId)
    {
        var logs = await _repo.GetByEntityAsync(entityId);
        var result = logs.Select(l => new AuditResponse(
            l.Id, l.EntityId, l.EntityType, l.DisplayId,
            l.Action.ToString(), l.Description, l.User,
            l.Company, l.Timestamp, l.Details
        ));
        return Ok(result);
    }

    [HttpGet("action/{actionName}")]
    public async Task<IActionResult> GetByAction(string actionName)
    {
        if (!Enum.TryParse<Core.Enums.AuditAction>(actionName, true, out var aAction))
            return BadRequest(new { error = "Ação inválida" });

        var logs = await _repo.GetByActionAsync(aAction, Company);
        var result = logs.Select(l => new AuditResponse(
            l.Id, l.EntityId, l.EntityType, l.DisplayId,
            l.Action.ToString(), l.Description, l.User,
            l.Company, l.Timestamp, l.Details
        ));
        return Ok(result);
    }
}
