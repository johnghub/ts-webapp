// See https://aka.ms/new-console-template for more information
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using System.Reflection;
using CommandLine;

var executionDirectory = AppDomain.CurrentDomain.BaseDirectory;
Console.WriteLine($"Execution Directory: {executionDirectory}");

Parser.Default.ParseArguments<Options>(args)
    .WithParsed<Options>(opts =>
    {
        var directoryPath = Path.IsPathRooted(opts.DirectoryPath) ? opts.DirectoryPath : Path.Combine(executionDirectory, opts.DirectoryPath);
        var assemblyPath = Path.IsPathRooted(opts.AssemblyPath) ? opts.AssemblyPath : Path.Combine(executionDirectory, opts.AssemblyPath);
        var parameterNamespace = opts.Namespace;

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
    });

static void ProcessControllerFile(string filePath, Assembly assembly, string parameterNamespace)
{
    var code = File.ReadAllText(filePath);
    var tree = CSharpSyntaxTree.ParseText(code);
    var root = tree.GetRoot() as CompilationUnitSyntax;

    foreach (var classNode in root.DescendantNodes().OfType<ClassDeclarationSyntax>())
    {
        if (classNode.Identifier.Text.EndsWith("Controller"))
        {
            Console.WriteLine($"Controller: {classNode.Identifier.Text}");
            foreach (var method in classNode.Members.OfType<MethodDeclarationSyntax>())
            {
                var attributes = method.AttributeLists;
                foreach (var attr in attributes)
                {
                    Console.WriteLine($"  Method: {method.Identifier.Text}");
                    Console.WriteLine($"  Return Type: {method.ReturnType}");
                    Console.WriteLine($"  Attributes: {string.Join(", ", attr.Attributes)}");

                    // Extract parameters
                    foreach (var parameter in method.ParameterList.Parameters)
                    {
                        Console.WriteLine($"  Parameter: {parameter.Identifier.Text} of Type: {parameter.Type}");

                        // Extract properties of complex object parameters
                        var parameterType = parameter.Type as IdentifierNameSyntax;
                        if (parameterType != null)
                        {
                            var fullTypeName = $"{parameterNamespace}.{parameterType.Identifier.Text}";
                            var type = assembly.GetType(fullTypeName);
                            if (type != null)
                            {
                                Console.WriteLine($"    Properties of {parameterType.Identifier.Text}:");
                                foreach (var property in type.GetProperties())
                                {
                                    Console.WriteLine($"      {property.Name} of Type: {property.PropertyType}");
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

public class Options
{
    [Option('d', "directory", Required = true, HelpText = "Path to the directory containing controller files.")]
    public required string DirectoryPath { get; set; }

    [Option('a', "assembly", Required = true, HelpText = "Path to the assembly for type definitions.")]
    public required string AssemblyPath { get; set; }

    [Option('n', "namespace", Required = true, HelpText = "Namespace of the parameter object type.")]
    public required string Namespace { get; set; }
}


