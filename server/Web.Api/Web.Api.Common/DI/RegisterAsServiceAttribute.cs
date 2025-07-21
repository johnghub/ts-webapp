using Microsoft.Extensions.DependencyInjection;

namespace Web.Api.Common.DI
{

    [AttributeUsage(AttributeTargets.Class, Inherited = false)]
    public class RegisterAsServiceAttribute(Type interfaceType, ServiceLifetime lifetime = ServiceLifetime.Transient) : Attribute
    {
        public Type InterfaceType { get; } = interfaceType;
        public ServiceLifetime Lifetime { get; } = lifetime;
    }
}
