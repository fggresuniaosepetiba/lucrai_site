namespace Lucrai.Core.Entities;

public class FixedCost
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Company { get; set; } = string.Empty;
    public decimal Aluguel { get; set; }
    public decimal Energia { get; set; }
    public decimal Agua { get; set; }
    public decimal Internet { get; set; }
    public decimal Contador { get; set; }
    public decimal ProLabore { get; set; }
    public decimal Softwares { get; set; }
    public decimal Telefone { get; set; }
    public decimal Marketing { get; set; }
    public decimal Limpeza { get; set; }
    public decimal Outros { get; set; }
    public string? CustomCosts { get; set; }
    public decimal Total { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
