using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lucrai.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDocumentoFinanceiro : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Documentos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Company = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    UserUploadId = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    NomeArquivoOriginal = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    NomeArquivoStorage = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    PathStorage = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    TipoArquivo = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    TamanhoBytes = table.Column<long>(type: "bigint", nullable: false),
                    HashArquivo = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    TipoDocumentoDetectado = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ValorExtraido = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    DataExtraida = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    FavorecidoExtraido = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    EmitenteExtraido = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    DescricaoExtraida = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    TipoMovimentacaoSugerido = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    CategoriaSugeridaId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ConfiancaExtracao = table.Column<int>(type: "integer", nullable: true),
                    DadosExtraidosRaw = table.Column<string>(type: "text", nullable: true),
                    DadosEstruturados = table.Column<string>(type: "text", nullable: true),
                    ObservacoesIa = table.Column<string>(type: "text", nullable: true),
                    ResumoExecutivo = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    LancamentoId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    UsuarioConferenciaId = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    DataConferencia = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    MotivoRejeicao = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    MotivoExclusao = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ExclusaoPermanente = table.Column<bool>(type: "boolean", nullable: true),
                    ExcluidoPor = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    DataExclusao = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    TentativasProcessamento = table.Column<int>(type: "integer", nullable: false),
                    UltimoErro = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ArquivoData = table.Column<byte[]>(type: "bytea", nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExcluidoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Documentos", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Documentos_Company_CriadoEm",
                table: "Documentos",
                columns: new[] { "Company", "CriadoEm" });

            migrationBuilder.CreateIndex(
                name: "IX_Documentos_Company_Status",
                table: "Documentos",
                columns: new[] { "Company", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Documentos_HashArquivo",
                table: "Documentos",
                column: "HashArquivo");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Documentos");
        }
    }
}
