using System.Reflection;

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
                .Where(type => type.IsClass && !type.IsAbstract );

            foreach (var serviceType in serviceTypes)
            {
                // Look for a corresponding interface with the same name pattern "I<PurposeName>Service"
                var serviceInterface = serviceType.GetInterfaces()
                    .FirstOrDefault(i => i.Name == "I" + serviceType.Name);

                if (serviceInterface != null && serviceInterface.Name.EndsWith("Service"))
                {
                    // Register as transient in the DI container
                    services.AddTransient(serviceInterface, serviceType);
                }
            }
        }
    }
}
