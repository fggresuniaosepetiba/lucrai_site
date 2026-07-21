using System.Security.Claims;
using Lucrai.Core.Interfaces;

namespace Lucrai.API.Middleware;

public class TenantContextMiddleware
{
    private readonly RequestDelegate _next;

    public TenantContextMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ITenantContext tenantContext)
    {
        var company = context.User?.FindFirst("company")?.Value;
        if (!string.IsNullOrEmpty(company))
        {
            context.Items["Company"] = company;
            tenantContext.Company = company;
        }

        var userName = context.User?.FindFirst(ClaimTypes.Name)?.Value;
        if (!string.IsNullOrEmpty(userName))
        {
            context.Items["UserName"] = userName;
            tenantContext.UserName = userName;
        }

        var userId = context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            context.Items["UserId"] = userId;
            tenantContext.UserId = userId;
        }

        var plan = context.User?.FindFirst("plan")?.Value;
        if (!string.IsNullOrEmpty(plan))
        {
            context.Items["UserPlan"] = plan;
            tenantContext.Plan = plan;
        }

        await _next(context);
    }
}
