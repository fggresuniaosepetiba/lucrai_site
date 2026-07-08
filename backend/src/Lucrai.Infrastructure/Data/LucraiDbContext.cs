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
            entity.Property(t => t.Observation).HasMaxLength(1000);
            entity.Property(t => t.Company).HasMaxLength(200).IsRequired();

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
            entity.Property(f => f.Status).HasConversion<string>().HasMaxLength(15).IsRequired();
            entity.Property(f => f.Notes).HasMaxLength(1000);
            entity.Property(f => f.Company).HasMaxLength(200).IsRequired();
            entity.Property(f => f.CancelledReason).HasMaxLength(500);
            entity.Property(f => f.CancelledBy).HasMaxLength(200);
            entity.Property(f => f.RecurrenceType).HasConversion<string>().HasMaxLength(15);

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
            entity.Property(r => r.Senha).HasMaxLength(500).IsRequired();
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
    }
}
