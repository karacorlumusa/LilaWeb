using LilaIlaclama.Api.Data;
using LilaIlaclama.Api.Models;
using LilaIlaclama.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LilaIlaclama.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IJwtService _jwt;

    public AuthController(AppDbContext db, IJwtService jwt)
    {
        _db = db; _jwt = jwt;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Username) || string.IsNullOrWhiteSpace(req.Password))
            return BadRequest(new { success = false, message = "Kullanıcı adı ve şifre gereklidir" });

        var user = await _db.Users.SingleOrDefaultAsync(u => u.Username == req.Username);
        if (user is null)
            return Unauthorized(new { success = false, message = "Geçersiz kullanıcı adı veya şifre" });

        var hash = Data.SeedData.HashPassword(req.Password, user.PasswordSalt);
        if (hash != user.PasswordHash)
            return Unauthorized(new { success = false, message = "Geçersiz kullanıcı adı veya şifre" });

        var token = _jwt.CreateToken(user, TimeSpan.FromHours(24));
        return Ok(new
        {
            success = true,
            message = "Giriş başarılı",
            token,
            user = new { id = user.Id, username = user.Username, role = user.Role }
        });
    }

    [HttpPost("verify")]
    [Authorize]
    public IActionResult Verify()
    {
        var id = User.Claims.FirstOrDefault(c => c.Type == System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        var username = User.Claims.FirstOrDefault(c => c.Type == "username")?.Value;
        var role = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Role)?.Value;
        return Ok(new { success = true, user = new { id, username, role } });
    }
}
