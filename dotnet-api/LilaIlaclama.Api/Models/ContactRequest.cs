namespace LilaIlaclama.Api.Models;

public enum ContactStatus { New, Contacted, Completed }

public class ContactRequest
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string Phone { get; set; } = default!;
    public string Service { get; set; } = "genel";
    public string Message { get; set; } = default!;
    public ContactStatus Status { get; set; } = ContactStatus.New;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
