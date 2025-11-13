using AuthMicroservice.Application.Interfaces;
using AuthMicroservice.Application.UseCases;
using AuthMicroservice.Extensions;
using AuthMicroservice.Infrastructure.Config;
using AuthMicroservice.Infrastructure.Mapping;
using AuthMicroservice.Infrastructure.Persistence;
using AuthMicroservice.Infrastructure.Persistence.Entities;
using AuthMicroservice.Infrastructure.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Always use DefaultConnection (Docker SQL Server)
var connToUse = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new Exception("DefaultConnection is missing in appsettings.json");

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "MTB Auth API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Enter 'Bearer' [space] then your token",
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } },
            new string[] {}
        }
    });
});


// HealthCheck
builder.Services.AddHealthChecks();

// DbContext SQL Server with retry
builder.Services.AddDbContext<AuthDbContext>(opts =>
    opts.UseSqlServer(
        connToUse,
        sqlOptions => sqlOptions.EnableRetryOnFailure()
    ));

// Configurations
builder.Services.AddAuthMicroserviceServices(builder.Configuration);

// Rate Limiter for Auth endpoints
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("auth", limiter =>
    {
        limiter.Window = TimeSpan.FromSeconds(10);
        limiter.PermitLimit = 5;
        limiter.QueueLimit = 0;
    });
});


// Cross origins (frontend React)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:8081",      // Expo web
                "http://192.168.1.44:8081",   // Expo sur ton téléphone
                "exp://192.168.1.44:8081"     // Expo Go app
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// Authentification JWT
var jwtConfig = builder.Configuration.GetSection("Jwt").Get<JwtSettings>()!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtConfig.Issuer,
            ValidAudience = jwtConfig.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtConfig.Secret))
        };
    });
builder.Services.AddAuthorization();

var app = builder.Build();

// Migration and Seed (Admin + ServiceClients) with retry
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var retry = 0;
    var maxRetries = 10;
    var delay = TimeSpan.FromSeconds(5);

    while (retry < maxRetries)
    {
        try
        {
            var context = services.GetRequiredService<AuthDbContext>();
            await context.Database.MigrateAsync();

            // Seed Admin
            var seeder = services.GetRequiredService<SeedAdminUseCase>();
            await seeder.ExecuteAsync(
                builder.Configuration["Admin:Email"]!,
                builder.Configuration["Admin:Password"]!
            );

            // Seed Service Clients
            var seedClients = services.GetRequiredService<SeedServiceClientsUseCase>();
            await seedClients.ExecuteAsync(); 
            
            break;
        }
        catch (Exception ex)
        {
            retry++;
            Console.WriteLine($"Attempt {retry}/{maxRetries} failed: {ex.Message}");
            await Task.Delay(delay);
        }
    }
    if (retry == maxRetries)
    {
        Console.WriteLine("Failed to seed the database after multiple retries.");
    }
}


if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();  // Show detailed errors in development
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseExceptionHandler("/error"); // Route for global error handling
}


app.UseCors("AllowFrontend");

app.UseAuthentication();

app.UseAuthorization();

app.UseRateLimiter();

app.MapControllers();

app.MapHealthChecks("/health");

app.Run();
