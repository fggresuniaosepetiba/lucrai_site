using Lucrai.Core.DTOs.Contas;
using Lucrai.Core.Entities;
using Lucrai.Core.Enums;
using Lucrai.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lucrai.API.Controllers;

[ApiController]
[Route("api/contas")]
public class ContasController : ControllerBase
{
    private readonly LucraiDbContext _context;
    private readonly UserManager<User> _userManager;

    public ContasController(LucraiDbContext context, UserManager<User> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Create([FromBody] CreateContaRequest request)
    {
        if (!Enum.TryParse<Core.Enums.PorteEmpresa>(request.Porte, true, out var porte))
            return BadRequest(new { error = "Porte inválido" });

        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
            return BadRequest(new { error = "Email já cadastrado" });

        var user = new User
        {
            UserName = request.Email,
            Email = request.Email,
            Name = request.Nome,
            Role = UserRole.Admin,
            Plan = UserPlan.Basic,
            Company = request.Empresa,
            EmailConfirmed = true,
            Active = true,
            MustChangePassword = true
        };

        var result = await _userManager.CreateAsync(user, request.Senha);
        if (!result.Succeeded)
            return BadRequest(new { error = string.Join("; ", result.Errors.Select(e => e.Description)) });

        await SeedDefaultCategories(request.Empresa);

        var registration = new CompanyRegistration
        {
            Nome = request.Nome,
            Email = request.Email,
            Telefone = request.Telefone,
            Empresa = request.Empresa,
            Porte = porte,
            Faturamento = request.Faturamento,
            Origem = request.Origem,
            Plano = request.Plano,
            TrialInicio = DateTime.UtcNow,
            TrialFim = DateTime.UtcNow.AddDays(14),
            PrimeiroAcesso = true
        };

        _context.CompanyRegistrations.Add(registration);
        await _context.SaveChangesAsync();

        return Ok(new ContaResponse(
            registration.Id, registration.Nome, registration.Email,
            registration.Telefone, registration.Empresa, registration.Porte.ToString(),
            registration.Faturamento, registration.Origem, registration.Plano,
            registration.CreatedAt
        ));
    }

    private async Task SeedDefaultCategories(string company)
    {
        if (await _context.Categories.AnyAsync(c => c.Company == company))
            return;

        var incomeCategories = new[]
        {
            new Category { Name = "Vendas", Color = "#22c55e", Icon = "trending-up", Type = TransactionType.Income, Company = company },
            new Category { Name = "Prestação de Serviços", Color = "#0ea5e9", Icon = "briefcase", Type = TransactionType.Income, Company = company },
            new Category { Name = "Investimentos", Color = "#8b5cf6", Icon = "bar-chart", Type = TransactionType.Income, Company = company },
            new Category { Name = "Receitas Diversas", Color = "#14b8a6", Icon = "plus-circle", Type = TransactionType.Income, Company = company },
        };

        var expenseCategories = new[]
        {
            new Category { Name = "Salários", Color = "#ef4444", Icon = "users", Type = TransactionType.Expense, Company = company },
            new Category { Name = "Aluguel", Color = "#f97316", Icon = "home", Type = TransactionType.Expense, Company = company },
            new Category { Name = "Fornecedores", Color = "#eab308", Icon = "truck", Type = TransactionType.Expense, Company = company },
            new Category { Name = "Marketing", Color = "#ec4899", Icon = "megaphone", Type = TransactionType.Expense, Company = company },
            new Category { Name = "Impostos", Color = "#6366f1", Icon = "file-text", Type = TransactionType.Expense, Company = company },
            new Category { Name = "Despesas Operacionais", Color = "#84cc16", Icon = "settings", Type = TransactionType.Expense, Company = company },
            new Category { Name = "Pró-Labore", Color = "#06b6d4", Icon = "user-check", Type = TransactionType.Expense, Company = company },
            new Category { Name = "Manutenção", Color = "#d946ef", Icon = "wrench", Type = TransactionType.Expense, Company = company },
        };

        _context.Categories.AddRange(incomeCategories);
        _context.Categories.AddRange(expenseCategories);
        await _context.SaveChangesAsync();
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        var registrations = await _context.CompanyRegistrations
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        var result = registrations.Select(r => new ContaResponse(
            r.Id, r.Nome, r.Email, r.Telefone, r.Empresa,
            r.Porte.ToString(), r.Faturamento, r.Origem, r.Plano, r.CreatedAt
        ));

        return Ok(result);
    }
}
