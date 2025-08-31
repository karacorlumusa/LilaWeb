using LilaIlaclama.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LilaIlaclama.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<ContactRequest> ContactRequests => Set<ContactRequest>();
    public DbSet<MediaItem> MediaItems => Set<MediaItem>();
    public DbSet<SiteSettings> SiteSettings => Set<SiteSettings>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>().HasIndex(u => u.Username).IsUnique();
        modelBuilder.Entity<MediaItem>().Property(m => m.Type).HasConversion<string>();
        modelBuilder.Entity<MediaItem>().Property(m => m.Status).HasConversion<string>();
        modelBuilder.Entity<ContactRequest>().Property(c => c.Status).HasConversion<string>();
    }
}
