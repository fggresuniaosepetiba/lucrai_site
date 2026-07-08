namespace Lucrai.Core.Entities;

public class DocumentoAprendizado
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Company { get; set; } = string.Empty;
    public string Chave { get; set; } = string.Empty;
    public string? CategoriaId { get; set; }
    public string? TipoMovimentacao { get; set; }
    public int? ConfiancaMinima { get; set; }
    public bool Ativo { get; set; } = true;
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime AtualizadoEm { get; set; } = DateTime.UtcNow;
    public string CriadoPor { get; set; } = string.Empty;
}
