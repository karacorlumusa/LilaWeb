namespace LilaIlaclama.Api.Models;

public class SiteSettings
{
    public int Id { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string WorkingHours { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? SocialFacebook { get; set; }
    public string? SocialInstagram { get; set; }
    public string? SocialTwitter { get; set; }
    public string? SocialLinkedin { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
