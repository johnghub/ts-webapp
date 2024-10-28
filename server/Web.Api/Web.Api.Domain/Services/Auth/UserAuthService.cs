using Web.Api.Domain.Models;

namespace Web.Api.Domain.Services.Auth
{
    public class UserAuthService : IUserAuthService
    {
        public async Task<ServiceResult<bool>> AuthenticateAsync(UserCredentials userCredentials)
        {
            var result = await Task.FromResult(true);   

            return ServiceResult<bool>.SuccessResult(result);
        }
    }

    public interface IUserAuthService
    {
        Task<ServiceResult<bool>> AuthenticateAsync(UserCredentials userCredentials);
    }
}
