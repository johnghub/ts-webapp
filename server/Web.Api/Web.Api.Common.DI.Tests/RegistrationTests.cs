using System.Reflection;
using Microsoft.Extensions.DependencyInjection;


namespace Web.Api.Common.DI.Tests
{
    public interface ISingletonSvc { Guid Id { get; } }
    [RegisterAsService(typeof(ISingletonSvc), ServiceLifetime.Singleton)]
    public sealed class SingletonSvc : ISingletonSvc { public Guid Id { get; } = Guid.NewGuid(); }

    public interface IScopedSvc { Guid Id { get; } }
    [RegisterAsService(typeof(IScopedSvc), ServiceLifetime.Scoped)]
    public sealed class ScopedSvc : IScopedSvc { public Guid Id { get; } = Guid.NewGuid(); }

    public interface ITransientSvc { Guid Id { get; } }
    [RegisterAsService(typeof(ITransientSvc), ServiceLifetime.Transient)]
    public sealed class TransientSvc : ITransientSvc { public Guid Id { get; } = Guid.NewGuid(); }

    public interface INonAttributed { }
    public sealed class NonAttributed : INonAttributed { } // not registered

    public interface IMultiImpl { string Who { get; } }
    [RegisterAsService(typeof(IMultiImpl))]
    public sealed class MultiImplA : IMultiImpl { public string Who => "A"; }
    [RegisterAsService(typeof(IMultiImpl))]
    public sealed class MultiImplB : IMultiImpl { public string Who => "B"; }

    public interface IFromStartup { string Marker { get; } }
    public sealed class FromStartup : IFromStartup { public string Marker => "startup-registered"; }

    // Startup that SHOULD be discovered
    [RegisterDIAssembly]
    public sealed class SampleStartup : IAssemblyDIStartup
    {
        public Assembly Assembly => typeof(SampleStartup).Assembly;
        public void RegisterServices(IServiceCollection services)
        {
            // Register something obvious to assert against
            services.AddSingleton<IFromStartup, FromStartup>();
        }
    }

    // Startup that should be IGNORED because it lacks [RegisterDIAssembly]
    public sealed class UndiscoverableStartup : IAssemblyDIStartup
    {
        public Assembly Assembly => typeof(UndiscoverableStartup).Assembly;
        public void RegisterServices(IServiceCollection services)
        {
            services.AddSingleton<IIgnored, Ignored>();
        }
    }
    public interface IIgnored { }
    public sealed class Ignored : IIgnored { }

    // ---------- Tests ----------
    public class ServiceCollectionExtensionsTests
    {
        private static Assembly ThisAssembly => typeof(ServiceCollectionExtensionsTests).Assembly;

        [Fact]
        public void RegisterAttributedServices_RegistersOnlyAttributedTypes()
        {
            var services = new ServiceCollection();

            services.RegisterAttributedServices(ThisAssembly);

            using var provider = services.BuildServiceProvider();

            // Attributed interfaces resolve
            Assert.NotNull(provider.GetService<ISingletonSvc>());
            Assert.NotNull(provider.GetService<IScopedSvc>());
            Assert.NotNull(provider.GetService<ITransientSvc>());

            // Non-attributed does NOT resolve
            Assert.Null(provider.GetService<INonAttributed>());
        }

        [Fact]
        public void RegisterAttributedServices_RespectsLifetimes()
        {
            var services = new ServiceCollection().RegisterAttributedServices(ThisAssembly);
            using var root = services.BuildServiceProvider();

            // Singleton: same across root resolves
            var s1 = root.GetRequiredService<ISingletonSvc>();
            var s2 = root.GetRequiredService<ISingletonSvc>();
            Assert.Equal(s1.Id, s2.Id);

            // Transient: different each resolve
            var t1 = root.GetRequiredService<ITransientSvc>();
            var t2 = root.GetRequiredService<ITransientSvc>();
            Assert.NotEqual(t1.Id, t2.Id);

            // Scoped: same within a scope, different across scopes
            using var scopeA = root.CreateScope();
            using var scopeB = root.CreateScope();
            var a1 = scopeA.ServiceProvider.GetRequiredService<IScopedSvc>();
            var a2 = scopeA.ServiceProvider.GetRequiredService<IScopedSvc>();
            var b1 = scopeB.ServiceProvider.GetRequiredService<IScopedSvc>();
            Assert.Equal(a1.Id, a2.Id);
            Assert.NotEqual(a1.Id, b1.Id);
        }

        [Fact]
        public void RegisterAttributedServices_AllowsMultipleImplementations()
        {
            var services = new ServiceCollection().RegisterAttributedServices(ThisAssembly);
            using var provider = services.BuildServiceProvider();

            var all = provider.GetServices<IMultiImpl>().ToArray();
            Assert.True(all.Length >= 2, "Expected at least two IMultiImpl registrations.");
            Assert.Contains(all, x => x.Who == "A");
            Assert.Contains(all, x => x.Who == "B");
        }
    }

    public class ServiceRegistrationTests
    {
        [Fact]
        public void RegisterDomainServices_FindsOnlyAttributedStartups_AndInvokesThem()
        {
            var services = new ServiceCollection();

            // This scans AppDomain assemblies, finds SampleStartup (has [RegisterDIAssembly]),
            // and should NOT include UndiscoverableStartup.
            services.RegisterDomainServices();

            using var provider = services.BuildServiceProvider();

            // Service registered by SampleStartup should be available
            var fromStartup = provider.GetService<IFromStartup>();
            Assert.NotNull(fromStartup);
            Assert.Equal("startup-registered", fromStartup!.Marker);

            // Service from UndiscoverableStartup should NOT be registered
            Assert.Null(provider.GetService<IIgnored>());
        }
    }
}
