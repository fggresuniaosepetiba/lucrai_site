using Lucrai.Core.Enums;

namespace Lucrai.Core.Entities;

public class BalanceAccount
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Company { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public AccountNature Nature { get; set; }
    public decimal Balance { get; set; }
    public int Year { get; set; }
    public int? Month { get; set; }
    public string? Notes { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
