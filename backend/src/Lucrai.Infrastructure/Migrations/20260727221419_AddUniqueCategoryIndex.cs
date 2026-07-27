using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lucrai.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUniqueCategoryIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Remove existing duplicates before applying unique index.
            // Keep oldest category per (LOWER(TRIM(Name)), Type, Company),
            // reassign transactions to it, then delete the rest.
            migrationBuilder.Sql(@"
                UPDATE ""Transactions"" t
                SET ""CategoryId"" = k.keep_id,
                    ""CategoryName"" = k.keep_name
                FROM (
                    SELECT c2.""Id"" AS dup_id,
                           MIN(c3.""Id"") AS keep_id,
                           MIN(c3.""Name"") AS keep_name
                    FROM ""Categories"" c2
                    INNER JOIN ""Categories"" c3
                        ON LOWER(TRIM(c3.""Name"")) = LOWER(TRIM(c2.""Name""))
                        AND c3.""Type"" = c2.""Type""
                        AND c3.""Company"" = c2.""Company""
                    GROUP BY c2.""Id""
                    HAVING COUNT(*) > 1 AND c2.""Id"" <> MIN(c3.""Id"")
                ) k
                WHERE t.""CategoryId"" = k.dup_id;

                DELETE FROM ""Categories"" c
                WHERE c.""Id"" NOT IN (
                    SELECT MIN(c2.""Id"")
                    FROM ""Categories"" c2
                    GROUP BY LOWER(TRIM(c2.""Name"")), c2.""Type"", c2.""Company""
                );
            ");

            migrationBuilder.DropIndex(
                name: "IX_Categories_Company_Name",
                table: "Categories");

            migrationBuilder.CreateIndex(
                name: "IX_Categories_Name_Type_Company",
                table: "Categories",
                columns: new[] { "Name", "Type", "Company" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Categories_Name_Type_Company",
                table: "Categories");

            migrationBuilder.CreateIndex(
                name: "IX_Categories_Company_Name",
                table: "Categories",
                columns: new[] { "Company", "Name" });
        }
    }
}
