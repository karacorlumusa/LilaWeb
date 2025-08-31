using LilaIlaclama.Api.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace LilaIlaclama.Api.Services;

public interface IJwtService
{
    string CreateToken(User user, TimeSpan? expires = null);
}

public interface IClock
{
    DateTime UtcNow { get; }
}

public class SystemClock : IClock
{
    public DateTime UtcNow => DateTime.UtcNow;
}

public class JwtService : IJwtService
{
    private readonly IConfiguration _config;
    private readonly IClock _clock;

    public JwtService(IConfiguration config, IClock clock)
    {
        _config = config;
        _clock = clock;
    }

    public string CreateToken(User user, TimeSpan? expires = null)
    {
        var secret = Environment.GetEnvironmentVariable("JWT_SECRET") ?? _config["Jwt:Secret"]!;
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new("username", user.Username),
            new(ClaimTypes.Role, user.Role)
        };

        var token = new JwtSecurityToken(
            claims: claims,
            expires: _clock.UtcNow.Add(expires ?? TimeSpan.FromHours(24)),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
