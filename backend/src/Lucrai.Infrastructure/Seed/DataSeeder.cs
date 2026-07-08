using Lucrai.Core.Entities;
using Lucrai.Core.Enums;
using Lucrai.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Lucrai.Infrastructure.Seed;

public static class DataSeeder
{
    public static async Task SeedAsync(LucraiDbContext context, UserManager<User> userManager)
    {
        if (context.Database.IsRelational())
            await context.Database.MigrateAsync();
        else
            await context.Database.EnsureCreatedAsync();

        var seedUsers = new[]
        {
            new User
            {
                UserName = "lucrai.adm",
                Email = "lucrai.adm",
                Name = "Gabriel Fellype",
                Role = UserRole.Admin,
                Plan = UserPlan.SuperAdmin,
                Company = "Lucraí",
                EmailConfirmed = true,
                MustChangePassword = true
            },
            new User
            {
                UserName = "joao.ribeiro",
                Email = "joao.ribeiro",
                Name = "João Ribeiro",
                Role = UserRole.Owner,
                Plan = UserPlan.SuperAdmin,
                Company = "Lucraí",
                EmailConfirmed = true,
                MustChangePassword = true
            },
            new User
            {
                UserName = "vitoria.justo",
                Email = "vitoria.justo",
                Name = "Vitória Justo",
                Role = UserRole.Admin,
                Plan = UserPlan.SuperAdmin,
                Company = "Lucraí",
                EmailConfirmed = true,
                MustChangePassword = true
            },
            new User
            {
                UserName = "fellype.gabriel",
                Email = "fellype.gabriel",
                Name = "Fellype Gabriel",
                Role = UserRole.Admin,
                Plan = UserPlan.SuperAdmin,
                Company = "Lucraí",
                EmailConfirmed = true,
                MustChangePassword = true
            },
            new User
            {
                UserName = "eduardo.contador",
                Email = "eduardo.contador",
                Name = "Eduardo Contador",
                Role = UserRole.Admin,
                Plan = UserPlan.SuperAdmin,
                Company = "Lucraí",
                EmailConfirmed = true,
                MustChangePassword = true
            }
        };

        foreach (var seedUser in seedUsers)
        {
            var existing = await userManager.FindByEmailAsync(seedUser.Email);
            if (existing == null)
            {
                seedUser.PasswordHash = userManager.PasswordHasher.HashPassword(seedUser, "123");
                var result = await userManager.CreateAsync(seedUser);
                if (!result.Succeeded)
                    throw new InvalidOperationException(
                        $"Failed to seed user {seedUser.UserName}: {string.Join(", ", result.Errors.Select(e => e.Description))}");
            }
            else
            {
                existing.Name = seedUser.Name;
                existing.Role = seedUser.Role;
                existing.Plan = seedUser.Plan;
                existing.Company = seedUser.Company;
                existing.EmailConfirmed = seedUser.EmailConfirmed;
                existing.MustChangePassword = true;
                existing.PasswordHash = userManager.PasswordHasher.HashPassword(existing, "123");
                var updateResult = await userManager.UpdateAsync(existing);
                if (!updateResult.Succeeded)
                    throw new InvalidOperationException(
                        $"Failed to update user {seedUser.UserName}");
            }
        }

        var companies = await context.Users.Select(u => u.Company).Distinct().ToListAsync();

        foreach (var company in companies)
        {
            if (!await context.Categories.AnyAsync(c => c.Company == company))
            {
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

                context.Categories.AddRange(incomeCategories);
                context.Categories.AddRange(expenseCategories);
                await context.SaveChangesAsync();
            }
        }
    }
}
