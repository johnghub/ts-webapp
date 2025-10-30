// Project: CodeGen.AuthProviders
// Purpose: Roslyn Source Generator that emits IAuthProvider implementations for each IAuthCredentials type
// Target Domain: Authentication
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.Text;
using System.Collections.Immutable;
using System.Text;

namespace CodeGen.AuthProviders
{
    [Generator]
    public class AuthProviderGenerator : IIncrementalGenerator
    {
        public void Initialize(IncrementalGeneratorInitializationContext context)
        {

//#if DE BUG
//            if (!System.Diagnostics.Debugger.IsAttached)
//            {
//                System.Diagnostics.Debugger.Launch();
//            }
//#endif


            // Find all class declarations with a base list
            var classDeclarations = context.SyntaxProvider
                .CreateSyntaxProvider(
                    predicate: static (s, _) => s is ClassDeclarationSyntax { BaseList: not null },
                    transform: static (ctx, _) => (ClassDeclarationSyntax)ctx.Node)
                .Where(static m => m is not null);

            // Combine with compilation to get semantic information
            var compilationAndClasses = context.CompilationProvider.Combine(classDeclarations.Collect());

            // Register the source output
            context.RegisterSourceOutput(compilationAndClasses, static (spc, source) => Execute(source.Left, source.Right, spc));
        }

        private static void Execute(Compilation compilation, ImmutableArray<ClassDeclarationSyntax> classes, SourceProductionContext context)
        {
            if (classes.IsDefaultOrEmpty)
                return;

#if true
            foreach (var candidate in classes)
            {
                var model = compilation.GetSemanticModel(candidate.SyntaxTree);
                var symbol = model.GetDeclaredSymbol(candidate) as INamedTypeSymbol;

                if (symbol is null || !ImplementsInterface(symbol, "AuthProvider.Models.IAuthCredentials"))
                    continue;

                // Try to get the AuthScheme from the attribute
                var schemeValue = GetAuthSchemeFromAttribute(symbol);
                if (schemeValue == null)
                {
                    // Report diagnostic if attribute is missing
                    var descriptor = new DiagnosticDescriptor(
                        "AUTHGEN001",
                        "Missing AuthScheme attribute",
                        "Class {0} implements IAuthCredentials but is missing [AuthScheme] attribute",
                        "CodeGen.AuthProviders",
                        DiagnosticSeverity.Warning,
                        true);

                    context.ReportDiagnostic(Diagnostic.Create(descriptor, candidate.GetLocation(), symbol.Name));
                    continue;
                }

                var credentialType = symbol.ToDisplayString(SymbolDisplayFormat.FullyQualifiedFormat);
                var credentialTypeName = symbol.Name;
                var providerName = $"Generated{schemeValue}Provider";

                var source = GenerateProviderClass(schemeValue, providerName, credentialType, credentialTypeName);
                context.AddSource($"{providerName}.g.cs", SourceText.From(source, Encoding.UTF8));
            }
#else
            foreach (var candidate in classes)
            {
                var model = compilation.GetSemanticModel(candidate.SyntaxTree);
                var symbol = model.GetDeclaredSymbol(candidate) as INamedTypeSymbol;

                if (symbol is null || !ImplementsInterface(symbol, "AuthProvider.Models.IAuthCredentials"))
                    continue;

                var credentialType = symbol.ToDisplayString(SymbolDisplayFormat.FullyQualifiedFormat);
                var credentialTypeName = symbol.Name;
                var scheme = InferSchemeFromTypeName(credentialTypeName);
                var providerName = $"Generated{scheme}Provider";

                var source = GenerateProviderClass(scheme, providerName, credentialType, credentialTypeName);
                context.AddSource($"{providerName}.g.cs", SourceText.From(source, Encoding.UTF8));
            }
#endif
        }

        private static string? GetAuthSchemeFromAttribute(INamedTypeSymbol symbol)
        {
            var authSchemeAttr = symbol.GetAttributes()
                .FirstOrDefault(attr => attr.AttributeClass?.Name == "AuthSchemeAttribute");

            if (authSchemeAttr == null)
                return null;

            // The enum value is the first constructor argument
            if (authSchemeAttr.ConstructorArguments.Length > 0)
            {
                var enumValue = authSchemeAttr.ConstructorArguments[0];
                if (enumValue.Value != null && enumValue.Type is INamedTypeSymbol enumType)
                {
                    // Get the enum member name from the value
                    var members = enumType.GetMembers().OfType<IFieldSymbol>();
                    var matchingMember = members.FirstOrDefault(m =>
                        m.IsConst &&
                        m.HasConstantValue &&
                        Equals(m.ConstantValue, enumValue.Value));

                    return matchingMember?.Name;
                }
            }

            return null;
        }

        private static string InferSchemeFromTypeName(string typeName)
        {
            // Remove "Credentials" suffix if present
            return typeName.EndsWith("Credentials")
                    ? typeName.Substring(0, typeName.Length - "Credentials".Length)
                    : typeName;
        }

        private static string GenerateProviderClass(string scheme, string className, string credentialTypeFullName, string credentialTypeName)
        {
            return $@"// <auto-generated />
using System;
using System.Threading.Tasks;
using AuthProvider.Interfaces;
using AuthProvider.Models;
using Codegen.Common.Infrastructure;
using Codegen.Common.Attributes;

namespace Web.Api.Generated.Providers
{{
    public sealed class {className} : IAuthProvider
    {{
        public AuthScheme Scheme => AuthScheme.{scheme};
        
        public Type SupportedCredentialsType => typeof({credentialTypeFullName});

        public Task<bool> TryAuthenticateAsync(IAuthCredentials credentials)
        {{
            if (credentials is not {credentialTypeFullName} typed)
                throw new InvalidOperationException($""Invalid credential type: expected {credentialTypeName}"");

            // TODO: Implement {scheme} authentication logic here
            return Task.FromResult(true);
        }}
    }}
}}";
        }

        private static bool ImplementsInterface(INamedTypeSymbol symbol, string interfaceFullName)
        {
            return symbol.AllInterfaces.Any(i => i.ToDisplayString() == interfaceFullName);
        }
    }
}