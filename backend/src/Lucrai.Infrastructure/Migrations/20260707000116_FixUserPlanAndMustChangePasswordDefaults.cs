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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                "UPDATE \"AspNetUsers\" SET \"Plan\" = '' WHERE \"Plan\" = 'Basic'");

            migrationBuilder.Sql(
                "UPDATE \"AspNetUsers\" SET \"MustChangePassword\" = false WHERE \"MustChangePassword\"");
        }
    }
}
