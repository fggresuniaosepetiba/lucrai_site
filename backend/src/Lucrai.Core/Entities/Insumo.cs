using Lucrai.Core.Enums;

namespace Lucrai.Core.Entities;

public class Insumo
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Company { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;
    public UnidadeMedida UnidadeMedida { get; set; }
    public decimal QuantidadeComprada { get; set; }
    public decimal ValorPago { get; set; }
    public decimal CustoPorUnidade { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
