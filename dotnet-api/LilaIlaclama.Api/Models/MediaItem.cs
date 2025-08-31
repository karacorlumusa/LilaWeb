namespace LilaIlaclama.Api.Models;

public enum MediaType { Image, Video }
public enum MediaStatus { Active, Inactive }

public class MediaItem
{
    public int Id { get; set; }
    public MediaType Type { get; set; }
    public string Title { get; set; } = default!;
    public string Category { get; set; } = default!;
    public string? Description { get; set; }
    public string Filename { get; set; } = default!;
    public string Url { get; set; } = default!;
    public string? Location { get; set; }
    public DateOnly Date { get; set; }
    public MediaStatus Status { get; set; } = MediaStatus.Active;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
