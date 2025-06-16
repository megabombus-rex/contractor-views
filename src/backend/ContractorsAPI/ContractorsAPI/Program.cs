using ContractorsAPI.Configuration;
using ContractorsAPI.Database;
using ContractorsAPI.Services.Authorization;
using ContractorsAPI.Services.Authorization.Interfaces;
using ContractorsAPI.Services.Business;
using ContractorsAPI.Services.Business.Interfaces;
using Microsoft.AspNetCore.Localization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Serilog;
using System.Globalization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

ConfigureServices(builder);

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ContractorsDbContext>();
    db.Database.Migrate();
}

app.UseRequestLocalization(options =>
{
    options.DefaultRequestCulture = new RequestCulture(CultureInfo.InvariantCulture);
    options.SupportedCultures = [CultureInfo.InvariantCulture];
    options.SupportedUICultures = [CultureInfo.InvariantCulture];
});

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseSerilogRequestLogging();
app.UseCors();
app.UseAuthorization();

app.MapControllers();

app.Run();
app.Logger.LogInformation("Application starting up locally");
void ConfigureServices(WebApplicationBuilder builder)
{
    ConfigureDb(builder);
    ConfigureJWT(builder);
    builder.Services.TryAddScoped<IContractorService, ContractorService>();
    builder.Services.TryAddScoped<IReportingService, ReportingService>();
    builder.Services.TryAddScoped<IAuthenticationService, AuthorizationService>();

    builder.Services.AddCors(options =>
    {
        options.AddDefaultPolicy(policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
    });

    builder.Host.UseSerilog((context, configuration) =>
        configuration.ReadFrom.Configuration(context.Configuration));
}

void ConfigureJWT(WebApplicationBuilder builder)
{
    var section = builder.Configuration.GetSection("JWT");
    builder.Services.Configure<AuthorizationJWTOptions>(section);

    Console.WriteLine($"Section found: {section.Value}");
}

void ConfigureDb(WebApplicationBuilder builder)
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

    if (string.IsNullOrEmpty(connectionString))
    {
        // build from individual environment variables
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

    builder.Services.AddDbContext<ContractorsDbContext>(options =>
        options.UseNpgsql(connectionString));
}