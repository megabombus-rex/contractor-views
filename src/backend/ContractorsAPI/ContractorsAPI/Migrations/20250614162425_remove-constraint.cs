using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ContractorsAPI.Migrations
{
    /// <inheritdoc />
    public partial class removeconstraint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_ContractorAdditionalData_FieldType",
                table: "ContractorsAdditionalData");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddCheckConstraint(
                name: "CK_ContractorAdditionalData_FieldType",
                table: "ContractorsAdditionalData",
                sql: "'FieldType' IN ('string', 'int', 'bool', 'decimal', 'datetime')");
        }
    }
}
