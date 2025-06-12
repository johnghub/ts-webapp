using AuthProvider.Interfaces;
using AuthProvider.Models;

namespace AuthProvider
{
    public class StubUserAuthProvider : IAuthProvider
    {
        public bool CanHandle(IAuthCredentials credentials) =>
            credentials is UserCredentials;

        public Task<bool> TryAuthenticateAsync(IAuthCredentials credentials)
        {
            // Stub always succeeds
            return Task.FromResult(true);
        }
    }
}
