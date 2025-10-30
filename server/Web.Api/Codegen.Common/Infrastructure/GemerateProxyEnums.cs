
namespace Codegen.Common.Infrastructure
{
    //public enum AuthScheme
    //{
    //    OAuth,
    //    Cookie,
    //    ClientCertificate,
    //    Anonymous
    //}

    public enum ClientIntent
    {
        UI,
        Machine
    }

    public enum HttpVerb
    {
        GET,
        POST,
        PUT,
        DELETE
    }

    public enum ProxyType
    {
        TypeScript,
        Python,
        Kotlin,
        Swift
    }
}
