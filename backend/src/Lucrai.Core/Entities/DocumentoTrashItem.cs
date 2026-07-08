namespace Lucrai.Core.Entities;

public class DocumentoTrashItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid DocumentoId { get; set; }
    public string Company { get; set; } = string.Empty;
    public string NomeArquivoOriginal { get; set; } = string.Empty;
    public string TipoArquivo { get; set; } = string.Empty;
    public long TamanhoBytes { get; set; }
    public string StatusOriginal { get; set; } = string.Empty;
    public string MotivoExclusao { get; set; } = string.Empty;
    public string ExcluidoPor { get; set; } = string.Empty;
    public DateTime ExcluidoEm { get; set; } = DateTime.UtcNow;
    public DateTime ExpiracaoEm { get; set; }
    public string SnapshotJson { get; set; } = string.Empty;
}
