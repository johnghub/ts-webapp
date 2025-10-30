using AuthProvider.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;
using Web.Api.Common.DI;

namespace AuthProvider.DI
{
    [RegisterDIAssembly]
    public class AuthProviderStartup : IAssemblyDIStartup
    {
        public Assembly Assembly => typeof(AuthProviderStartup).Assembly;

        public void RegisterServices(IServiceCollection services)
        {
            // Explicit edge-case DI registrations
            services.AddTransient<IAuthProvider, StubUserUsernamePwAuthProvider>();
        }
    }
}
