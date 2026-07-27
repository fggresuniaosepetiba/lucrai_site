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
            // For each (Type, Company, normalized Name) group with >1 row,
            // keep the oldest (MIN Id), reassign its transactions, delete the rest.
            migrationBuilder.Sql(@"
                DO $$
                DECLARE
                    rec RECORD;
                BEGIN
                    FOR rec IN
                        SELECT MIN(c.""Id"") AS keep_id,
                               MIN(c.""Name"") AS keep_name,
                               c.""Type"",
                               c.""Company"",
                               LOWER(TRIM(c.""Name"")) AS norm_name
                        FROM ""Categories"" c
                        GROUP BY c.""Type"", c.""Company"", LOWER(TRIM(c.""Name""))
                        HAVING COUNT(*) > 1
                    LOOP
                        UPDATE ""Transactions""
                        SET ""CategoryId"" = rec.keep_id,
                            ""CategoryName"" = rec.keep_name
                        WHERE ""CategoryId"" IN (
                            SELECT c2.""Id""
                            FROM ""Categories"" c2
                            WHERE LOWER(TRIM(c2.""Name"")) = rec.norm_name
                              AND c2.""Type"" = rec.""Type""
                              AND c2.""Company"" = rec.""Company""
                              AND c2.""Id"" <> rec.keep_id
                        );

                        DELETE FROM ""Categories"" c2
                        WHERE LOWER(TRIM(c2.""Name"")) = rec.norm_name
                          AND c2.""Type"" = rec.""Type""
                          AND c2.""Company"" = rec.""Company""
                          AND c2.""Id"" <> rec.keep_id;
                    END LOOP;
                END $$;
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
