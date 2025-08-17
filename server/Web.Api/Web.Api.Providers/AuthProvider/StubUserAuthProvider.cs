using AuthProvider.Interfaces;
using AuthProvider.Models;
using Microsoft.Extensions.DependencyInjection;
using Web.Api.Common.DI;

namespace AuthProvider
{
    //[RegisterAsService(typeof(IAuthProvider), ServiceLifetime.Transient)]
    public class StubUserAuthProvider : IAuthProvider
    {
        public Type SupportedCredentialsType => typeof(UserCredentials);

        public bool CanHandle(IAuthCredentials credentials) =>
            credentials is UserCredentials;

        public Task<bool> TryAuthenticateAsync(IAuthCredentials credentials)
        {
            // Stub always succeeds
            return Task.FromResult(true);
        }
    }
}
