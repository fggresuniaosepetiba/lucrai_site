namespace Lucrai.Core.Entities;

public class CompanySettings
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string CompanyName { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public string PrimaryColor { get; set; } = "#0ea5e9";
    public string UserId { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
}
