using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace Web.Api.Common.DI
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection RegisterAttributedServices(this IServiceCollection services, Assembly assembly)
        {
            var typesWithAttribute = assembly.GetTypes()
                .Where(t => t.IsClass && !t.IsAbstract)
                .Select(t => new
                {
                    Type = t,
                    Attribute = t.GetCustomAttribute<RegisterAsServiceAttribute>()
                })
                .Where(x => x.Attribute != null);

            foreach (var entry in typesWithAttribute)
            {
                services.Add(new ServiceDescriptor(
                    entry.Attribute.InterfaceType,
                    entry.Type,
                    entry.Attribute.Lifetime));
            }

            return services;
        }
    }
}
