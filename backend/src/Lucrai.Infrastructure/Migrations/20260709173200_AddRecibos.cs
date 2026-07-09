using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lucrai.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRecibos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Recibos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DisplayId = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    Company = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Numero = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Tipo = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    Origem = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    Status = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    Data = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    Valor = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    ValorPorExtenso = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    NomePagador = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    DocumentoPagador = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    SemDocumentoPagador = table.Column<bool>(type: "boolean", nullable: false),
                    NomeRecebedor = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    DocumentoRecebedor = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    SemDocumentoRecebedor = table.Column<bool>(type: "boolean", nullable: false),
                    Referente = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    FormaPagamento = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Observacoes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Telefone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Cidade = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Estado = table.Column<string>(type: "character varying(2)", maxLength: 2, nullable: true),
                    ExibirAssinatura = table.Column<bool>(type: "boolean", nullable: false),
                    ParcelaAtual = table.Column<int>(type: "integer", nullable: true),
                    ParcelasTotal = table.Column<int>(type: "integer", nullable: true),
                    LancamentoId = table.Column<Guid>(type: "uuid", nullable: true),
                    CriadoPor = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Cancelamento = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Recibos", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Recibos_Company_Data",
                table: "Recibos",
                columns: new[] { "Company", "Data" });

            migrationBuilder.CreateIndex(
                name: "IX_Recibos_Company_Numero",
                table: "Recibos",
                columns: new[] { "Company", "Numero" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Recibos_Company_Status",
                table: "Recibos",
                columns: new[] { "Company", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Recibos_LancamentoId",
                table: "Recibos",
                column: "LancamentoId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Recibos");
        }
    }
}
