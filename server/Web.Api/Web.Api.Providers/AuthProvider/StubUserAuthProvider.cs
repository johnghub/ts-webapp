using AuthProvider.Interfaces;
using AuthProvider.Models;
using Web.Api.Generated.Providers;

namespace AuthProvider
{
    //[RegisterAsService(typeof(IAuthProvider), ServiceLifetime.Transient)]
    public class StubUserUsernamePwAuthProvider : IAuthProvider
    {
        public Type SupportedCredentialsType => typeof(UserCredentials);

        public bool CanHandle(IAuthCredentials credentials) =>
            credentials is UserCredentials;

        public async Task<bool> TryAuthenticateAsync(IAuthCredentials credentials)
        {
            // Stub always succeeds
            //            return await Task.FromResult(true);
            var provider = new GeneratedCookieProvider();

            var credentialType = provider.SupportedCredentialsType;

            if (!CanHandle(credentials))
                throw new InvalidOperationException($"Invalid credential type: expected {credentialType.Name}");

            return await provider.TryAuthenticateAsync(credentials);
        }
    }

}
