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
