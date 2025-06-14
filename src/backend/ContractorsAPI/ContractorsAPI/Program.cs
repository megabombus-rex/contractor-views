using ContractorsAPI.Database;
using ContractorsAPI.Services;
using ContractorsAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

ConfigureServices(builder.Services);

app.UseAuthorization();

app.MapControllers();

app.Run();

void ConfigureServices(IServiceCollection services)
{
    ConfigureDb(services);
    services.TryAddScoped<IContractorService, ContractorService>();
}

void ConfigureDb(IServiceCollection services)
{

    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

    if (string.IsNullOrEmpty(connectionString))
    {
        // Fallback: build from individual environment variables
        var host = builder.Configuration["DB_HOST"] ?? "localhost";
        var database = builder.Configuration["POSTGRES_DB"] ?? "contractors_db";
        var username = builder.Configuration["POSTGRES_USER"] ?? "contractors_user";
        var password = builder.Configuration["POSTGRES_PASSWORD"];

        if (string.IsNullOrEmpty(password))
        {
            throw new InvalidOperationException("Database password not configured");
        }

        connectionString = $"Host={host};Database={database};Username={username};Password={password}";
    }

    services.AddDbContext<ContractorsDbContext>(options =>
        options.UseNpgsql(connectionString));
}