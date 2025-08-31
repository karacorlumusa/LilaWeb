using LilaIlaclama.Api.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace LilaIlaclama.Api.Data;

public static class SeedData
{
    public static async Task EnsureSeedAsync(AppDbContext db)
    {
        if (!await db.Users.AnyAsync())
        {
            var username = Environment.GetEnvironmentVariable("ADMIN_USERNAME") ?? "admin";
            var password = Environment.GetEnvironmentVariable("ADMIN_PASSWORD") ?? "123456";
            var salt = Guid.NewGuid().ToString("N");
            var hash = HashPassword(password, salt);
            db.Users.Add(new User { Username = username, PasswordHash = hash, PasswordSalt = salt, Role = "admin" });
        }

        if (!await db.SiteSettings.AnyAsync())
        {
            db.SiteSettings.Add(new SiteSettings
            {
                CompanyName = "Lila İlaçlama",
                Phone = "+90 (212) 555 0123",
                Email = "info@lilailacla.com",
                Address = "Atatürk Mahallesi, İlaçlama Sokak No:15, Kadıköy / İstanbul",
                WorkingHours = "Pazartesi - Cumartesi: 08:00 - 18:00\nPazar: Acil durumlar için 24/7",
                Description = "Profesyonel ilaçlama hizmetleri ile sağlıklı yaşam alanları",
                SocialFacebook = string.Empty,
                SocialInstagram = string.Empty,
                SocialTwitter = string.Empty,
                SocialLinkedin = string.Empty,
                UpdatedAt = DateTime.UtcNow
            });
        }

        if (!await db.ContactRequests.AnyAsync())
        {
            db.ContactRequests.AddRange(
                new ContactRequest
                {
                    Name = "Ahmet Yılmaz",
                    Email = "ahmet@email.com",
                    Phone = "+90 532 123 4567",
                    Service = "ev",
                    Message = "Evimde karınca problemi var, yardımcı olabilir misiniz?",
                    Status = ContactStatus.New,
                    CreatedAt = new DateTime(2024, 1, 20),
                    UpdatedAt = new DateTime(2024, 1, 20)
                },
                new ContactRequest
                {
                    Name = "Fatma Demir",
                    Email = "fatma@email.com",
                    Phone = "+90 533 987 6543",
                    Service = "isyeri",
                    Message = "Restoranımız için düzenli ilaçlama hizmeti istiyoruz.",
                    Status = ContactStatus.Contacted,
                    CreatedAt = new DateTime(2024, 1, 22),
                    UpdatedAt = new DateTime(2024, 1, 23)
                }
            );
        }

        if (!await db.MediaItems.AnyAsync())
        {
            db.MediaItems.AddRange(
                new MediaItem
                {
                    Type = MediaType.Image,
                    Title = "Ev İlaçlama Öncesi",
                    Category = "ev",
                    Description = "Ev ilaçlama işlemi öncesi durum tespiti",
                    Filename = "sample1.jpg",
                    Url = "/uploads/sample1.jpg",
                    Location = "İstanbul, Kadıköy",
                    Date = new DateOnly(2024, 1, 15),
                    Status = MediaStatus.Active,
                    CreatedAt = new DateTime(2024, 1, 15)
                },
                new MediaItem
                {
                    Type = MediaType.Video,
                    Title = "Profesyonel İlaçlama Süreci",
                    Category = "isyeri",
                    Description = "Ofis binası ilaçlama sürecinin videolu anlatımı",
                    Filename = "sample2.mp4",
                    Url = "/uploads/sample2.mp4",
                    Location = "İstanbul, Şişli",
                    Date = new DateOnly(2024, 1, 20),
                    Status = MediaStatus.Active,
                    CreatedAt = new DateTime(2024, 1, 20)
                },
                new MediaItem
                {
                    Type = MediaType.Image,
                    Title = "İlaçlama Sonrası Kontrol",
                    Category = "ev",
                    Description = "İlaçlama sonrası etkinlik kontrolü",
                    Filename = "sample3.jpg",
                    Url = "/uploads/sample3.jpg",
                    Location = "İstanbul, Beşiktaş",
                    Date = new DateOnly(2024, 1, 25),
                    Status = MediaStatus.Active,
                    CreatedAt = new DateTime(2024, 1, 25)
                }
            );
        }

        await db.SaveChangesAsync();
    }

    public static string HashPassword(string password, string salt)
    {
        using var sha = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(password + salt);
        return Convert.ToBase64String(sha.ComputeHash(bytes));
    }
}
