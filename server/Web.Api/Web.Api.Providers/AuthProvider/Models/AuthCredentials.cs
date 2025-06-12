using System.Security.Cryptography.X509Certificates;

namespace AuthProvider.Models
{
    public interface IAuthCredentials { }

    public class UserCredentials : IAuthCredentials
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }

    public class ClientCertCredentials : IAuthCredentials
    {
        public X509Certificate2 Certificate { get; set; }
    }

    public class OAuthCredentials : IAuthCredentials
    {
        public string AccessToken { get; set; }
    }
}

