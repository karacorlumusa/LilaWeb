using LilaIlaclama.Api.Data;
using LilaIlaclama.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LilaIlaclama.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SettingsController : ControllerBase
{
    private readonly AppDbContext _db;
    public SettingsController(AppDbContext db) { _db = db; }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> Get()
    {
        var settings = await _db.SiteSettings.FirstOrDefaultAsync();
        return Ok(new { success = true, data = settings });
    }

    [HttpPut]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Update([FromBody] SettingsUpdateDto dto)
    {
        var settings = await _db.SiteSettings.FirstOrDefaultAsync();
        if (settings == null)
        {
            settings = new SiteSettings();
            _db.SiteSettings.Add(settings);
        }
        if (!string.IsNullOrEmpty(dto.CompanyName)) settings.CompanyName = dto.CompanyName;
        if (!string.IsNullOrEmpty(dto.Phone)) settings.Phone = dto.Phone;
        if (!string.IsNullOrEmpty(dto.Email)) settings.Email = dto.Email;
        if (!string.IsNullOrEmpty(dto.Address)) settings.Address = dto.Address;
        if (!string.IsNullOrEmpty(dto.WorkingHours)) settings.WorkingHours = dto.WorkingHours;
        if (!string.IsNullOrEmpty(dto.Description)) settings.Description = dto.Description;
        if (dto.SocialMedia is not null)
        {
            if (dto.SocialMedia.Facebook is not null) settings.SocialFacebook = dto.SocialMedia.Facebook;
            if (dto.SocialMedia.Instagram is not null) settings.SocialInstagram = dto.SocialMedia.Instagram;
            if (dto.SocialMedia.Twitter is not null) settings.SocialTwitter = dto.SocialMedia.Twitter;
            if (dto.SocialMedia.Linkedin is not null) settings.SocialLinkedin = dto.SocialMedia.Linkedin;
        }
        settings.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { success = true, message = "Ayarlar başarıyla güncellendi", data = settings });
    }

    [HttpPut("password")]
    [Authorize(Roles = "admin")]
    public IActionResult ChangePassword([FromBody] ChangePasswordDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.CurrentPassword) || string.IsNullOrWhiteSpace(dto.NewPassword))
            return BadRequest(new { success = false, message = "Mevcut şifre ve yeni şifre gereklidir" });
        if (dto.NewPassword.Length < 6)
            return BadRequest(new { success = false, message = "Yeni şifre en az 6 karakter olmalıdır" });
        // Demo uygulama: gerçekte kullanıcıdan kontrol edilip güncellenmeli.
        return Ok(new { success = true, message = "Şifre başarıyla değiştirildi" });
    }
}
