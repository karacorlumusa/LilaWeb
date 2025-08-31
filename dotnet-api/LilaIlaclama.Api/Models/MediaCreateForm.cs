using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace LilaIlaclama.Api.Models;

public class MediaCreateForm
{
    public string Title { get; set; } = default!;
    public string Category { get; set; } = default!;
    public string? Description { get; set; }
    public string? Location { get; set; }
    [BindRequired]
    public IFormFile File { get; set; } = default!;
}
