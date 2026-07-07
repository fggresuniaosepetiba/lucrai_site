using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lucrai.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixUserPlanAndMustChangePasswordDefaults : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                "UPDATE \"AspNetUsers\" SET \"Plan\" = 'Basic' WHERE \"Plan\" = '' OR \"Plan\" IS NULL");

            migrationBuilder.Sql(
                "UPDATE \"AspNetUsers\" SET \"MustChangePassword\" = true WHERE NOT \"MustChangePassword\"");

            migrationBuilder.AlterColumn<string>(
                name: "Plan",
                table: "AspNetUsers",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Basic");

            migrationBuilder.AlterColumn<bool>(
                name: "MustChangePassword",
                table: "AspNetUsers",
                type: "boolean",
                nullable: false,
                defaultValue: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Plan",
                table: "AspNetUsers",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<bool>(
                name: "MustChangePassword",
                table: "AspNetUsers",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.Sql(
                "UPDATE \"AspNetUsers\" SET \"Plan\" = '' WHERE \"Plan\" = 'Basic'");

            migrationBuilder.Sql(
                "UPDATE \"AspNetUsers\" SET \"MustChangePassword\" = false WHERE \"MustChangePassword\"");
        }
    }
}
