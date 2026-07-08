namespace Lucrai.Core.Entities;

public class DocumentoFinanceiro
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Company { get; set; } = string.Empty;
    public string UserUploadId { get; set; } = string.Empty;
    public string NomeArquivoOriginal { get; set; } = string.Empty;
    public string NomeArquivoStorage { get; set; } = string.Empty;
    public string PathStorage { get; set; } = string.Empty;
    public string TipoArquivo { get; set; } = string.Empty;
    public long TamanhoBytes { get; set; }
    public string HashArquivo { get; set; } = string.Empty;
    public string Status { get; set; } = "NOVO";
    public string? TipoDocumentoDetectado { get; set; }
    public decimal? ValorExtraido { get; set; }
    public string? DataExtraida { get; set; }
    public string? FavorecidoExtraido { get; set; }
    public string? EmitenteExtraido { get; set; }
    public string? DescricaoExtraida { get; set; }
    public string? TipoMovimentacaoSugerido { get; set; }
    public string? CategoriaSugeridaId { get; set; }
    public int? ConfiancaExtracao { get; set; }
    public string? DadosExtraidosRaw { get; set; }
    public string? DadosEstruturados { get; set; }
    public string? ObservacoesIa { get; set; }
    public string? ResumoExecutivo { get; set; }
    public string? LancamentoId { get; set; }
    public string? UsuarioConferenciaId { get; set; }
    public string? DataConferencia { get; set; }
    public string? MotivoRejeicao { get; set; }
    public string? MotivoExclusao { get; set; }
    public bool? ExclusaoPermanente { get; set; }
    public string? ExcluidoPor { get; set; }
    public string? DataExclusao { get; set; }
    public int TentativasProcessamento { get; set; }
    public string? UltimoErro { get; set; }
    public byte[]? ArquivoData { get; set; }
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime AtualizadoEm { get; set; } = DateTime.UtcNow;
    public DateTime? ExcluidoEm { get; set; }
}
