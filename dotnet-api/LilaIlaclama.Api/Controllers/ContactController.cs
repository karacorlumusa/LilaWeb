using LilaIlaclama.Api.Data;
using LilaIlaclama.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace LilaIlaclama.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactController : ControllerBase
{
    private readonly AppDbContext _db;
    public ContactController(AppDbContext db) { _db = db; }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Create([FromBody] ContactCreateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Phone) || string.IsNullOrWhiteSpace(dto.Message))
            return BadRequest(new { success = false, message = "Ad, email, telefon ve mesaj alanları gereklidir" });

        var emailRegex = new Regex(@"^[^\s@]+@[^\s@]+\.[^\s@]+$");
        if (!emailRegex.IsMatch(dto.Email))
            return BadRequest(new { success = false, message = "Geçerli bir email adresi giriniz" });

        var entity = new ContactRequest
        {
            Name = dto.Name.Trim(),
            Email = dto.Email.Trim().ToLowerInvariant(),
            Phone = dto.Phone.Trim(),
            Service = string.IsNullOrWhiteSpace(dto.Service) ? "genel" : dto.Service!,
            Message = dto.Message.Trim(),
            Status = ContactStatus.New,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _db.ContactRequests.Add(entity);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, new
        {
            success = true,
            message = "Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.",
            data = new { id = entity.Id, name = entity.Name, email = entity.Email }
        });
    }

    [HttpGet]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] string? service)
    {
        var query = _db.ContactRequests.AsQueryable();
        if (!string.IsNullOrEmpty(status) && Enum.TryParse<ContactStatus>(status, true, out var statusEnum))
            query = query.Where(c => c.Status == statusEnum);
        if (!string.IsNullOrEmpty(service))
            query = query.Where(c => c.Service == service);
        var list = await query.OrderByDescending(c => c.CreatedAt).ToListAsync();
        return Ok(new { success = true, data = list, total = list.Count });
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetById([FromRoute] int id)
    {
        var entity = await _db.ContactRequests.FindAsync(id);
        if (entity == null)
            return NotFound(new { success = false, message = "İletişim talebi bulunamadı" });
        return Ok(new { success = true, data = entity });
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] ContactUpdateDto dto)
    {
        var entity = await _db.ContactRequests.FindAsync(id);
        if (entity == null)
            return NotFound(new { success = false, message = "İletişim talebi bulunamadı" });

        if (dto.Status.HasValue) entity.Status = dto.Status.Value;
        if (dto.Notes is not null) entity.Notes = dto.Notes;
        entity.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { success = true, message = "İletişim talebi başarıyla güncellendi", data = entity });
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete([FromRoute] int id)
    {
        var entity = await _db.ContactRequests.FindAsync(id);
        if (entity == null)
            return NotFound(new { success = false, message = "İletişim talebi bulunamadı" });
        _db.ContactRequests.Remove(entity);
        await _db.SaveChangesAsync();
        return Ok(new { success = true, message = "İletişim talebi başarıyla silindi" });
    }

    [HttpGet("stats/overview")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Stats()
    {
        var list = await _db.ContactRequests.ToListAsync();
        var stats = new
        {
            total = list.Count,
            @new = list.Count(x => x.Status == ContactStatus.New),
            contacted = list.Count(x => x.Status == ContactStatus.Contacted),
            completed = list.Count(x => x.Status == ContactStatus.Completed),
            services = new
            {
                ev = list.Count(x => x.Service == "ev"),
                isyeri = list.Count(x => x.Service == "isyeri"),
                cevre = list.Count(x => x.Service == "cevre"),
                genel = list.Count(x => x.Service == "genel"),
            }
        };
        return Ok(new { success = true, data = stats });
    }
}
