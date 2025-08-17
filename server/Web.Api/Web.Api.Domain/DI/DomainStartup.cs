using AuthProvider;
using AuthProvider.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
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
