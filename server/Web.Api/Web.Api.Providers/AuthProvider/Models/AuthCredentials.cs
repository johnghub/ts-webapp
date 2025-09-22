using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography.X509Certificates;

namespace AuthProvider.Models
{
    public interface IAuthCredentials { }

    public sealed class UserCredentials : IAuthCredentials
    {
        [Required, MinLength(1)]
        public required string Username { get; set; }
        [Required, MinLength(1)]
        public required string Password { get; set; }
    }

    public class ClientCertCredentials : IAuthCredentials
    {
        public X509Certificate2? Certificate { get; set; }
    }

    public class OAuthCredentials : IAuthCredentials
    {
        public string? AccessToken { get; set; }
    }
}

