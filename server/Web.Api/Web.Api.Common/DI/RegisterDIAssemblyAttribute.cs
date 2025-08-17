
namespace Web.Api.Common.DI
{
    [AttributeUsage(AttributeTargets.Class, Inherited = false, AllowMultiple = false)]
    public sealed class RegisterDIAssemblyAttribute : Attribute
    {
        // No need for properties now — but extensibility is easy later.
    }
}
