using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace Web.Api.Common.DI
{
    public static class ServiceRegistration
    {

        public static IServiceCollection RegisterDomainServices(this IServiceCollection services)
        {
            //var foo = AppDomain.CurrentDomain
            //    .GetAssemblies()
            //    .SelectMany(assembly =>
            //    {
            //        try
            //        {
            //            return assembly.GetTypes();
            //        }
            //        catch (ReflectionTypeLoadException ex)
            //        {
            //            return ex.Types.Where(t => t != null)!;
            //        }
            //    })
            //    .Where(t =>
            //        t.IsClass &&
            //        !t.IsAbstract  &&
            //        typeof(IAssemblyDIStartup).IsAssignableFrom(t)
            //     );


            //var candidates = AppDomain.CurrentDomain.GetAssemblies()
            //    .SelectMany(a =>
            //    {
            //        try { return a.GetTypes(); }
            //        catch (ReflectionTypeLoadException ex) { return ex.Types.Where(t => t != null)!; }
            //    })
            //    .Where(t => typeof(IAssemblyDIStartup).IsAssignableFrom(t))
            //    .ToList();

            //foreach (var type in candidates)
            //{
            //    Console.WriteLine($"Candidate: {type.FullName}");
            //    var attr = type.GetCustomAttribute<RegisterDIAssemblyAttribute>();
            //    if (attr != null)
            //        Console.WriteLine($" --> Has RegisterDIAssemblyAttribute");
            //}

            //Console.WriteLine("\n\r ---- Run checks \" ---- \n\r");

            //foreach (var type in AppDomain.CurrentDomain.GetAssemblies()
            //    .SelectMany(a => a.GetTypes())
            //    .Where(t => t.Name.Contains("Startup")))
            //{

            //    var hasAttr = type.GetCustomAttribute<RegisterDIAssemblyAttribute>() != null;
            //    if (hasAttr)
            //    {
            //        Console.WriteLine($"  Has [RegisterDIAssemblyAttribute]");
            //        Console.WriteLine($"TYPE: {type.FullName}");

            //        var interfaces = type.GetInterfaces();
            //        foreach (var iface in interfaces)
            //        {
            //            Console.WriteLine($"  Implements: {iface.FullName}");
            //        }
            //    }

            //    var matchesInterface = typeof(IAssemblyDIStartup).IsAssignableFrom(type);
            //    if (matchesInterface)
            //    {
            //        Console.WriteLine($"  Matches IAssemblyDIStartup");
            //        Console.WriteLine($"TYPE: {type.FullName}");

            //        var interfaces = type.GetInterfaces();
            //        foreach (var iface in interfaces)
            //        {
            //            Console.WriteLine($"  Implements: {iface.FullName}");
            //        }

            //    }
            //}

            var startupTypes = AppDomain.CurrentDomain
                .GetAssemblies()
                .SelectMany(assembly =>
                {
                    try
                    {
                        return assembly.GetTypes();
                    }
                    catch (ReflectionTypeLoadException ex)
                    {
                        return ex.Types.Where(t => t != null)!;
                    }
                })
                .Where(t =>
                    t != null &&
                    t.IsClass &&
                    !t.IsAbstract &&
                    typeof(IAssemblyDIStartup).IsAssignableFrom(t) &&
                    t.GetCustomAttribute<RegisterDIAssemblyAttribute>() != null);

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
