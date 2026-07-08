using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lucrai.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDocumentoLogAprendizadoConfig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DocumentoAprendizados",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Company = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Chave = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    CategoriaId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    TipoMovimentacao = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    ConfiancaMinima = table.Column<int>(type: "integer", nullable: true),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CriadoPor = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentoAprendizados", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DocumentoConfiguracoes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Company = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    CategorizacaoAutomatica = table.Column<bool>(type: "boolean", nullable: false),
                    CriarLancamentoAutomatico = table.Column<bool>(type: "boolean", nullable: false),
                    DiasRetencaoLixeira = table.Column<int>(type: "integer", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentoConfiguracoes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DocumentoLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DocumentoId = table.Column<Guid>(type: "uuid", nullable: true),
                    Company = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Acao = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Descricao = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    UsuarioId = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    UsuarioNome = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Detalhes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentoLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DocumentoTrash",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DocumentoId = table.Column<Guid>(type: "uuid", nullable: false),
                    Company = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    NomeArquivoOriginal = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    TipoArquivo = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    TamanhoBytes = table.Column<long>(type: "bigint", nullable: false),
                    StatusOriginal = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    MotivoExclusao = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ExcluidoPor = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ExcluidoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpiracaoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    SnapshotJson = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentoTrash", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DocumentoAprendizados_Company_Ativo",
                table: "DocumentoAprendizados",
                columns: new[] { "Company", "Ativo" });

            migrationBuilder.CreateIndex(
                name: "IX_DocumentoAprendizados_Company_Chave",
                table: "DocumentoAprendizados",
                columns: new[] { "Company", "Chave" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DocumentoConfiguracoes_Company",
                table: "DocumentoConfiguracoes",
                column: "Company",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DocumentoLogs_Company_CriadoEm",
                table: "DocumentoLogs",
                columns: new[] { "Company", "CriadoEm" });

            migrationBuilder.CreateIndex(
                name: "IX_DocumentoLogs_DocumentoId",
                table: "DocumentoLogs",
                column: "DocumentoId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentoTrash_Company_ExcluidoEm",
                table: "DocumentoTrash",
                columns: new[] { "Company", "ExcluidoEm" });

            migrationBuilder.CreateIndex(
                name: "IX_DocumentoTrash_Company_ExpiracaoEm",
                table: "DocumentoTrash",
                columns: new[] { "Company", "ExpiracaoEm" });

            migrationBuilder.CreateIndex(
                name: "IX_DocumentoTrash_DocumentoId",
                table: "DocumentoTrash",
                column: "DocumentoId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DocumentoAprendizados");

            migrationBuilder.DropTable(
                name: "DocumentoConfiguracoes");

            migrationBuilder.DropTable(
                name: "DocumentoLogs");

            migrationBuilder.DropTable(
                name: "DocumentoTrash");
        }
    }
}
