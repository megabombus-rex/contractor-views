using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ContractorsAPI.Migrations
{
    /// <inheritdoc />
    public partial class user_seeding : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "EmailAddress", "PasswordHash", "UserName" },
                values: new object[] { 1, "jan@example.com", "Not hashed.", "Jan Tran CEO" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1);
        }
    }
}
