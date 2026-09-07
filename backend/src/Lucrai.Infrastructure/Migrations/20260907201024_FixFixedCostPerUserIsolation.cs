using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lucrai.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixFixedCostPerUserIsolation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM \"FixedCosts\" WHERE \"CreatedBy\" IS NULL OR \"CreatedBy\" = ''");

            migrationBuilder.DropIndex(
                name: "IX_FixedCosts_Company",
                table: "FixedCosts");

            migrationBuilder.AlterColumn<string>(
                name: "CreatedBy",
                table: "FixedCosts",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200,
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_FixedCosts_Company_CreatedBy",
                table: "FixedCosts",
                columns: new[] { "Company", "CreatedBy" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_FixedCosts_Company_CreatedBy",
                table: "FixedCosts");

            migrationBuilder.AlterColumn<string>(
                name: "CreatedBy",
                table: "FixedCosts",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200);

            migrationBuilder.CreateIndex(
                name: "IX_FixedCosts_Company",
                table: "FixedCosts",
                column: "Company",
                unique: true);
        }
    }
}
