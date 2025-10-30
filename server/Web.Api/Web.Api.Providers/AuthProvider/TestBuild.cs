using Web.Api.Generated.Providers;

namespace AuthProvider
{
    internal class TestBuild
    {
        // NOOP constructor to test build of generated providers
        public TestBuild()
        {
            var testCookie = new GeneratedCookieProvider();
            var testClient = new GeneratedClientCertificateProvider();
            var testCert = new GeneratedClientCertificateProvider();
        }
    }
}
