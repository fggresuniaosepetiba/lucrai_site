using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lucrai.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserLevelIsolation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CriadoPor",
                table: "Recibos");

            migrationBuilder.RenameColumn(
                name: "UserUploadId",
                table: "Documentos",
                newName: "CreatedBy");

            migrationBuilder.RenameColumn(
                name: "CriadoPor",
                table: "DocumentoAprendizados",
                newName: "CreatedBy");

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "SignatureConfigs",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "Recibos",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "Insumos",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "FixedCosts",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "DocumentoConfiguracoes",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "AuditLogs",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "SignatureConfigs");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Recibos");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Insumos");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "FixedCosts");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "DocumentoConfiguracoes");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "AuditLogs");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "Documentos",
                newName: "UserUploadId");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "DocumentoAprendizados",
                newName: "CriadoPor");

            migrationBuilder.AddColumn<string>(
                name: "CriadoPor",
                table: "Recibos",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");
        }
    }
}
