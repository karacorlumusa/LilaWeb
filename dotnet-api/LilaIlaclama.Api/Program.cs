using LilaIlaclama.Api.Data;
using LilaIlaclama.Api.Models;
using LilaIlaclama.Api.Extensions;
using LilaIlaclama.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .CreateLogger();
builder.Host.UseSerilog();

// Config
var jwtSection = builder.Configuration.GetSection("Jwt");
var corsOrigins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? new[] { "http://localhost:5173", "http://localhost:5174", "http://localhost:3000" };

// EF Core (SQL Server)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

// Services
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddSingleton<IClock, SystemClock>();

// Auth
var key = Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("JWT_SECRET") ?? jwtSection.GetValue<string>("Secret")!);
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            // In development, allow any origin to avoid port mismatch issues (e.g., Vite 5173/5174/5175)
            policy
                .AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
        else
        {
            policy
                .WithOrigins(corsOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        }
    });
});

// Controllers
builder.Services.AddControllers();
builder.Services.AddSwaggerWithJwt();

// Rate limiting (fixed window)
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("fixed", opt =>
    {
        opt.Window = TimeSpan.FromMinutes(15);
        opt.PermitLimit = 100;
        opt.QueueLimit = 0;
    });
});

var app = builder.Build();

// Ensure folders
Directory.CreateDirectory(Path.Combine(app.Environment.ContentRootPath, "uploads"));
Directory.CreateDirectory(Path.Combine(app.Environment.ContentRootPath, "App_Data"));

// Create schema and seed
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.EnsureCreatedAsync();
    await SeedData.EnsureSeedAsync(db);
}

// Middleware
app.UseSerilogRequestLogging();
app.UseCors();
app.UseRateLimiter();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.UseSwaggerWithJwt();

// Static files for uploads
var uploadsPath = Path.Combine(app.Environment.ContentRootPath, "uploads");
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});

// Global error handling
app.Use(async (context, next) =>
{
    try { await next(); }
    catch (Exception ex)
    {
        Log.Error(ex, "Unhandled exception");
        context.Response.StatusCode = 500;
        await context.Response.WriteAsJsonAsync(new { success = false, message = "Sunucu hatası oluştu" });
    }
});

app.MapControllers();

// Health
app.MapGet("/api/health", () => Results.Json(new
{
    status = "OK",
    message = "Lila İlaçlama API is running",
    timestamp = DateTime.UtcNow.ToString("o")
}));

// 404 handler (API fallback)
app.MapFallback(async ctx =>
{
    ctx.Response.StatusCode = 404;
    ctx.Response.ContentType = "application/json";
    await ctx.Response.WriteAsJsonAsync(new { success = false, message = "API endpoint bulunamadı" });
});

app.Run();
