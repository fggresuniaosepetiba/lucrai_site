namespace Lucrai.Core.Entities;

public class DocumentoConfiguracao
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Company { get; set; } = string.Empty;
    public bool CategorizacaoAutomatica { get; set; } = true;
    public bool CriarLancamentoAutomatico { get; set; }
    public int DiasRetencaoLixeira { get; set; } = 30;
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime AtualizadoEm { get; set; } = DateTime.UtcNow;
}
