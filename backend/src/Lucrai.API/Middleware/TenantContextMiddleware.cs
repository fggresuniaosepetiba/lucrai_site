using System.Security.Claims;

namespace Lucrai.API.Middleware;

public class TenantContextMiddleware
{
    private readonly RequestDelegate _next;

    public TenantContextMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var company = context.User?.FindFirst("company")?.Value;
        if (!string.IsNullOrEmpty(company))
            context.Items["Company"] = company;

        var userName = context.User?.FindFirst(ClaimTypes.Name)?.Value;
        if (!string.IsNullOrEmpty(userName))
            context.Items["UserName"] = userName;

        var userId = context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId))
            context.Items["UserId"] = userId;

        var plan = context.User?.FindFirst("plan")?.Value;
        if (!string.IsNullOrEmpty(plan))
            context.Items["UserPlan"] = plan;

        await _next(context);
    }
}
