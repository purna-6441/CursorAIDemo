using POSRetailAPI.Models;

namespace POSRetailAPI.Services
{
    public interface IJwtService
    {
        string GenerateToken(User user);
        string GenerateRefreshToken();
        bool ValidateToken(string token);
        int? GetUserIdFromToken(string token);
        string? GetRoleFromToken(string token);
    }
}