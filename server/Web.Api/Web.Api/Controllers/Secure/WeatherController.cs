using Codegen.Common.Attributes;
using Codegen.Common.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Web.Api.Domain.Models;
using Web.Api.Domain.Services;
using Web.Api.Infrastructure.Controller;

namespace Web.Api.Controllers.Secure
{
    [Route("api/[controller]")]
    [ApiController]
    public class WeatherController(IWeatherService weatherService) : PublicController // SecureController //  
    {
        [HttpGet("getweather", Name = "getweather")]
        [GenerateProxy(AuthScheme = AuthScheme.Anonymous,
            Intent = ClientIntent.UI,
            ProxyType = ProxyType.TypeScript,
            AIHint = "Anonymous endpoint. Issuing an HTTP request correct location will retrieve the current weather forecast based on the current location.")]

        public IActionResult GetWeather([FromQuery] WeatherRequest request)
        {

            var authResult = EnsureAuthenticated();
            if (authResult is UnauthorizedObjectResult)
                return authResult;

            var serviceResult = weatherService.GetWeather(request.Location);
            return HandleResult(serviceResult);

        }
    }
}
