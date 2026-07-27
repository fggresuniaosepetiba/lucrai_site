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
            // keep the oldest (earliest CreatedAt), reassign transactions, delete the rest.
            // Avoids MIN(uuid) for PostgreSQL compatibility.
            migrationBuilder.Sql(@"
                DO $$
                DECLARE
                    rec RECORD;
                    keep_id UUID;
                    keep_name TEXT;
                BEGIN
                    FOR rec IN
                        SELECT c.""Type"",
                               c.""Company"",
                               LOWER(TRIM(c.""Name"")) AS norm_name
                        FROM ""Categories"" c
                        GROUP BY c.""Type"", c.""Company"", LOWER(TRIM(c.""Name""))
                        HAVING COUNT(*) > 1
                    LOOP
                        SELECT c2.""Id"", c2.""Name"" INTO keep_id, keep_name
                        FROM ""Categories"" c2
                        WHERE LOWER(TRIM(c2.""Name"")) = rec.norm_name
                          AND c2.""Type"" = rec.""Type""
                          AND c2.""Company"" = rec.""Company""
                        ORDER BY c2.""CreatedAt""
                        LIMIT 1;

                        UPDATE ""Transactions""
                        SET ""CategoryId"" = keep_id,
                            ""CategoryName"" = keep_name
                        WHERE ""CategoryId"" IN (
                            SELECT c3.""Id""
                            FROM ""Categories"" c3
                            WHERE LOWER(TRIM(c3.""Name"")) = rec.norm_name
                              AND c3.""Type"" = rec.""Type""
                              AND c3.""Company"" = rec.""Company""
                              AND c3.""Id"" <> keep_id
                        );

                        DELETE FROM ""Categories"" c3
                        WHERE LOWER(TRIM(c3.""Name"")) = rec.norm_name
                          AND c3.""Type"" = rec.""Type""
                          AND c3.""Company"" = rec.""Company""
                          AND c3.""Id"" <> keep_id;
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
