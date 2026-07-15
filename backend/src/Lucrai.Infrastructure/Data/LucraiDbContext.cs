using Lucrai.Core.Entities;
using Lucrai.Core.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Lucrai.Infrastructure.Data;

public class LucraiDbContext : IdentityDbContext<User, IdentityRole, string>
{
    public LucraiDbContext(DbContextOptions<LucraiDbContext> options) : base(options) { }

    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<CashForecast> CashForecasts => Set<CashForecast>();
    public DbSet<PricingProduct> PricingProducts => Set<PricingProduct>();
    public DbSet<DeletedItem> DeletedItems => Set<DeletedItem>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<CompanySettings> CompanySettings => Set<CompanySettings>();
    public DbSet<CompanyRegistration> CompanyRegistrations => Set<CompanyRegistration>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<DismissedAlert> DismissedAlerts => Set<DismissedAlert>();
    public DbSet<DocumentoFinanceiro> Documentos => Set<DocumentoFinanceiro>();
    public DbSet<DocumentoTrashItem> DocumentoTrash => Set<DocumentoTrashItem>();
    public DbSet<DocumentoLog> DocumentoLogs => Set<DocumentoLog>();
    public DbSet<DocumentoAprendizado> DocumentoAprendizados => Set<DocumentoAprendizado>();
    public DbSet<DocumentoConfiguracao> DocumentoConfiguracoes => Set<DocumentoConfiguracao>();
    public DbSet<SignatureConfig> SignatureConfigs => Set<SignatureConfig>();
    public DbSet<FixedCost> FixedCosts => Set<FixedCost>();
    public DbSet<Insumo> Insumos => Set<Insumo>();
    public DbSet<Recibo> Recibos => Set<Recibo>();
    public DbSet<AccountReceivable> AccountsReceivable => Set<AccountReceivable>();
    public DbSet<AccountPayable> AccountsPayable => Set<AccountPayable>();
    public DbSet<Debt> Debts => Set<Debt>();
    public DbSet<Investment> Investments => Set<Investment>();
    public DbSet<BalanceAccount> BalanceAccounts => Set<BalanceAccount>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<User>(entity =>
        {
            entity.Property(u => u.Name).HasMaxLength(200).IsRequired();
            entity.Property(u => u.Role)
                .HasConversion<string>()
                .HasMaxLength(20)
                .IsRequired();
            entity.Property(u => u.Plan)
                .HasConversion<string>()
                .HasMaxLength(20)
                .IsRequired();
            entity.Property(u => u.MustChangePassword)
                .IsRequired();
            entity.Property(u => u.Company).HasMaxLength(200).IsRequired();
            entity.Property(u => u.Avatar).HasMaxLength(500);
            entity.HasIndex(u => u.Email);
            entity.HasIndex(u => u.Company);
        });

        builder.Entity<Transaction>(entity =>
        {
            entity.HasKey(t => t.Id);
            entity.Property(t => t.DisplayId).HasMaxLength(10).IsRequired();
            entity.Property(t => t.Type).HasConversion<string>().HasMaxLength(10).IsRequired();
            entity.Property(t => t.Value).HasColumnType("decimal(18,2)").IsRequired();
            entity.Property(t => t.CategoryName).HasMaxLength(120).IsRequired();
            entity.Property(t => t.Description).HasMaxLength(500).IsRequired();
            entity.Property(t => t.Date).HasColumnType("timestamp without time zone");
            entity.Property(t => t.Observation).HasMaxLength(1000);
            entity.Property(t => t.Company).HasMaxLength(200).IsRequired();
            entity.Property(t => t.CreatedBy).HasMaxLength(200).IsRequired();

            entity.HasOne(t => t.Category)
                .WithMany(c => c.Transactions)
                .HasForeignKey(t => t.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(t => new { t.Company, t.Date });
            entity.HasIndex(t => new { t.Company, t.Type });
            entity.HasIndex(t => new { t.Company, t.CategoryId });
        });

        builder.Entity<Category>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Name).HasMaxLength(120).IsRequired();
            entity.Property(c => c.Color).HasMaxLength(9).IsRequired();
            entity.Property(c => c.Icon).HasMaxLength(50).IsRequired();
            entity.Property(c => c.Type).HasConversion<string>().HasMaxLength(10).IsRequired();
            entity.Property(c => c.Company).HasMaxLength(200).IsRequired();
            entity.Property(c => c.CreatedBy).HasMaxLength(200).IsRequired();

            entity.HasIndex(c => new { c.Company, c.Type });
            entity.HasIndex(c => new { c.Company, c.Name });
        });

        builder.Entity<CashForecast>(entity =>
        {
            entity.HasKey(f => f.Id);
            entity.Property(f => f.DisplayId).HasMaxLength(10).IsRequired();
            entity.Property(f => f.Type).HasConversion<string>().HasMaxLength(10).IsRequired();
            entity.Property(f => f.Description).HasMaxLength(500).IsRequired();
            entity.Property(f => f.Amount).HasColumnType("decimal(18,2)").IsRequired();
            entity.Property(f => f.Category).HasMaxLength(120).IsRequired();
            entity.Property(f => f.ExpectedDate).HasColumnType("timestamp without time zone");
            entity.Property(f => f.Status).HasConversion<string>().HasMaxLength(15).IsRequired();
            entity.Property(f => f.Notes).HasMaxLength(1000);
            entity.Property(f => f.Company).HasMaxLength(200).IsRequired();
            entity.Property(f => f.CreatedBy).HasMaxLength(200).IsRequired();
            entity.Property(f => f.CancelledReason).HasMaxLength(500);
            entity.Property(f => f.CancelledBy).HasMaxLength(200);
            entity.Property(f => f.RecurrenceType).HasConversion<string>().HasMaxLength(15);
            entity.Property(f => f.RecurrenceEndDate).HasColumnType("timestamp without time zone");
            entity.Property(f => f.CancelledAt).HasColumnType("timestamp without time zone");

            entity.HasIndex(f => new { f.Company, f.Status });
            entity.HasIndex(f => new { f.Company, f.ExpectedDate });
        });

        builder.Entity<PricingProduct>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Name).HasMaxLength(200).IsRequired();
            entity.Property(p => p.Category).HasMaxLength(100).IsRequired();
            entity.Property(p => p.Sku).HasMaxLength(50);
            entity.Property(p => p.Description).HasMaxLength(1000);
            entity.Property(p => p.RawMaterial).HasColumnType("decimal(18,2)");
            entity.Property(p => p.Packaging).HasColumnType("decimal(18,2)");
            entity.Property(p => p.Labor).HasColumnType("decimal(18,2)");
            entity.Property(p => p.Freight).HasColumnType("decimal(18,2)");
            entity.Property(p => p.OtherCosts).HasColumnType("decimal(18,2)");
            entity.Property(p => p.Taxes).HasColumnType("decimal(18,2)");
            entity.Property(p => p.CardFee).HasColumnType("decimal(18,2)");
            entity.Property(p => p.MarketplaceFee).HasColumnType("decimal(18,2)");
            entity.Property(p => p.Commission).HasColumnType("decimal(18,2)");
            entity.Property(p => p.OtherFees).HasColumnType("decimal(18,2)");
            entity.Property(p => p.DesiredMargin).HasColumnType("decimal(5,2)");
            entity.Property(p => p.MinPrice).HasColumnType("decimal(18,2)");
            entity.Property(p => p.HealthyPrice).HasColumnType("decimal(18,2)");
            entity.Property(p => p.PremiumPrice).HasColumnType("decimal(18,2)");
            entity.Property(p => p.NetMargin).HasColumnType("decimal(5,2)");
            entity.Property(p => p.Company).HasMaxLength(200).IsRequired();
            entity.Property(p => p.CreatedBy).HasMaxLength(200).IsRequired();

            entity.HasIndex(p => new { p.Company, p.Name });
            entity.HasIndex(p => new { p.Company, p.Category });
        });

        builder.Entity<DeletedItem>(entity =>
        {
            entity.HasKey(d => d.Id);
            entity.Property(d => d.DisplayId).HasMaxLength(10).IsRequired();
            entity.Property(d => d.EntryType).HasConversion<string>().HasMaxLength(15).IsRequired();
            entity.Property(d => d.Type).HasConversion<string>().HasMaxLength(10).IsRequired();
            entity.Property(d => d.Value).HasColumnType("decimal(18,2)");
            entity.Property(d => d.CategoryName).HasMaxLength(120);
            entity.Property(d => d.Description).HasMaxLength(500).IsRequired();
            entity.Property(d => d.Observation).HasMaxLength(1000);
            entity.Property(d => d.Amount).HasColumnType("decimal(18,2)");
            entity.Property(d => d.Category).HasMaxLength(120);
            entity.Property(d => d.Notes).HasMaxLength(1000);
            entity.Property(d => d.Status).HasConversion<string>().HasMaxLength(15);
            entity.Property(d => d.CancelledReason).HasMaxLength(500);
            entity.Property(d => d.CancelledBy).HasMaxLength(200);
            entity.Property(d => d.Company).HasMaxLength(200).IsRequired();
            entity.Property(d => d.Reason).HasMaxLength(500).IsRequired();

            entity.HasIndex(d => new { d.Company, d.DeletedAt });
            entity.HasIndex(d => new { d.Company, d.RestoreUntil });
        });

        builder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(a => a.Id);
            entity.Property(a => a.EntityType).HasMaxLength(20).IsRequired();
            entity.Property(a => a.DisplayId).HasMaxLength(10).IsRequired();
            entity.Property(a => a.Action).HasConversion<string>().HasMaxLength(20).IsRequired();
            entity.Property(a => a.Description).HasMaxLength(500).IsRequired();
            entity.Property(a => a.User).HasMaxLength(200).IsRequired();
            entity.Property(a => a.Company).HasMaxLength(200).IsRequired();
            entity.Property(a => a.Details).HasMaxLength(2000);

            entity.HasIndex(a => new { a.Company, a.Timestamp });
            entity.HasIndex(a => new { a.Company, a.EntityType });
            entity.HasIndex(a => a.EntityId);
        });

        builder.Entity<CompanySettings>(entity =>
        {
            entity.HasKey(s => s.Id);
            entity.Property(s => s.CompanyName).HasMaxLength(200).IsRequired();
            entity.Property(s => s.LogoUrl).HasMaxLength(500);
            entity.Property(s => s.PrimaryColor).HasMaxLength(9).IsRequired();
            entity.Property(s => s.Company).HasMaxLength(200).IsRequired();

            entity.HasIndex(s => s.Company).IsUnique();
        });

        builder.Entity<CompanyRegistration>(entity =>
        {
            entity.HasKey(r => r.Id);
            entity.Property(r => r.Nome).HasMaxLength(200).IsRequired();
            entity.Property(r => r.Email).HasMaxLength(200).IsRequired();
            entity.Property(r => r.Telefone).HasMaxLength(20).IsRequired();
            entity.Property(r => r.Empresa).HasMaxLength(200).IsRequired();
            entity.Property(r => r.Porte).HasConversion<string>().HasMaxLength(10).IsRequired();
            entity.Property(r => r.Faturamento).HasMaxLength(50).IsRequired();
            entity.Property(r => r.Origem).HasMaxLength(100).IsRequired();
            entity.Property(r => r.Plano).HasMaxLength(50).IsRequired();

            entity.HasIndex(r => r.Email);
        });

        builder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(rt => rt.Id);
            entity.Property(rt => rt.Token).HasMaxLength(500).IsRequired();
            entity.Property(rt => rt.UserId).IsRequired();

            entity.HasOne(rt => rt.User)
                .WithMany()
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(rt => rt.Token).IsUnique();
            entity.HasIndex(rt => rt.UserId);
        });

        builder.Entity<DismissedAlert>(entity =>
        {
            entity.HasKey(d => d.Id);
            entity.Property(d => d.AlertType).HasMaxLength(100).IsRequired();
            entity.Property(d => d.EntityId).HasMaxLength(100);
            entity.Property(d => d.Company).HasMaxLength(200).IsRequired();
            entity.Property(d => d.DismissedBy).HasMaxLength(200).IsRequired();

            entity.HasIndex(d => new { d.Company, d.AlertType, d.EntityId });
            entity.HasIndex(d => d.Company);
        });

        builder.Entity<DocumentoFinanceiro>(entity =>
        {
            entity.HasKey(d => d.Id);
            entity.Property(d => d.Company).HasMaxLength(200).IsRequired();
            entity.Property(d => d.UserUploadId).HasMaxLength(200).IsRequired();
            entity.Property(d => d.NomeArquivoOriginal).HasMaxLength(500).IsRequired();
            entity.Property(d => d.NomeArquivoStorage).HasMaxLength(500).IsRequired();
            entity.Property(d => d.PathStorage).HasMaxLength(1000).IsRequired();
            entity.Property(d => d.TipoArquivo).HasMaxLength(10).IsRequired();
            entity.Property(d => d.HashArquivo).HasMaxLength(100).IsRequired();
            entity.Property(d => d.Status).HasMaxLength(30).IsRequired();
            entity.Property(d => d.TipoDocumentoDetectado).HasMaxLength(100);
            entity.Property(d => d.ValorExtraido).HasColumnType("decimal(18,2)");
            entity.Property(d => d.DataExtraida).HasMaxLength(20);
            entity.Property(d => d.FavorecidoExtraido).HasMaxLength(200);
            entity.Property(d => d.EmitenteExtraido).HasMaxLength(200);
            entity.Property(d => d.DescricaoExtraida).HasMaxLength(500);
            entity.Property(d => d.TipoMovimentacaoSugerido).HasMaxLength(20);
            entity.Property(d => d.CategoriaSugeridaId).HasMaxLength(100);
            entity.Property(d => d.ResumoExecutivo).HasMaxLength(2000);
            entity.Property(d => d.LancamentoId).HasMaxLength(100);
            entity.Property(d => d.UsuarioConferenciaId).HasMaxLength(200);
            entity.Property(d => d.DataConferencia).HasMaxLength(30);
            entity.Property(d => d.MotivoRejeicao).HasMaxLength(500);
            entity.Property(d => d.MotivoExclusao).HasMaxLength(500);
            entity.Property(d => d.ExcluidoPor).HasMaxLength(200);
            entity.Property(d => d.DataExclusao).HasMaxLength(30);
            entity.Property(d => d.UltimoErro).HasMaxLength(1000);

            entity.HasIndex(d => new { d.Company, d.Status });
            entity.HasIndex(d => new { d.Company, d.CriadoEm });
            entity.HasIndex(d => d.HashArquivo);
        });

        builder.Entity<DocumentoTrashItem>(entity =>
        {
            entity.HasKey(t => t.Id);
            entity.Property(t => t.Company).HasMaxLength(200).IsRequired();
            entity.Property(t => t.NomeArquivoOriginal).HasMaxLength(500).IsRequired();
            entity.Property(t => t.TipoArquivo).HasMaxLength(10).IsRequired();
            entity.Property(t => t.StatusOriginal).HasMaxLength(30).IsRequired();
            entity.Property(t => t.MotivoExclusao).HasMaxLength(500).IsRequired();
            entity.Property(t => t.ExcluidoPor).HasMaxLength(200).IsRequired();

            entity.HasIndex(t => new { t.Company, t.ExcluidoEm });
            entity.HasIndex(t => new { t.Company, t.ExpiracaoEm });
            entity.HasIndex(t => t.DocumentoId);
        });

        builder.Entity<DocumentoLog>(entity =>
        {
            entity.HasKey(l => l.Id);
            entity.Property(l => l.Company).HasMaxLength(200).IsRequired();
            entity.Property(l => l.Acao).HasMaxLength(30).IsRequired();
            entity.Property(l => l.Descricao).HasMaxLength(500).IsRequired();
            entity.Property(l => l.UsuarioId).HasMaxLength(200).IsRequired();
            entity.Property(l => l.UsuarioNome).HasMaxLength(200).IsRequired();
            entity.Property(l => l.Detalhes).HasMaxLength(2000);

            entity.HasIndex(l => new { l.Company, l.CriadoEm });
            entity.HasIndex(l => l.DocumentoId);
        });

        builder.Entity<DocumentoAprendizado>(entity =>
        {
            entity.HasKey(a => a.Id);
            entity.Property(a => a.Company).HasMaxLength(200).IsRequired();
            entity.Property(a => a.Chave).HasMaxLength(500).IsRequired();
            entity.Property(a => a.CategoriaId).HasMaxLength(100);
            entity.Property(a => a.TipoMovimentacao).HasMaxLength(20);
            entity.Property(a => a.CriadoPor).HasMaxLength(200).IsRequired();

            entity.HasIndex(a => new { a.Company, a.Chave }).IsUnique();
            entity.HasIndex(a => new { a.Company, a.Ativo });
        });

        builder.Entity<DocumentoConfiguracao>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Company).HasMaxLength(200).IsRequired();

            entity.HasIndex(c => c.Company).IsUnique();
        });

        builder.Entity<SignatureConfig>(entity =>
        {
            entity.HasKey(s => s.Id);
            entity.Property(s => s.Company).HasMaxLength(200).IsRequired();
            entity.Property(s => s.NomeResponsavel).HasMaxLength(200).IsRequired();
            entity.Property(s => s.Cargo).HasMaxLength(200).IsRequired();
            entity.Property(s => s.PermitirUso).IsRequired();

            entity.HasIndex(s => s.Company).IsUnique();
        });

        builder.Entity<FixedCost>(entity =>
        {
            entity.HasKey(f => f.Id);
            entity.Property(f => f.Company).HasMaxLength(200).IsRequired();
            entity.Property(f => f.Aluguel).HasColumnType("decimal(18,2)");
            entity.Property(f => f.Energia).HasColumnType("decimal(18,2)");
            entity.Property(f => f.Agua).HasColumnType("decimal(18,2)");
            entity.Property(f => f.Internet).HasColumnType("decimal(18,2)");
            entity.Property(f => f.Contador).HasColumnType("decimal(18,2)");
            entity.Property(f => f.ProLabore).HasColumnType("decimal(18,2)");
            entity.Property(f => f.Softwares).HasColumnType("decimal(18,2)");
            entity.Property(f => f.Telefone).HasColumnType("decimal(18,2)");
            entity.Property(f => f.Marketing).HasColumnType("decimal(18,2)");
            entity.Property(f => f.Limpeza).HasColumnType("decimal(18,2)");
            entity.Property(f => f.Outros).HasColumnType("decimal(18,2)");
            entity.Property(f => f.Total).HasColumnType("decimal(18,2)");

            entity.HasIndex(f => f.Company).IsUnique();
        });

        builder.Entity<Insumo>(entity =>
        {
            entity.HasKey(i => i.Id);
            entity.Property(i => i.Company).HasMaxLength(200).IsRequired();
            entity.Property(i => i.Nome).HasMaxLength(200).IsRequired();
            entity.Property(i => i.Categoria).HasMaxLength(100);
            entity.Property(i => i.UnidadeMedida).HasConversion<string>().HasMaxLength(15).IsRequired();
            entity.Property(i => i.QuantidadeComprada).HasColumnType("decimal(18,2)");
            entity.Property(i => i.ValorPago).HasColumnType("decimal(18,2)");
            entity.Property(i => i.CustoPorUnidade).HasColumnType("decimal(18,2)");

            entity.HasIndex(i => new { i.Company, i.Nome });
        });

        builder.Entity<Recibo>(entity =>
        {
            entity.HasKey(r => r.Id);
            entity.Property(r => r.DisplayId).HasMaxLength(10).IsRequired();
            entity.Property(r => r.Company).HasMaxLength(200).IsRequired();
            entity.Property(r => r.Numero).HasMaxLength(20).IsRequired();
            entity.Property(r => r.Tipo).HasConversion<string>().HasMaxLength(15).IsRequired();
            entity.Property(r => r.Origem).HasConversion<string>().HasMaxLength(10).IsRequired();
            entity.Property(r => r.Status).HasConversion<string>().HasMaxLength(10).IsRequired();
            entity.Property(r => r.Data).HasMaxLength(10).IsRequired();
            entity.Property(r => r.Valor).HasColumnType("decimal(18,2)").IsRequired();
            entity.Property(r => r.ValorPorExtenso).HasMaxLength(500).IsRequired();
            entity.Property(r => r.NomePagador).HasMaxLength(200).IsRequired();
            entity.Property(r => r.DocumentoPagador).HasMaxLength(20);
            entity.Property(r => r.NomeRecebedor).HasMaxLength(200).IsRequired();
            entity.Property(r => r.DocumentoRecebedor).HasMaxLength(20);
            entity.Property(r => r.Referente).HasMaxLength(500).IsRequired();
            entity.Property(r => r.FormaPagamento).HasMaxLength(50);
            entity.Property(r => r.Observacoes).HasMaxLength(1000);
            entity.Property(r => r.Telefone).HasMaxLength(20);
            entity.Property(r => r.Email).HasMaxLength(200);
            entity.Property(r => r.Cidade).HasMaxLength(100);
            entity.Property(r => r.Estado).HasMaxLength(2);
            entity.Property(r => r.CriadoPor).HasMaxLength(200).IsRequired();
            entity.Property(r => r.Cancelamento).HasMaxLength(1000);

            entity.HasIndex(r => new { r.Company, r.Numero }).IsUnique();
            entity.HasIndex(r => new { r.Company, r.Data });
            entity.HasIndex(r => new { r.Company, r.Status });
            entity.HasIndex(r => r.LancamentoId);
        });

        builder.Entity<AccountReceivable>(entity =>
        {
            entity.HasKey(a => a.Id);
            entity.Property(a => a.DisplayId).HasMaxLength(10).IsRequired();
            entity.Property(a => a.Company).HasMaxLength(200).IsRequired();
            entity.Property(a => a.ClientName).HasMaxLength(200).IsRequired();
            entity.Property(a => a.ClientDocument).HasMaxLength(20);
            entity.Property(a => a.Description).HasMaxLength(500);
            entity.Property(a => a.Value).HasColumnType("decimal(18,2)").IsRequired();
            entity.Property(a => a.IssueDate).HasColumnType("timestamp without time zone");
            entity.Property(a => a.DueDate).HasColumnType("timestamp without time zone");
            entity.Property(a => a.ReceivedDate).HasColumnType("timestamp without time zone");
            entity.Property(a => a.Status).HasConversion<string>().HasMaxLength(15).IsRequired();
            entity.Property(a => a.Category).HasMaxLength(120);
            entity.Property(a => a.Notes).HasMaxLength(1000);
            entity.Property(a => a.CreatedBy).HasMaxLength(200).IsRequired();

            entity.HasIndex(a => new { a.Company, a.Status });
            entity.HasIndex(a => new { a.Company, a.DueDate });
        });

        builder.Entity<AccountPayable>(entity =>
        {
            entity.HasKey(a => a.Id);
            entity.Property(a => a.DisplayId).HasMaxLength(10).IsRequired();
            entity.Property(a => a.Company).HasMaxLength(200).IsRequired();
            entity.Property(a => a.SupplierName).HasMaxLength(200).IsRequired();
            entity.Property(a => a.SupplierDocument).HasMaxLength(20);
            entity.Property(a => a.Description).HasMaxLength(500);
            entity.Property(a => a.Value).HasColumnType("decimal(18,2)").IsRequired();
            entity.Property(a => a.IssueDate).HasColumnType("timestamp without time zone");
            entity.Property(a => a.DueDate).HasColumnType("timestamp without time zone");
            entity.Property(a => a.PaymentDate).HasColumnType("timestamp without time zone");
            entity.Property(a => a.Status).HasConversion<string>().HasMaxLength(15).IsRequired();
            entity.Property(a => a.Category).HasMaxLength(120);
            entity.Property(a => a.Notes).HasMaxLength(1000);
            entity.Property(a => a.CreatedBy).HasMaxLength(200).IsRequired();

            entity.HasIndex(a => new { a.Company, a.Status });
            entity.HasIndex(a => new { a.Company, a.DueDate });
        });

        builder.Entity<Debt>(entity =>
        {
            entity.HasKey(d => d.Id);
            entity.Property(d => d.DisplayId).HasMaxLength(10).IsRequired();
            entity.Property(d => d.Company).HasMaxLength(200).IsRequired();
            entity.Property(d => d.Creditor).HasMaxLength(200).IsRequired();
            entity.Property(d => d.Description).HasMaxLength(500);
            entity.Property(d => d.TotalAmount).HasColumnType("decimal(18,2)").IsRequired();
            entity.Property(d => d.OutstandingBalance).HasColumnType("decimal(18,2)").IsRequired();
            entity.Property(d => d.InterestRate).HasColumnType("decimal(18,2)").IsRequired();
            entity.Property(d => d.StartDate).HasColumnType("timestamp without time zone");
            entity.Property(d => d.EndDate).HasColumnType("timestamp without time zone");
            entity.Property(d => d.InstallmentValue).HasColumnType("decimal(18,2)").IsRequired();
            entity.Property(d => d.Status).HasConversion<string>().HasMaxLength(15).IsRequired();
            entity.Property(d => d.Type).HasConversion<string>().HasMaxLength(15).IsRequired();
            entity.Property(d => d.Notes).HasMaxLength(1000);
            entity.Property(d => d.CreatedBy).HasMaxLength(200).IsRequired();

            entity.HasIndex(d => new { d.Company, d.Status });
        });

        builder.Entity<Investment>(entity =>
        {
            entity.HasKey(i => i.Id);
            entity.Property(i => i.DisplayId).HasMaxLength(10).IsRequired();
            entity.Property(i => i.Company).HasMaxLength(200).IsRequired();
            entity.Property(i => i.Name).HasMaxLength(200).IsRequired();
            entity.Property(i => i.Description).HasMaxLength(500);
            entity.Property(i => i.Type).HasConversion<string>().HasMaxLength(15).IsRequired();
            entity.Property(i => i.InvestedAmount).HasColumnType("decimal(18,2)").IsRequired();
            entity.Property(i => i.CurrentValue).HasColumnType("decimal(18,2)");
            entity.Property(i => i.StartDate).HasColumnType("timestamp without time zone");
            entity.Property(i => i.EndDate).HasColumnType("timestamp without time zone");
            entity.Property(i => i.ExpectedROI).HasColumnType("decimal(5,2)");
            entity.Property(i => i.ActualROI).HasColumnType("decimal(5,2)");
            entity.Property(i => i.IRR).HasColumnType("decimal(5,2)");
            entity.Property(i => i.NPV).HasColumnType("decimal(18,2)");
            entity.Property(i => i.Status).HasConversion<string>().HasMaxLength(15).IsRequired();
            entity.Property(i => i.Notes).HasMaxLength(1000);
            entity.Property(i => i.CreatedBy).HasMaxLength(200).IsRequired();

            entity.HasIndex(i => new { i.Company, i.Status });
        });

        builder.Entity<BalanceAccount>(entity =>
        {
            entity.HasKey(b => b.Id);
            entity.Property(b => b.Company).HasMaxLength(200).IsRequired();
            entity.Property(b => b.Code).HasMaxLength(20).IsRequired();
            entity.Property(b => b.Name).HasMaxLength(200).IsRequired();
            entity.Property(b => b.Nature).HasConversion<string>().HasMaxLength(15).IsRequired();
            entity.Property(b => b.Balance).HasColumnType("decimal(18,2)").IsRequired();
            entity.Property(b => b.Notes).HasMaxLength(1000);
            entity.Property(b => b.CreatedBy).HasMaxLength(200).IsRequired();

            entity.HasIndex(b => new { b.Company, b.Code }).IsUnique();
            entity.HasIndex(b => new { b.Company, b.Nature });
            entity.HasIndex(b => new { b.Company, b.Year, b.Month });
        });
    }
}
