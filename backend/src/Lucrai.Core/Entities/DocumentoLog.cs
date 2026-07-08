namespace Lucrai.Core.Entities;

public class DocumentoLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? DocumentoId { get; set; }
    public string Company { get; set; } = string.Empty;
    public string Acao { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public string UsuarioId { get; set; } = string.Empty;
    public string UsuarioNome { get; set; } = string.Empty;
    public string? Detalhes { get; set; }
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
}
