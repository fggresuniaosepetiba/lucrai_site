using Microsoft.AspNetCore.Identity;
using Lucrai.Core.Enums;

namespace Lucrai.Core.Entities;

public class User : IdentityUser
{
    public string Name { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Viewer;
    public string Company { get; set; } = string.Empty;
    public string? Avatar { get; set; }
    public bool Active { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
