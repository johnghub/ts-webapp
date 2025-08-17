using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace Web.Api.Common.DI
{
    public interface IAssemblyDIStartup
    {
        void RegisterServices(IServiceCollection services);
        Assembly Assembly { get; }
    }
}
