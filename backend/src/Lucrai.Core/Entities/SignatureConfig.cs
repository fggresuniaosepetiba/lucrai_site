namespace Lucrai.Core.Entities;

public class SignatureConfig
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Company { get; set; } = string.Empty;
    public string? ImagemBase64 { get; set; }
    public string NomeResponsavel { get; set; } = string.Empty;
    public string Cargo { get; set; } = string.Empty;
    public bool PermitirUso { get; set; }
}
