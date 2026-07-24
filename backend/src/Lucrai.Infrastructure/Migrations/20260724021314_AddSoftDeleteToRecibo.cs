using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lucrai.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSoftDeleteToRecibo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ExcluidoEm",
                table: "Recibos",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExcluidoPor",
                table: "Recibos",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ExpiracaoEm",
                table: "Recibos",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Recibos_Company_ExcluidoEm",
                table: "Recibos",
                columns: new[] { "Company", "ExcluidoEm" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Recibos_Company_ExcluidoEm",
                table: "Recibos");

            migrationBuilder.DropColumn(
                name: "ExcluidoEm",
                table: "Recibos");

            migrationBuilder.DropColumn(
                name: "ExcluidoPor",
                table: "Recibos");

            migrationBuilder.DropColumn(
                name: "ExpiracaoEm",
                table: "Recibos");
        }
    }
}
