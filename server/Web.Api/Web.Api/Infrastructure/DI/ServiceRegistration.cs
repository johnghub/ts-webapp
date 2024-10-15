using System.Reflection;
using Web.Api.Domain.Infrastructure;

namespace Web.Api.Infrastructure.DI
{
    public static class ServiceRegistration
    {
        public static void RegisterDomainServices(this IServiceCollection services, string assemblyName)
        {
            // Load the assembly by name
            var assembly = Assembly.Load(assemblyName);

            // Iterate over all types in the assembly
            var serviceTypes = assembly.GetTypes()
                .Where(type => type.IsClass 
                           && !type.IsAbstract
                           && type.GetCustomAttribute<RegisterAsServiceAttribute>() != null);

            foreach (var serviceType in serviceTypes)
            {
                var attribute = serviceType.GetCustomAttribute<RegisterAsServiceAttribute>();
                if (attribute != null)
                {
                    switch (attribute.Lifetime)
                    {
                        case ServiceLifetime.Transient:
                            services.AddTransient(attribute.InterfaceType, serviceType);
                            break;
                        case ServiceLifetime.Scoped:
                            services.AddScoped(attribute.InterfaceType, serviceType);
                            break;
                        case ServiceLifetime.Singleton:
                            services.AddSingleton(attribute.InterfaceType, serviceType);
                            break;
                    }
                }

            }
        }
    }
}
