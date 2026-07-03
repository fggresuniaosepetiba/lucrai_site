using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Lucrai.Core.DTOs.Auth;
using Lucrai.Core.Entities;
using Lucrai.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Lucrai.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly LucraiDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(
        UserManager<User> userManager,
        SignInManager<User> signInManager,
        LucraiDbContext context,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null || !user.Active)
            return Unauthorized(new { error = "Credenciais inválidas" });

        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);
        if (!result.Succeeded)
            return Unauthorized(new { error = "Credenciais inválidas" });

        var (accessToken, expiresIn) = await GenerateAccessToken(user);
        var refreshToken = await GenerateRefreshToken(user.Id);

        return Ok(new LoginResponse(
            accessToken,
            refreshToken,
            expiresIn,
            new UserInfo(user.Id, user.Email!, user.Name, user.Role.ToString(), user.Company)
        ));
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
            return BadRequest(new { error = "Email já cadastrado" });

        var user = new User
        {
            UserName = request.Email,
            Email = request.Email,
            Name = request.Name,
            Role = Core.Enums.UserRole.Admin,
            Company = request.Company,
            EmailConfirmed = true,
            Active = true
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
            return BadRequest(new { error = string.Join("; ", result.Errors.Select(e => e.Description)) });

        var (accessToken, expiresIn) = await GenerateAccessToken(user);
        var refreshToken = await GenerateRefreshToken(user.Id);

        return Ok(new LoginResponse(
            accessToken,
            refreshToken,
            expiresIn,
            new UserInfo(user.Id, user.Email!, user.Name, user.Role.ToString(), user.Company)
        ));
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request)
    {
        var storedToken = await _context.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == request.RefreshToken && !rt.IsUsed && !rt.IsRevoked);

        if (storedToken == null || storedToken.ExpiresAt < DateTime.UtcNow)
            return Unauthorized(new { error = "Refresh token inválido ou expirado" });

        storedToken.IsUsed = true;

        var user = storedToken.User;
        if (user == null || !user.Active)
            return Unauthorized(new { error = "Usuário não encontrado ou inativo" });

        var (accessToken, expiresIn) = await GenerateAccessToken(user);
        var newRefreshToken = await GenerateRefreshToken(user.Id);

        await _context.SaveChangesAsync();

        return Ok(new LoginResponse(
            accessToken,
            newRefreshToken,
            expiresIn,
            new UserInfo(user.Id, user.Email!, user.Name, user.Role.ToString(), user.Company)
        ));
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            var tokens = await _context.RefreshTokens
                .Where(rt => rt.UserId == userId && !rt.IsRevoked)
                .ToListAsync();

            foreach (var token in tokens)
            {
                token.IsRevoked = true;
                token.RevokedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
        }

        return Ok(new { message = "Logout realizado com sucesso" });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = await _userManager.FindByIdAsync(userId!);

        if (user == null)
            return NotFound(new { error = "Usuário não encontrado" });

        return Ok(new AuthUserResponse(
            user.Id, user.Email!, user.Name, user.Role.ToString(),
            user.Company, user.Avatar, user.Active, user.CreatedAt
        ));
    }

    private async Task<(string token, int expiresIn)> GenerateAccessToken(User user)
    {
        var jwtKey = _configuration["Jwt:Key"]!;
        var issuer = _configuration["Jwt:Issuer"]!;
        var audience = _configuration["Jwt:Audience"]!;
        var expiresInMinutes = int.Parse(_configuration["Jwt:ExpiresInMinutes"] ?? "15");

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Name, user.Name),
            new(ClaimTypes.Email, user.Email ?? ""),
            new(ClaimTypes.Role, user.Role.ToString()),
            new("company", user.Company)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiresInMinutes),
            signingCredentials: credentials
        );

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresInMinutes * 60);
    }

    private async Task<string> GenerateRefreshToken(string userId)
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        var token = Convert.ToBase64String(randomBytes);

        var expiresInDays = int.Parse(_configuration["RefreshToken:ExpiresInDays"] ?? "7");

        _context.RefreshTokens.Add(new RefreshToken
        {
            Token = token,
            UserId = userId,
            ExpiresAt = DateTime.UtcNow.AddDays(expiresInDays)
        });

        await _context.SaveChangesAsync();
        return token;
    }
}
