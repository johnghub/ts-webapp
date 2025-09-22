using Microsoft.Extensions.DependencyInjection;
using System.Reflection;
using Web.Api.Common.DI;

namespace Web.Api.Domain.DI
{
    [RegisterDIAssembly]
    public class DomainStartup : IAssemblyDIStartup
    {
        public Assembly Assembly => typeof(DomainStartup).Assembly;

        public void RegisterServices(IServiceCollection services)
        {
            // Automatically register all [RegisterAsService] types in this assembly
            services.RegisterAttributedServices(Assembly);
        }
    }
}
