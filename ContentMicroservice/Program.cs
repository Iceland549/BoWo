using ContentMicroservice.Extensions;
using ContentMicroservice.Infrastructure.Config;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MongoDB.Bson.Serialization.Conventions;
using MongoDB.Driver;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// -------------------------------------------------------------------
// MongoDB Configuration
// -------------------------------------------------------------------
builder.Services.Configure<MongoDbConfig>(
    builder.Configuration.GetSection("Mongo")
);

var pack = new ConventionPack { new CamelCaseElementNameConvention() };
ConventionRegistry.Register("CamelCase", pack, t => true);
builder.Services.AddSingleton<IMongoClient>(sp =>
{
    var cfg = builder.Configuration.GetSection("Mongo").Get<MongoDbConfig>();
    if (cfg == null || string.IsNullOrEmpty(cfg.ConnectionString))
    {
        throw new InvalidOperationException(
            "MongoDB configuration is missing or invalid. Please check your appsettings.json file.");
    }
    return new MongoClient(cfg.ConnectionString);
});

// -------------------------------------------------------------------
// Core Services
// -------------------------------------------------------------------
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Swagger
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "BoWo Content API",
        Version = "v1",
        Description = "Microservice for tricks, videos and content management."
    });

    // JWT Security Definition
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Enter 'Bearer' [space] then your JWT token.",
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] { }
        }
    });
});

// -------------------------------------------------------------------
// Health Checks
// -------------------------------------------------------------------
builder.Services.AddHealthChecks();

// -------------------------------------------------------------------
// Dependency Injection for Application / Infrastructure Layers
// -------------------------------------------------------------------
builder.Services.AddContentMicroserviceServices(builder.Configuration);

// -------------------------------------------------------------------
// CORS (Expo Mobile, Local Dev, Gateway)
// -------------------------------------------------------------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowExpo", policy =>
    {
        policy.WithOrigins(
                "http://localhost:8081",      // Expo local dev
                "exp://192.168.0.0:8081",     // Expo LAN (change IP)
                "http://localhost:5000"       // Gateway
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// -------------------------------------------------------------------
// JWT Authentication (shared with AuthMicroservice)
// -------------------------------------------------------------------
var jwtConfig = builder.Configuration.GetSection("Jwt");
var issuer = jwtConfig["Issuer"];
var audience = jwtConfig["Audience"];
var secret = jwtConfig["Secret"];

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = issuer,
            ValidAudience = audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret!))
        };
    });
builder.Services.AddAuthorization();

// -------------------------------------------------------------------
// Build App
// -------------------------------------------------------------------
var app = builder.Build();

// -------------------------------------------------------------------
// Middleware Pipeline
// -------------------------------------------------------------------
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseExceptionHandler("/error");
}
app.UseStaticFiles();

app.UseHttpsRedirection();

app.UseCors("AllowExpo");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

// -------------------------------------------------------------------
app.Run();
