using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Web.Api.Domain.Models;
using Web.Api.Domain.Services.Auth;
using Web.Api.Infrastructure.Controller;

namespace Web.Api.Controllers.Public
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(IUserAuthService authService) : PublicController
    {
        [HttpPost("login", Name = "login")]
        public async Task<IActionResult> Login([FromBody] UserCredentials credentials)
        {
            // Here, implement your user validation logic
            //var isValidUser = true;// (credentials.Username == "test" && credentials.Password == "password");
            var isValidUser = await authService.AuthenticateAsync(credentials);

            if (!isValidUser.Success)
                return Unauthorized();

            var claims = new List<Claim>
            {
                new (ClaimTypes.Name, credentials.Username)
            };

            var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var principal = new ClaimsPrincipal(identity);

            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);

            return Ok(new { success = true, message = "Login successful", user = new { name = "Test User" } } ); 

        }

        [HttpPost("logout", Name="logout")]
        public async Task<IActionResult> Logout()
        {
            //await HttpContext.SignOutAsync("CookieAuth");
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            Response.Cookies.Delete("YourAuthCookie");
            return NoContent();
        }
    }
}
