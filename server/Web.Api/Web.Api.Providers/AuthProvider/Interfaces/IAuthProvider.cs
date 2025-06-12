using AuthProvider.Models;

namespace AuthProvider.Interfaces
{
    public interface IAuthProvider
    {
        bool CanHandle(IAuthCredentials credentials);
        Task<bool> TryAuthenticateAsync(IAuthCredentials credentials);
    }
}
