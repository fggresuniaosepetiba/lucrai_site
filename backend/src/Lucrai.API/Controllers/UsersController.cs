using Lucrai.Core.DTOs.Users;
using Lucrai.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lucrai.API.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly IUserRepository _repo;

    public UsersController(IUserRepository repo)
    {
        _repo = repo;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await _repo.GetAllAsync();
        var result = users.Select(u => new UserResponse(
            u.Id, u.Name, u.Email ?? "", u.Role.ToString(),
            u.Company, u.Avatar, u.Active, u.CreatedAt
        ));
        return Ok(result);
    }

    [HttpGet("active")]
    public async Task<IActionResult> GetActive()
    {
        var users = await _repo.GetActiveAsync();
        var result = users.Select(u => new UserResponse(
            u.Id, u.Name, u.Email ?? "", u.Role.ToString(),
            u.Company, u.Avatar, u.Active, u.CreatedAt
        ));
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var user = await _repo.GetByIdAsync(id);
        if (user == null)
            return NotFound(new { error = "Usuário não encontrado" });

        return Ok(new UserResponse(
            user.Id, user.Name, user.Email ?? "", user.Role.ToString(),
            user.Company, user.Avatar, user.Active, user.CreatedAt
        ));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
    {
        var existing = await _repo.FindByEmailAsync(request.Email);
        if (existing != null)
            return BadRequest(new { error = "Email já cadastrado" });

        var user = new Core.Entities.User
        {
            Name = request.Name,
            Email = request.Email,
            UserName = request.Email,
            Role = Enum.TryParse<Core.Enums.UserRole>(request.Role, true, out var role) ? role : Core.Enums.UserRole.Viewer,
            Avatar = request.Avatar
        };

        var created = await _repo.CreateAsync(user, request.Password);
        return Ok(new UserResponse(
            created.Id, created.Name, created.Email ?? "", created.Role.ToString(),
            created.Company, created.Avatar, created.Active, created.CreatedAt
        ));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateUserRequest request)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing == null)
            return NotFound(new { error = "Usuário não encontrado" });

        if (request.Name != null) existing.Name = request.Name;
        if (request.Role != null && Enum.TryParse<Core.Enums.UserRole>(request.Role, true, out var role))
            existing.Role = role;
        if (request.Avatar != null) existing.Avatar = request.Avatar;
        if (request.Active.HasValue) existing.Active = request.Active.Value;

        var updated = await _repo.UpdateAsync(existing);
        return Ok(new UserResponse(
            updated.Id, updated.Name, updated.Email ?? "", updated.Role.ToString(),
            updated.Company, updated.Avatar, updated.Active, updated.CreatedAt
        ));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> SoftDelete(string id, [FromQuery] string? reason)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing == null)
            return NotFound(new { error = "Usuário não encontrado" });

        var deletedBy = HttpContext.Items["UserName"] as string ?? "";
        await _repo.SoftDeleteAsync(id, reason, deletedBy);
        return Ok(new { message = "Usuário desativado com sucesso" });
    }
}
