namespace LilaIlaclama.Api.Models;

public record LoginRequest(string Username, string Password);
public record LoginResponse(bool Success, string Message, string Token, object User);
public record VerifyResponse(bool Success, object User);

public record ContactCreateDto(string Name, string Email, string Phone, string? Service, string Message);
public record ContactUpdateDto(ContactStatus? Status, string? Notes);

public record MediaCreateDto(string Title, string Category, string? Description, string? Location);
public record MediaUpdateDto(string? Title, string? Category, string? Description, string? Location, MediaStatus? Status);

public record SettingsUpdateDto(
    string? CompanyName,
    string? Phone,
    string? Email,
    string? Address,
    string? WorkingHours,
    string? Description,
    SocialDto? SocialMedia);

public record SocialDto(string? Facebook, string? Instagram, string? Twitter, string? Linkedin);

public record ChangePasswordDto(string CurrentPassword, string NewPassword);
