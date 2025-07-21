using AuthProvider.Interfaces;
using AuthProvider.Models;
using Microsoft.Extensions.DependencyInjection;
using Web.Api.Common.DI;
using Web.Api.Domain.Models;

namespace Web.Api.Domain.Services.Auth
{
    [RegisterAsService(typeof(IUserAuthService), ServiceLifetime.Transient)]
    public class UserAuthService : IUserAuthService
    {
        private readonly Dictionary<Type, IAuthProvider> _providerMap;

        public UserAuthService(IEnumerable<IAuthProvider> authProviders)
        {
            // Ensure only one provider per credentials type
            _providerMap = new Dictionary<Type, IAuthProvider>();
            foreach (var provider in authProviders)
            {
                var type = provider.SupportedCredentialsType;
                if (_providerMap.ContainsKey(type))
                {
                    throw new InvalidOperationException(
                        $"Multiple authentication providers registered for credentials type '{type.FullName}'. Only one provider per type is allowed.");
                }
                _providerMap[type] = provider;
            }
        }
        public async Task<ServiceResult<bool>> AuthenticateAsync(IAuthCredentials credentials)
        {
            if (credentials == null)
                return ServiceResult<bool>.FailureResult(["Credentials must not be null."]);

            var type = credentials.GetType();
            if (!_providerMap.TryGetValue(type, out var provider))
                return ServiceResult<bool>.FailureResult(["No suitable provider found."]);

            var success = await provider.TryAuthenticateAsync(credentials);
            return success
                ? ServiceResult<bool>.SuccessResult(true)
                : ServiceResult<bool>.FailureResult(["Authentication failed."]);
        }
    }

    public interface IUserAuthService
    {
        Task<ServiceResult<bool>> AuthenticateAsync(IAuthCredentials userCredentials);
    }
}
