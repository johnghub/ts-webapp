using AuthProvider.Models;

namespace AuthProvider.Interfaces
{
    public interface IAuthProvider
    {
        /// <summary>
        /// The type of credentials this provider supports.
        /// </summary>
        Type SupportedCredentialsType { get; }

        bool CanHandle(IAuthCredentials credentials);
        Task<bool> TryAuthenticateAsync(IAuthCredentials credentials);
    }
}
