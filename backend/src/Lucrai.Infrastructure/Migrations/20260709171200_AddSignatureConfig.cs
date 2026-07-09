using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lucrai.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSignatureConfig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FixedCosts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Company = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Aluguel = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Energia = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Agua = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Internet = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Contador = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    ProLabore = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Softwares = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Telefone = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Marketing = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Limpeza = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Outros = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    CustomCosts = table.Column<string>(type: "text", nullable: true),
                    Total = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FixedCosts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SignatureConfigs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Company = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ImagemBase64 = table.Column<string>(type: "text", nullable: true),
                    NomeResponsavel = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Cargo = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    PermitirUso = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SignatureConfigs", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FixedCosts_Company",
                table: "FixedCosts",
                column: "Company",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SignatureConfigs_Company",
                table: "SignatureConfigs",
                column: "Company",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FixedCosts");

            migrationBuilder.DropTable(
                name: "SignatureConfigs");
        }
    }
}
