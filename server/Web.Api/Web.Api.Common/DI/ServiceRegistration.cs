using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace Web.Api.Common.DI
{
    public static class ServiceRegistration
    {

        public static IServiceCollection RegisterDomainServices(this IServiceCollection services)
        {

            var startupTypes = AppDomain.CurrentDomain.GetAssemblies()
                .SelectMany(assembly =>
                {
                    try
                    {
                        return assembly.GetTypes();
                    }
                    catch (ReflectionTypeLoadException ex)
                    {
                        //return ex.Types.Where(t => t != null)!;

                        // TODO: Determine what this is really doing
                        // ex.Types is Type?[], so filter nulls safely:
                        return ex.Types.OfType<Type>();
                    }
                })
                .Where(t =>
                    t != null &&
                    t.IsClass &&
                    !t.IsAbstract &&
                    typeof(IAssemblyDIStartup).IsAssignableFrom(t) &&
                    t.GetCustomAttribute<RegisterDIAssemblyAttribute>() is not null);

            foreach (var type in startupTypes)
            {
                var startup = (IAssemblyDIStartup)Activator.CreateInstance(type)!;
                startup.RegisterServices(services);
            }

            return services;
        }

#if (false)
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
#endif
    }
}
