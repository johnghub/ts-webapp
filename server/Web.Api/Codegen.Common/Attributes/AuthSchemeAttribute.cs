// Claude generated
// Sonnet 4.5
namespace Codegen.Common.Attributes
{
    [AttributeUsage(AttributeTargets.Class, AllowMultiple = false)]
    public sealed class AuthSchemeAttribute(AuthScheme scheme) : Attribute
    {
        public AuthScheme Scheme { get; } = scheme;
    }

    public enum AuthScheme
    {
        OAuth,
        Cookie,
        ClientCertificate,
        Anonymous
    }
}
