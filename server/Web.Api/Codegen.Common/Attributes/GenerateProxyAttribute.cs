using Codegen.Common.Infrastructure;

namespace Codegen.Common.Attributes
{
    [AttributeUsage(AttributeTargets.Method, Inherited = false)]
    public class GenerateProxyAttribute() : Attribute
    {
        public AuthScheme AuthScheme { get; init; }
        public ClientIntent Intent { get; init; } 
        public ProxyType ProxyType { get; init; }
        public string? AIHint { get; init; }
    }
}
