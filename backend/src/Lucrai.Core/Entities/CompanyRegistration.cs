using Lucrai.Core.Enums;

namespace Lucrai.Core.Entities;

public class CompanyRegistration
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Telefone { get; set; } = string.Empty;
    public string Senha { get; set; } = string.Empty;
    public string Empresa { get; set; } = string.Empty;
    public PorteEmpresa Porte { get; set; }
    public string Faturamento { get; set; } = string.Empty;
    public string Origem { get; set; } = string.Empty;
    public string Plano { get; set; } = string.Empty;
    public DateTime TrialInicio { get; set; }
    public DateTime TrialFim { get; set; }
    public bool PrimeiroAcesso { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
