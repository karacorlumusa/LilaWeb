using LilaIlaclama.Api.Data;
using LilaIlaclama.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LilaIlaclama.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MediaController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;

    public MediaController(AppDbContext db, IWebHostEnvironment env)
    {
        _db = db; _env = env;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] string? category, [FromQuery] string? type, [FromQuery] string? status)
    {
        var query = _db.MediaItems.AsQueryable();
        if (!string.IsNullOrEmpty(category) && category != "all")
            query = query.Where(m => m.Category == category);
        if (!string.IsNullOrEmpty(type) && Enum.TryParse<MediaType>(type, true, out var typeEnum))
            query = query.Where(m => m.Type == typeEnum);
        if (!string.IsNullOrEmpty(status) && Enum.TryParse<MediaStatus>(status, true, out var statusEnum))
            query = query.Where(m => m.Status == statusEnum);
        var list = await query.OrderByDescending(m => m.CreatedAt).ToListAsync();
        return Ok(new { success = true, data = list, total = list.Count });
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById([FromRoute] int id)
    {
        var entity = await _db.MediaItems.FindAsync(id);
        if (entity == null)
            return NotFound(new { success = false, message = "Medya öğesi bulunamadı" });
        return Ok(new { success = true, data = entity });
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    [RequestSizeLimit(50 * 1024 * 1024)]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Create([FromForm] MediaCreateForm form)
    {
        var file = form.File;
        if (file == null)
            return BadRequest(new { success = false, message = "Dosya yüklenmesi gereklidir" });
        if (string.IsNullOrWhiteSpace(form.Title) || string.IsNullOrWhiteSpace(form.Category))
            return BadRequest(new { success = false, message = "Başlık ve kategori gereklidir" });

        var allowed = new[] { ".jpeg", ".jpg", ".png", ".gif", ".mp4", ".avi", ".mov", ".wmv" };
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowed.Contains(ext))
            return BadRequest(new { success = false, message = "Sadece resim ve video dosyaları yüklenebilir!" });

        var uploads = Path.Combine(_env.ContentRootPath, "uploads");
        Directory.CreateDirectory(uploads);
        var unique = $"file-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}-{Guid.NewGuid():N}{ext}";
        var savePath = Path.Combine(uploads, unique);
        await using (var fs = System.IO.File.Create(savePath))
        {
            await file.CopyToAsync(fs);
        }

        var type = file.ContentType.StartsWith("video/") ? MediaType.Video : MediaType.Image;
        var entity = new MediaItem
        {
            Type = type,
            Title = form.Title,
            Category = form.Category,
            Description = form.Description,
            Filename = unique,
            Url = $"/uploads/{unique}",
            Location = form.Location,
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            Status = MediaStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
        _db.MediaItems.Add(entity);
        await _db.SaveChangesAsync();
        return StatusCode(201, new { success = true, message = "Medya başarıyla yüklendi", data = entity });
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] MediaUpdateDto dto)
    {
        var entity = await _db.MediaItems.FindAsync(id);
        if (entity == null)
            return NotFound(new { success = false, message = "Medya öğesi bulunamadı" });
        if (dto.Title is not null) entity.Title = dto.Title;
        if (dto.Category is not null) entity.Category = dto.Category;
        if (dto.Description is not null) entity.Description = dto.Description;
        if (dto.Location is not null) entity.Location = dto.Location;
        if (dto.Status.HasValue) entity.Status = dto.Status.Value;
        await _db.SaveChangesAsync();
        return Ok(new { success = true, message = "Medya başarıyla güncellendi", data = entity });
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete([FromRoute] int id)
    {
        var entity = await _db.MediaItems.FindAsync(id);
        if (entity == null)
            return NotFound(new { success = false, message = "Medya öğesi bulunamadı" });

        // delete file
        var path = Path.Combine(_env.ContentRootPath, "uploads", entity.Filename);
        if (System.IO.File.Exists(path)) System.IO.File.Delete(path);

        _db.MediaItems.Remove(entity);
        await _db.SaveChangesAsync();
        return Ok(new { success = true, message = "Medya başarıyla silindi" });
    }

    [HttpGet("stats/overview")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Stats()
    {
        var list = await _db.MediaItems.ToListAsync();
        var stats = new
        {
            total = list.Count,
            active = list.Count(x => x.Status == MediaStatus.Active),
            images = list.Count(x => x.Type == MediaType.Image),
            videos = list.Count(x => x.Type == MediaType.Video),
            categories = new
            {
                ev = list.Count(x => x.Category == "ev"),
                isyeri = list.Count(x => x.Category == "isyeri"),
                cevre = list.Count(x => x.Category == "cevre")
            }
        };
        return Ok(new { success = true, data = stats });
    }
}
