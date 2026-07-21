using System.Text;
using DotNetEnv;
using FluentValidation;
using Lucrai.API.Middleware;
using Lucrai.Core.Entities;
using Lucrai.Core.Interfaces;
using Lucrai.Core.Services;
using Lucrai.Infrastructure.Data;
using Lucrai.Infrastructure.Repositories;
using Lucrai.Infrastructure.Seed;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var envDir = Directory.GetCurrentDirectory();
while (envDir != null && !File.Exists(Path.Combine(envDir, ".env")))
    envDir = Path.GetDirectoryName(envDir);
if (envDir != null)
    DotNetEnv.Env.Load(Path.Combine(envDir, ".env"));

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<ICashForecastRepository, CashForecastRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ITrashRepository, TrashRepository>();
builder.Services.AddScoped<IAuditRepository, AuditRepository>();
builder.Services.AddScoped<ISettingsRepository, SettingsRepository>();
builder.Services.AddScoped<IPricingRepository, PricingRepository>();
builder.Services.AddScoped<IDismissedAlertRepository, DismissedAlertRepository>();
builder.Services.AddScoped<IDocumentoRepository, DocumentoRepository>();
builder.Services.AddScoped<IDocumentoLogRepository, DocumentoLogRepository>();
builder.Services.AddScoped<IDocumentoAprendizadoRepository, DocumentoAprendizadoRepository>();
builder.Services.AddScoped<IDocumentoConfigRepository, DocumentoConfigRepository>();
builder.Services.AddScoped<ISignatureRepository, SignatureRepository>();
builder.Services.AddScoped<IFixedCostRepository, FixedCostRepository>();
builder.Services.AddScoped<IInsumoRepository, InsumoRepository>();
builder.Services.AddScoped<IReciboRepository, ReciboRepository>();
builder.Services.AddScoped<IAccountReceivableRepository, AccountReceivableRepository>();
builder.Services.AddScoped<IAccountPayableRepository, AccountPayableRepository>();
builder.Services.AddScoped<IDebtRepository, DebtRepository>();
builder.Services.AddScoped<IInvestmentRepository, InvestmentRepository>();
builder.Services.AddScoped<IBalanceAccountRepository, BalanceAccountRepository>();

builder.Services.AddScoped<IDashboardIntelligenceService, DashboardIntelligenceService>();
builder.Services.AddScoped<IAlertasService, AlertasService>();
builder.Services.AddScoped<ITenantContext, TenantContext>();

var dbProvider = builder.Configuration.GetValue<string>("DatabaseProvider") ?? "PostgreSQL";
builder.Services.AddDbContext<LucraiDbContext>(options =>
{
    if (dbProvider == "InMemory")
        options.UseInMemoryDatabase(builder.Configuration.GetValue<string>("InMemoryDbName") ?? "LucraiTestDb");
    else
    {
        var connStr = builder.Configuration.GetConnectionString("Default")?.Trim('"') ?? "";
        var pgPort = Environment.GetEnvironmentVariable("POSTGRES_PORT");
        if (!string.IsNullOrEmpty(pgPort) && !connStr.Contains("Port=", StringComparison.OrdinalIgnoreCase))
            connStr = $"{connStr};Port={pgPort}";
        if (!connStr.Contains("Password=", StringComparison.OrdinalIgnoreCase))
        {
            var password = Environment.GetEnvironmentVariable("POSTGRES_PASSWORD");
            if (!string.IsNullOrEmpty(password))
                connStr = $"{connStr};Password={password}";
        }
        options.UseNpgsql(connStr);
    }
});

builder.Services.AddIdentity<User, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 6;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequireUppercase = true;
    options.Password.RequiredUniqueChars = 0;
})
.AddEntityFrameworkStores<LucraiDbContext>()
.AddDefaultTokenProviders();

var jwtKey = builder.Configuration["Jwt:Key"]?.Trim('"')
    ?? throw new InvalidOperationException("JWT Key is not configured");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"]?.Trim('"'),
        ValidAudience = builder.Configuration["Jwt:Audience"]?.Trim('"'),
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

var app = builder.Build();

var allowedOrigins = new[] {
    "https://lucrai-site.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173"
};

app.Use(async (context, next) =>
{
    var origin = context.Request.Headers.Origin.ToString();
    if (allowedOrigins.Contains(origin))
        context.Response.Headers["Access-Control-Allow-Origin"] = origin;

    context.Response.Headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS";
    context.Response.Headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization";
    context.Response.Headers["Access-Control-Allow-Credentials"] = "true";

    if (context.Request.Method == "OPTIONS")
    {
        context.Response.StatusCode = 200;
        return;
    }

    await next();
});

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<TenantContextMiddleware>();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<LucraiDbContext>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    await DataSeeder.SeedAsync(context, userManager, logger);
}

app.Run();
