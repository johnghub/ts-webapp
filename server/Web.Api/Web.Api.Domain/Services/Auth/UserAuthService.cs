using AuthProvider.Interfaces;
using AuthProvider.Models;
using Microsoft.Extensions.DependencyInjection;
using Web.Api.Domain.Infrastructure;
using Web.Api.Domain.Models;

namespace Web.Api.Domain.Services.Auth
{
    [RegisterAsService(typeof(IUserAuthService), ServiceLifetime.Transient)]
    public class UserAuthService(IEnumerable<IAuthProvider> authProviders) : IUserAuthService
    {
        public async Task<ServiceResult<bool>> AuthenticateAsync(IAuthCredentials credentials)
        {
            var provider = authProviders.FirstOrDefault(p => p.CanHandle(credentials));

            if (provider == null)
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
