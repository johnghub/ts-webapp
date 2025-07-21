
using ApiMetaData.Infrastructure;
using Codegen.Common.Infrastructure;

namespace ApiMetaData.Models
{
    public class APIMetaData
    {
        /// <summary>
        /// Authentication scheme required by the API method (e.g., OAuth, Cookie, ClientCertificate).
        /// </summary>
        public AuthScheme? AuthScheme { get; set; }

        /// <summary>
        /// Optional natural-language description of the method's purpose, used for AI-based generation.
        /// </summary>
        public string? AIHint { get; set; }


        /// <summary>
        /// Name of the controller that the API method belongs to.
        /// </summary>
        public string? ControllerName { get; set; }
        
        /// <summary>
        /// URL path for the controller (e.g., "api/[controller]").
        /// </summary>
        public string? ControllerRoutePath { get; set; }

        /// <summary>
        /// HTTP verb of the API method.
        /// </summary>
        //public string? HttpVerb { get; set; }
        public HttpVerb? HttpVerb { get; set; }

        /// <summary>
        /// Intent of the client calling the API (e.g., UI, Machine).
        /// </summary>
        public ClientIntent? Intent { get; set; }

        /// <summary>
        /// Indicates if the return type is a primitive type (e.g., int, bool).
        /// </summary>
        public bool IsPrimitiveType { get; set; }

        /// <summary>
        /// Name of the method being analyzed.
        /// </summary>
        public string? MethodName { get; set; }

        /// <summary>
        /// List of parameters for the API method.
        /// </summary>
        public List<ParameterMetaData> Parameters { get; set; } = [];

        /// <summary>
        /// The primitive type if the return type is primitive.
        /// </summary>
        public string? PrimitiveType { get; set; }

        /// <summary>
        /// Optional proxy type (e.g., TypeScript, Python) for code generation.
        /// </summary>
        public ProxyType? ProxyType { get; set; }

        /// <summary>
        /// The return type of the response (e.g., WeatherForecast).
        /// </summary>
        public string? ResultTypeName { get; set; }

        /// <summary>
        /// List of properties of the return type, if applicable.
        /// </summary>
        public List<PropertyMetaData> ResultTypeProperties { get; set; } = [];

        /// <summary>
        /// URL path for the API method.
        /// </summary>
        public string? RoutePath { get; set; }

        /// <summary>
        /// Chain of generic types that wrap the return type (e.g., ServiceResult -> IEnumerable).
        /// </summary>
        public List<string> TypeChain { get; set; } = [];
    }

    public class PropertyMetaData
    {
        /// <summary>
        /// Name of the property.
        /// </summary>
        public string? PropertyName { get; set; }

        /// <summary>
        /// Type of the property.
        /// </summary>
        public string? PropertyType { get; set; }
    }

    public class ResultMetaData
    {
        /// <summary>
        /// Indicates if the return type is a primitive type (e.g., int, bool).
        /// </summary>
        public bool IsPrimitiveType { get; set; }

        /// <summary>
        /// The primitive type if the result type is primitive.
        /// </summary>
        public string? PrimitiveType { get; set; }

        /// <summary>
        /// The name of the result type.
        /// </summary>
        public string? ResultTypeName { get; set; }

        /// <summary>
        /// List of properties of the result type, if applicable.
        /// </summary>
        public List<PropertyMetaData> ResultTypeProperties { get; set; } = new();

        /// <summary>
        /// Chain of generic types that wrap the return type (e.g., ServiceResult -> IEnumerable).
        /// </summary>
        public List<string> TypeChain { get; set; } =[];
    }

    public class ParameterMetaData
    {
        /// <summary>
        /// Name of the parameter.
        /// </summary>
        public string? ParameterName { get; set; }

        /// <summary>
        /// Type of the parameter.
        /// </summary>
        public string? ParameterType { get; set; }

        /// <summary>
        /// List of properties of the parameter type, if applicable.
        /// </summary>
        public List<PropertyMetaData> ParameterProperties { get; set; } = [];
    }

    // Example usage of APIMetaData to generate TS code (pseudo-code)
    /*
       foreach (var api in apiMetaDataCollection)
       {
           if (api.HttpVerb == "GET")
           {
               Console.WriteLine($"export async function {api.MethodName}(): Promise<{api.InnermostTypeName}[]> {{");
               Console.WriteLine($"    const response = await fetch('/api/{api.RoutePath}', {{ method: '{api.HttpVerb}' }});");
               Console.WriteLine($"    return response.json();");
               Console.WriteLine($"}}");
           }
       }
    */
}
