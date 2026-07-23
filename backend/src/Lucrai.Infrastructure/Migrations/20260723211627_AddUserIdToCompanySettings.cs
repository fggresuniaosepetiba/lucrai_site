using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lucrai.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserIdToCompanySettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CompanySettings_Company",
                table: "CompanySettings");

            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "CompanySettings",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_CompanySettings_UserId_Company",
                table: "CompanySettings",
                columns: new[] { "UserId", "Company" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CompanySettings_UserId_Company",
                table: "CompanySettings");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "CompanySettings");

            migrationBuilder.CreateIndex(
                name: "IX_CompanySettings_Company",
                table: "CompanySettings",
                column: "Company",
                unique: true);
        }
    }
}
