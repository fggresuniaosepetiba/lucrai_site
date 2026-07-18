using Lucrai.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;

namespace Lucrai.API.Controllers;

[ApiController]
[Route("api/health")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get([FromServices] LucraiDbContext context)
    {
        var dbOk = false;
        try
        {
            dbOk = await context.Database.CanConnectAsync();
        }
        catch
        {
        }

        return Ok(new
        {
            status = dbOk ? "healthy" : "degraded",
            database = dbOk ? "connected" : "error",
            timestamp = DateTime.UtcNow
        });
    }
}
