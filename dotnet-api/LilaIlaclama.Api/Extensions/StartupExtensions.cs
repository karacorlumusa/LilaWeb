using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace LilaIlaclama.Api.Extensions;

public static class StartupExtensions
{
    public static IServiceCollection AddOpenApiMinimal(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen();
        return services;
    }

    public static IApplicationBuilder UseOpenApiMinimal(this IApplicationBuilder app)
    {
        app.UseSwagger();
        app.UseSwaggerUI();
        app.UseStatusCodePages(async ctx =>
        {
            ctx.HttpContext.Response.ContentType = "application/json";
            var code = ctx.HttpContext.Response.StatusCode;
            if (code == 404)
            {
                await ctx.HttpContext.Response.WriteAsJsonAsync(new { success = false, message = "API endpoint bulunamadı" });
            }
        });
        return app;
    }
}
