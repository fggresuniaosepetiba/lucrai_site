namespace Lucrai.Core.Interfaces;

public interface ITenantContext
{
    string? Company { get; set; }
    string? UserName { get; set; }
    string? UserId { get; set; }
    string? Plan { get; set; }
}

public class TenantContext : ITenantContext
{
    public string? Company { get; set; }
    public string? UserName { get; set; }
    public string? UserId { get; set; }
    public string? Plan { get; set; }
}
