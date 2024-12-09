// See https://aka.ms/new-console-template for more information
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using System.Reflection;
using CommandLine;
using ApiMetaData.Models;
using ApiMetaData.Infrastructure;
using System.Text;

var executionDirectory = AppDomain.CurrentDomain.BaseDirectory;
Console.WriteLine($"Execution Directory: {executionDirectory}");

List<APIMetaData> apiMetaDataCollection = [];


Parser.Default.ParseArguments<Options>(args)
    .WithParsed<Options>(opts =>
    {
        var directoryPath = Path.IsPathRooted(opts.DirectoryPath) ? opts.DirectoryPath : Path.Combine(executionDirectory, opts.DirectoryPath);
        var assemblyPath = Path.IsPathRooted(opts.AssemblyPath) ? opts.AssemblyPath : Path.Combine(executionDirectory, opts.AssemblyPath);
        var parameterNamespace = opts.Namespace;
        var tsFilePath = opts.TSFilePath;
        var outputMode = opts.OutputMode;

        if (!Directory.Exists(directoryPath))
        {
            Console.WriteLine($"The directory '{directoryPath}' does not exist.");
            return;
        }

        if (!File.Exists(assemblyPath))
        {
            Console.WriteLine($"The assembly '{assemblyPath}' does not exist.");
            return;
        }

        var assembly = Assembly.LoadFrom(assemblyPath);
        var controllerFiles = Directory.GetFiles(directoryPath, "*.cs", SearchOption.AllDirectories)
                                       .Where(file => file.Contains("Controller"));

        foreach (var file in controllerFiles)
        {
            ProcessControllerFile(file, assembly, parameterNamespace);
        }

        Console.WriteLine(@"========================================
Writing meta data collection
========================================");
        WriteAPIMetaData(apiMetaDataCollection);

        Console.WriteLine(@">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
Writing TypeScript file
<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
        WriteApiTSFiles(tsFilePath, outputMode);
    });
void ProcessControllerFile(string filePath, Assembly assembly, string parameterNamespace)
{
    var code = File.ReadAllText(filePath);
    var tree = CSharpSyntaxTree.ParseText(code);
    CompilationUnitSyntax root = tree.GetCompilationUnitRoot();

    var assemblies = AppDomain.CurrentDomain.GetAssemblies()
        .Where(a => !a.IsDynamic && !string.IsNullOrEmpty(a.Location))
        .Select(a => MetadataReference.CreateFromFile(a.Location))
        .ToList();

    var compilation = CSharpCompilation.Create("Analysis")
        .AddReferences(assemblies)
        .AddSyntaxTrees(tree);

    var model = compilation.GetSemanticModel(tree);

    foreach (var classNode in root.DescendantNodes().OfType<ClassDeclarationSyntax>())
    {
        if (classNode.Identifier.Text.EndsWith("Controller"))
        {

            Console.WriteLine($"Controller: {classNode.Identifier.Text}");

            // Extract the Route attribute from the controller
            string controllerRoutePath = null;
            var controllerAttributes = classNode.AttributeLists.SelectMany(attrList => attrList.Attributes);
            foreach (var attribute in controllerAttributes)
            {
                if (attribute.Name.ToString().Equals("Route", StringComparison.OrdinalIgnoreCase) && attribute.ArgumentList != null && attribute.ArgumentList.Arguments.Count > 0)
                {
                    controllerRoutePath = attribute.ArgumentList.Arguments[0].ToString().Trim('"');
                    break;
                }
            }

            foreach (var method in classNode.Members.OfType<MethodDeclarationSyntax>())
            {

                // Only consider public methods
                if (!method.Modifiers.Any(SyntaxKind.PublicKeyword))
                {
                    continue;
                }

                // Extract HTTP Verb by looking for attributes like [HttpGet], [HttpPost], etc.
                var httpVerbAttribute = method.AttributeLists
                    .SelectMany(attrList => attrList.Attributes)
                    .FirstOrDefault(attr =>
                        attr.Name.ToString().Equals("HttpGet", StringComparison.OrdinalIgnoreCase) ||
                        attr.Name.ToString().Equals("HttpPost", StringComparison.OrdinalIgnoreCase) ||
                        attr.Name.ToString().Equals("HttpPut", StringComparison.OrdinalIgnoreCase) ||
                        attr.Name.ToString().Equals("HttpDelete", StringComparison.OrdinalIgnoreCase));

                // Only continue if an HTTP verb is found
                if (httpVerbAttribute == null)
                {
                    continue;
                }

                // Extract the HTTP verb
                var httpVerb = httpVerbAttribute.Name.ToString();
                Console.WriteLine($"  HTTP Verb: {httpVerb}");

                // Extract RoutePath if specified in the attribute
                string routePath = null;
                if (httpVerbAttribute.ArgumentList != null && httpVerbAttribute.ArgumentList.Arguments.Count > 0)
                {
                    // Get the route path from the first argument (e.g., [HttpGet("routePath")])
                    routePath = httpVerbAttribute.ArgumentList.Arguments[0].ToString().Trim('"');
                }

                Console.WriteLine($"  Route Path: {routePath ?? "Not specified"}");

                // Extract return type (initial IActionResult)
                var returnTypeInfo = model.GetTypeInfo(method.ReturnType);
                Console.WriteLine($"  Initial Return Type: {returnTypeInfo.Type}");


                // Extract the result type
                ResultMetaData resultMetaData = new();

                // Analyze method body to determine the return value from the service
                if (method.Body != null)
                {
                    var invocationExpressions = method.Body.DescendantNodes().OfType<InvocationExpressionSyntax>();

                    foreach (var invocation in invocationExpressions)
                    {
                        // Try to get the symbol information for the method call
                        var symbolInfo = model.GetSymbolInfo(invocation);
                        var methodSymbol = symbolInfo.Symbol as IMethodSymbol;

                        if (methodSymbol != null)
                        {
                            // Extract the return type of the service method
                            var returnType = methodSymbol.ReturnType;

                            // If the return type is generic, extract the type argument
                            if (returnType is INamedTypeSymbol namedTypeSymbol && namedTypeSymbol.IsGenericType)
                            {
                                // Start with ServiceResult<T> - extract the T argument
                                var currentSymbol = namedTypeSymbol;
                                var typeArgumentsStack = new Stack<string>(); // To keep track of the generic types

                                while (currentSymbol.IsGenericType)
                                {
                                    // Get the first type argument
                                    var genericArgument = currentSymbol.TypeArguments.FirstOrDefault();
                                    if (genericArgument == null)
                                    {
                                        break;
                                    }

                                    // Track the parent generic type for later code generation (e.g., IEnumerable<T>)
                                    typeArgumentsStack.Push(currentSymbol.Name);

                                    if (genericArgument is INamedTypeSymbol nestedNamedType && nestedNamedType.IsGenericType)
                                    {
                                        // If it's a nested generic, set currentSymbol to the nested generic to continue extraction
                                        currentSymbol = nestedNamedType;
                                    }
                                    else
                                    {
                                        // If we reached the innermost non-generic type, extract its name
                                        var innermostTypeName = genericArgument.ToString();

                                        resultMetaData.ResultTypeName = ConvertToTSTypeOrStripDomain(innermostTypeName ??= "");

                                        Console.WriteLine($"  Inferred Innermost Type: {innermostTypeName}");

                                        // Check if the type is a native type (e.g., int, bool, etc.)
                                        if (genericArgument.IsValueType || genericArgument.SpecialType != SpecialType.None)
                                        {
                                            Console.WriteLine($"    Native Type: {innermostTypeName}");
                                            resultMetaData.IsPrimitiveType = true;
                                            resultMetaData.PrimitiveType = innermostTypeName;
                                        }
                                        else
                                        {
                                            // Get the type information using reflection for the innermost type
                                            var type = assembly.GetType(innermostTypeName);
                                            if (type != null)
                                            {
                                                Console.WriteLine($"    Properties of {innermostTypeName}:");
                                                foreach (var property in type.GetProperties())
                                                {
                                                    Console.WriteLine($"      {property.Name} of Type: {property.PropertyType}");
                                                    resultMetaData.ResultTypeProperties.Add(new PropertyMetaData
                                                    {
                                                        PropertyName = property.Name,
                                                        PropertyType = property.PropertyType.ToString()
                                                    });
                                                }
                                            }
                                            else
                                            {
                                                Console.WriteLine($"    Could not find type {innermostTypeName} in the provided assembly.");
                                            }
                                        }

                                        break;
                                    }
                                }

                                // After determining the innermost type, print the full generic type chain for code generation purposes
                                if (typeArgumentsStack.Count > 0)
                                {
                                    var fullGenericChain = string.Join(" -> ", typeArgumentsStack.Reverse());
                                    resultMetaData.TypeChain = typeArgumentsStack.Reverse().ToList();
                                    Console.WriteLine($"  Full Generic Type Chain: {fullGenericChain}");
                                }
                            }
                            else if (returnType != null && returnType.TypeKind == TypeKind.Class)
                            {
                                // Handle non-generic return types
                                var fullTypeName = returnType.ToString();
                                Console.WriteLine($"  Inferred Return Type from Service: {fullTypeName}");

                                // Get the type information using reflection
                                var type = assembly.GetType(fullTypeName);
                                if (type != null)
                                {
                                    Console.WriteLine($"    Properties of {fullTypeName}:");
                                    foreach (var property in type.GetProperties())
                                    {
                                        Console.WriteLine($"      {property.Name} of Type: {property.PropertyType}");
                                    }
                                }
                                else
                                {
                                    Console.WriteLine($"    Could not find type {fullTypeName} in the provided assembly.");
                                }
                            }
                        }
                    }
                }

                // Extract parameters and their properties
                var parameters = new List<ParameterMetaData>();


                foreach (var parameter in method.ParameterList.Parameters)
                {
                    var parameterTypeInfo = model.GetTypeInfo(parameter.Type);
                    var parameterType = parameterTypeInfo.Type;

                    var parameterMetaData = new ParameterMetaData
                    {
                        ParameterName = parameter.Identifier.Text,
                        ParameterType = parameterType.ToString(),
                    };

                    // Extract properties of complex object parameters
                    if (parameterType != null && parameterType.TypeKind == TypeKind.Class && parameterType.ContainingNamespace?.ToString() == parameterNamespace)
                    {
                        var type = assembly.GetType(parameterType.ToString());
                        if (type != null)
                        {
                            foreach (var property in type.GetProperties())
                            {
                                Console.WriteLine($"    Properties of {parameter.Identifier.Text} ({parameterType}):");

                                parameterMetaData.ParameterProperties.Add(new PropertyMetaData
                                {
                                    PropertyName = property.Name,
                                    PropertyType = property.PropertyType.ToString()
                                });
                            }
                        }
                    }

                    parameters.Add(parameterMetaData);
                }

                // Create APIMetaData object to store the extracted metadata
                var apiMetaData = new APIMetaData
                {
                    ControllerName = classNode.Identifier.Text,
                    MethodName = method.Identifier.Text,
                    HttpVerb = httpVerb,
                    RoutePath = routePath ?? string.Empty,
                    ControllerRoutePath = controllerRoutePath ?? "api/[controller]",

                    Parameters = parameters,
                    ResultTypeName = resultMetaData.ResultTypeName,
                    IsPrimitiveType = resultMetaData.IsPrimitiveType,
                    PrimitiveType = resultMetaData.PrimitiveType,
                    ResultTypeProperties = resultMetaData.ResultTypeProperties,
                    TypeChain = resultMetaData.TypeChain,
                };

                apiMetaDataCollection.Add(apiMetaData);
            }
        }
    }
}

void WriteAPIMetaData(List<APIMetaData> apiMetaDataCollection)
{
    foreach (var api in apiMetaDataCollection)
    {
        Console.WriteLine($"Controller: {api.ControllerName}");
        Console.WriteLine($"  Method: {api.MethodName}");
        Console.WriteLine($"  HTTP Verb: {api.HttpVerb}");
        Console.WriteLine($"  Route Path: {api.RoutePath}");
        Console.WriteLine($"  Controller Route Path: {api.ControllerRoutePath}");
        Console.WriteLine($"  Result Type Name: {api.ResultTypeName}");
        if (api.IsPrimitiveType)
        {
            Console.WriteLine($"  Primitive Type: {api.PrimitiveType}");
        }
        else
        {
            Console.WriteLine("  Result Type Properties:");
            foreach (var property in api.ResultTypeProperties)
            {
                Console.WriteLine($"    {property.PropertyName} of Type: {property.PropertyType}");
            }
        }

        Console.WriteLine("  Type Chain:");
        foreach (var type in api.TypeChain)
        {
            Console.WriteLine($"    {type}");
        }

        Console.WriteLine("  Parameters:");
        foreach (var parameter in api.Parameters)
        {
            Console.WriteLine($"    Parameter Name: {parameter.ParameterName}");
            Console.WriteLine($"    Parameter Type: {parameter.ParameterType}");
            if (parameter.ParameterProperties.Count > 0)
            {
                Console.WriteLine("    Parameter Properties:");
                foreach (var property in parameter.ParameterProperties)
                {
                    Console.WriteLine($"      {property.PropertyName} of Type: {property.PropertyType}");
                }
            }
        }
    }
}

#if false
void WriteApiTSFiles(string path, OutputMode outputMode)
{
    var output = new StringBuilder();
    var generatedTypes = new HashSet<string>(); // Track generated TypeScript types

    output.AppendLine("import { appConfig } from '../src/appconfig';");

    foreach (var api in apiMetaDataCollection)
    {
        // Generate TypeScript interface for result type
        string strippedResultTypeName = ConvertToTSTypeOrStripDomain(api.ResultTypeName);
        if (!api.IsPrimitiveType && strippedResultTypeName != "void")
        {
            if (!generatedTypes.Contains(strippedResultTypeName))
            {
                output.AppendLine($"export interface {strippedResultTypeName} {{");
                foreach (var property in api.ResultTypeProperties)
                {
                    output.AppendLine($"    {property.PropertyName}: {ConvertToTSType(property.PropertyType)};");
                }
                output.AppendLine($"}}");
                generatedTypes.Add(strippedResultTypeName);
            }
        }

        // Generate TypeScript interface for parameters if they are complex types
        foreach (var parameter in api.Parameters)
        {
            string strippedParameterTypeName = ConvertToTSTypeOrStripDomain(parameter.ParameterType)+"ParamType";
            if (!IsPrimitive(parameter.ParameterType) && !generatedTypes.Contains(strippedParameterTypeName))
            {
                output.AppendLine($"export interface {strippedParameterTypeName} {{");
                foreach (var property in parameter.ParameterProperties)
                {
                    output.AppendLine($"    {property.PropertyName}: {ConvertToTSType(property.PropertyType)};");
                }
                output.AppendLine($"}}");
                generatedTypes.Add(strippedParameterTypeName);
            }
        }

        var controllerName = ExtractControllerName(api.ControllerName);

        // Generate TypeScript function for the API method
        if (string.Equals(api.HttpVerb, "HttpGet", StringComparison.OrdinalIgnoreCase))
        {
            string queryParams = string.Join("&", api.Parameters.Select(p => $"{p.ParameterName}=${{{p.ParameterName}}}"));
            string paramList = string.Join(", ", api.Parameters.Select(p => $"{p.ParameterName}: {ConvertToTSType(p.ParameterType)}"));

            output.AppendLine($"export async function {api.MethodName}({paramList}): Promise<{strippedResultTypeName}[]> {{");
            output.AppendLine($"    const response = await fetch(`${{appConfig.domain}}/api/{controllerName}/{api.RoutePath}?{queryParams}`, {{ method: 'get' }});");
            output.AppendLine($"    return response.json();");
            output.AppendLine($"}}");
        }
        else if (string.Equals(api.HttpVerb, "HttpPost", StringComparison.OrdinalIgnoreCase))
        {
            string paramList = string.Join(", ", api.Parameters.Select(p => $"{p.ParameterName}: {ConvertToTSType(p.ParameterType)}"));
            string bodyParams = string.Join(", ", api.Parameters.Select(p => $"{p.ParameterName}: {p.ParameterName}"));

            // Generate TypeScript type for parameters if multiple
            if (api.Parameters.Count > 1)
            {
                string paramsTypeName = $"{api.MethodName}Params";
                if (!generatedTypes.Contains(paramsTypeName))
                {
                    output.AppendLine($"export interface {paramsTypeName} {{");
                    foreach (var parameter in api.Parameters)
                    {
                        output.AppendLine($"    {parameter.ParameterName}: {ConvertToTSType(parameter.ParameterType)};");
                    }
                    output.AppendLine($"}}");
                    generatedTypes.Add(paramsTypeName);
                }
                output.AppendLine($"export async function {api.MethodName}(params: {paramsTypeName}): Promise<{strippedResultTypeName}> {{");
                output.AppendLine($"    const response = await fetch(`${{appConfig.domain}}/api/{controllerName}/{api.RoutePath}`, {{");
                output.AppendLine($"        method: 'post',");
                output.AppendLine($"        headers: {{ 'Content-Type': 'application/json' }},");
                output.AppendLine($"        body: JSON.stringify(params)");
                output.AppendLine($"    }});");
                output.AppendLine($"    return response.json();");
                output.AppendLine($"}}");
            }
            else
            {
                output.AppendLine($"export async function {api.MethodName}({paramList}): Promise<{strippedResultTypeName}> {{");
                output.AppendLine($"    const response = await fetch(`${{appConfig.domain}}/api/{controllerName}/{api.RoutePath}`, {{");
                output.AppendLine($"        method: 'post',");
                output.AppendLine($"        headers: {{ 'Content-Type': 'application/json' }},");
                output.AppendLine($"        body: JSON.stringify({{{bodyParams}}})");
                output.AppendLine($"    }});");
                output.AppendLine($"    return response.json();");
                output.AppendLine($"}}");
            }

        }
    }

    switch (outputMode)
    {
        case OutputMode.Console:
            Console.WriteLine(output.ToString());
            break;
        case OutputMode.File:
            File.WriteAllText(path, output.ToString());
            break;
        case OutputMode.Both:
            Console.WriteLine(output.ToString());
            File.WriteAllText(path, output.ToString());
            break;
    }
}



#else
void WriteApiTSFiles(string path, OutputMode outputMode)
{
    var output = new StringBuilder();
    var generatedTypes = new HashSet<string>(); // Track generated TypeScript types

    output.AppendLine("import { appConfig } from '../appconfig';");
    output.AppendLine("export interface ApiResponse<T> {");
    output.AppendLine("    data?: T;");
    output.AppendLine("    error?: string;");
    output.AppendLine("}");

    foreach (var api in apiMetaDataCollection)
    {
        // Generate TypeScript interface for result type
        string strippedResultTypeName = ConvertToTSTypeOrStripDomain(api.ResultTypeName);
        if (!api.IsPrimitiveType && strippedResultTypeName != "void")
        {
            if (!generatedTypes.Contains(strippedResultTypeName))
            {
                output.AppendLine($"export interface {strippedResultTypeName} {{");
                foreach (var property in api.ResultTypeProperties)
                {
                    output.AppendLine($"    {property.PropertyName}: {ConvertToTSType(property.PropertyType)};");
                }
                output.AppendLine($"}}");
                generatedTypes.Add(strippedResultTypeName);
            }
        }

        // Generate TypeScript interface for parameters if they are complex types
        foreach (var parameter in api.Parameters)
        {
            string strippedParameterTypeName = ConvertToTSTypeOrStripDomain(parameter.ParameterType)+"ParamType";
            if (!IsPrimitive(parameter.ParameterType) && !generatedTypes.Contains(strippedParameterTypeName))
            {
                output.AppendLine($"export interface {strippedParameterTypeName} {{");
                foreach (var property in parameter.ParameterProperties)
                {
                    output.AppendLine($"    {property.PropertyName}: {ConvertToTSType(property.PropertyType)};");
                }
                output.AppendLine($"}}");
                generatedTypes.Add(strippedParameterTypeName);
            }
        }

        var controllerName = ExtractControllerName(api.ControllerName);

        // Generate TypeScript function for the API method using Approach 2 (Return an Object with Data or Error)
        if (string.Equals(api.HttpVerb, "HttpGet", StringComparison.OrdinalIgnoreCase))
        {
            string queryParams = string.Join("&", api.Parameters.SelectMany(param => param.ParameterProperties.Select(prop => $"{prop.PropertyName}=${{{prop.PropertyName}}}")));
            string paramList = string.Join(", ", api.Parameters.SelectMany(param => param.ParameterProperties.Select(prop => $"{prop.PropertyName}: {ConvertToTSType(prop.PropertyType)}")));

            output.AppendLine($"export async function {api.MethodName}({paramList}): Promise<ApiResponse<{strippedResultTypeName}[]>> {{");
            output.AppendLine($"    try {{");
            output.AppendLine($"        const query = `{queryParams}`;");
            output.AppendLine($"        const response = await fetch(`${{appConfig.domain}}/api/{controllerName}/{api.RoutePath}?${{query}}`, {{ method: 'get' }});");
            output.AppendLine($"        if (!response.ok) {{");
            output.AppendLine($"            return {{ error: `Failed with status code: ${{response.status}}` }};");
            output.AppendLine($"        }}");
            if (strippedResultTypeName != "void")
            {
                output.AppendLine($"        const data: {strippedResultTypeName}[] = await response.json();");
                output.AppendLine($"        return {{ data }};");
            }
            else
            {
                output.AppendLine($"        return {{ data: undefined }};");
            }
            output.AppendLine($"    }} catch (error) {{");
            output.AppendLine($"        return {{ error: 'Failed to fetch data' }};");
            output.AppendLine($"    }}");
            output.AppendLine($"}}");

            //string queryParams = string.Join("&", api.Parameters.Select(p => $"{p.ParameterName}=${{{p.ParameterName}}}"));
            //string paramList = string.Join(", ", api.Parameters.Select(p => $"{p.ParameterName}: {ConvertToTSType(p.ParameterType)}"));

            //output.AppendLine($"export async function {api.MethodName}({paramList}): Promise<ApiResponse<{strippedResultTypeName}[]>> {{");
            //output.AppendLine($"    try {{");
            //output.AppendLine($"        const response = await fetch(`${{appConfig.domain}}/api/{controllerName}/{api.RoutePath}?{queryParams}`, {{ method: 'get' }});");
            //output.AppendLine($"        if (!response.ok) {{");
            //output.AppendLine($"            return {{ error: `Failed with status code: ${{response.status}}` }};");
            //output.AppendLine($"        }}");
            //output.AppendLine($"        const data: {strippedResultTypeName}[] = await response.json();");
            //output.AppendLine($"        return {{ data }};");
            //output.AppendLine($"    }} catch (error) {{");
            //output.AppendLine($"        return {{ error: 'Failed to fetch data' }};");
            //output.AppendLine($"    }}");
            //output.AppendLine($"}}");
        }
        else if (string.Equals(api.HttpVerb, "HttpPost", StringComparison.OrdinalIgnoreCase))
        {
            string paramList = string.Join(", ", api.Parameters.Select(p => $"{p.ParameterName}: {ConvertToTSType(p.ParameterType)}"));
            //string bodyParams = string.Join(", ", api.Parameters.Select(p => $"{p.ParameterName}: {p.ParameterName}"));
            string bodyParams = string.Join(", ", api.Parameters.Select(p => $"{p.ParameterName}"));

            // Generate TypeScript type for parameters if multiple
            if (api.Parameters.Count > 1)
            {
                string paramsTypeName = $"{api.MethodName}Params";
                if (!generatedTypes.Contains(paramsTypeName))
                {
                    output.AppendLine($"export interface {paramsTypeName} {{");
                    foreach (var parameter in api.Parameters)
                    {
                        output.AppendLine($"    {parameter.ParameterName}: {ConvertToTSType(parameter.ParameterType)};");
                    }
                    output.AppendLine($"}}");
                    generatedTypes.Add(paramsTypeName);
                }
                output.AppendLine($"export async function {api.MethodName}(params: {paramsTypeName}): Promise<ApiResponse<{strippedResultTypeName}>> {{");
                output.AppendLine($"    try {{");
                output.AppendLine($"        const response = await fetch(`${{appConfig.domain}}/api/{controllerName}/{api.RoutePath}`, {{");
                output.AppendLine($"            method: 'post',");
                output.AppendLine($"            headers: {{ 'Content-Type': 'application/json' }},");
                output.AppendLine($"            body: JSON.stringify(params)");
                output.AppendLine($"        }});");
                output.AppendLine($"        if (!response.ok) {{");
                output.AppendLine($"            return {{ error: `Failed with status code: ${{response.status}}` }};");
                output.AppendLine($"        }}");
                output.AppendLine($"        const data: {strippedResultTypeName} = await response.json();");
                output.AppendLine($"        return {{ data }};");
                output.AppendLine($"    }} catch (error) {{");
                output.AppendLine($"        return {{ error: 'Failed to fetch data' }};");
                output.AppendLine($"    }}");
                output.AppendLine($"}}");
            }
            else
            {
                output.AppendLine($"export async function {api.MethodName}({paramList}): Promise<ApiResponse<{strippedResultTypeName}>> {{");
                output.AppendLine($"    try {{");
                output.AppendLine($"        const response = await fetch(`${{appConfig.domain}}/api/{controllerName}/{api.RoutePath}`, {{");
                output.AppendLine($"            method: 'post',");
                output.AppendLine($"            headers: {{ 'Content-Type': 'application/json' }},");
                //output.AppendLine($"            body: JSON.stringify({{{bodyParams}}})");
                var bodyParamsStr = (string.IsNullOrEmpty(bodyParams)) ? "\"\"" : $"JSON.stringify({bodyParams})";
                output.AppendLine($"            body: {bodyParamsStr}");
                output.AppendLine($"        }});");
                output.AppendLine($"        if (!response.ok) {{");
                output.AppendLine($"            return {{ error: `Failed with status code: ${{response.status}}` }};");
                output.AppendLine($"        }}");
                if (strippedResultTypeName != "void")
                {
                    output.AppendLine($"        const data: {strippedResultTypeName} = await response.json();");
                    output.AppendLine($"        return {{ data }};");
                }
                else
                {
                    output.AppendLine($"        return {{ data: undefined }};");
                }
                output.AppendLine($"    }} catch (error) {{");
                output.AppendLine($"        return {{ error: 'Failed to fetch data' }};");
                output.AppendLine($"    }}");
                output.AppendLine($"}}");
            }
        }
    }

    switch (outputMode)
    {
        case OutputMode.Console:
            Console.WriteLine(output.ToString());
            break;
        case OutputMode.File:
            File.WriteAllText(path, output.ToString());
            break;
        case OutputMode.Both:
            Console.WriteLine(output.ToString());
            File.WriteAllText(path, output.ToString());
            break;
    }
}

#endif

string ExtractControllerName(string controllerName)
{
    // Remove the "Controller" suffix
    const string suffix = "Controller";
    if (controllerName.EndsWith("Controller"))
    {
        controllerName = controllerName.Substring(0, controllerName.Length - suffix.Length);
    }
    // Convert the extracted name to lowercase
    return controllerName.ToLower();
}

string ConvertToTSTypeOrStripDomain(string typeName)
{
    if (string.IsNullOrEmpty(typeName))
    {
        return "void";
    }

    // Convert C# primitive types to TypeScript equivalents
    switch (typeName)
    {
        case "int":
        case "long":
        case "single":
        case "float":
        case "decimal":
            return "number";
        case "bool":
            return "boolean";
        case "System.DateTime":
            return "string"; // ISO format
        default:
            // If not a primitive, strip the namespace or domain from the type name
            return StripDomain(typeName);
    }
}

string StripDomain(string typeName)
{
    if (string.IsNullOrEmpty(typeName))
    {
        return "void";
    }
    // Strip the namespace or domain from the type name, keeping only the class name
    var parts = typeName.Split('.');
    return parts.Length > 0 ? parts.Last() : typeName;
}

bool IsPrimitive(string typeName)
{
    switch (typeName)
    {
        case "System.Int32":
        case "System.Single":
        case "System.Double":
        case "System.Decimal":
        case "System.String":
        case "System.Boolean":
        case "System.DateTime":
            return true;
        default:
            return false;
    }
}

string ConvertToTSType(string csharpType)
{
    if (TryParsePrimitive(csharpType, out string tsType))
    {
        return tsType;
    }
    else
    {
        return ParseObjectType(csharpType);
    }
}

bool TryParsePrimitive(string csharpType, out string tsType)
{
    tsType = csharpType switch
    {
        "System.Int32" => "number",
        "System.Single" => "number",
        "System.Double" => "number",
        "System.Decimal" => "number",
        "System.String" => "string",
        "System.Boolean" => "boolean",
        "System.DateTime" => "string", // ISO format
        _ => null
    };
    return tsType != null;
}

string ParseObjectType(string csharpType)
{
    // Assuming Parameters are populated for custom types
    var customParameter = apiMetaDataCollection.SelectMany(api => api.Parameters).FirstOrDefault(p => p.ParameterType == csharpType);
    if (customParameter != null && customParameter.ParameterProperties.Any())
    {
        //string interfaceName = customParameter.ParameterName + "ParamType";
        string interfaceName = StripDomain(csharpType) + "ParamType";
        Console.WriteLine($"export interface {interfaceName} {{");
        foreach (var property in customParameter.ParameterProperties)
        {
            Console.WriteLine($"    {property.PropertyName}: {ConvertToTSType(property.PropertyType)};");
        }
        Console.WriteLine($"}}");
        return interfaceName; // Return the generated TypeScript interface name
    }
    return "any"; // Default to 'any' for unknown types
};


public class Options
{
    [Option('d', "directory", Required = true, HelpText = "Path to the directory containing controller files.")]
    public required string DirectoryPath { get; set; }

    [Option('a', "assembly", Required = true, HelpText = "Path to the assembly for type definitions.")]
    public required string AssemblyPath { get; set; }

    [Option('n', "namespace", Required = true, HelpText = "Namespace of the parameter object type.")]
    public required string Namespace { get; set; }

    [Option('t', "typescript", Required = true, HelpText = "Path to the TypeScript output file.")]
    public required string TSFilePath { get; set; }

    [Option('o', "outputmode", Required = false, Default = OutputMode.Console, HelpText = "Output mode for writing TypeScript (Console, File, Both).")]
    public required OutputMode OutputMode { get; set; }
}


