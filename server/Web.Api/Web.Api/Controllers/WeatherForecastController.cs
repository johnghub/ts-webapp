using Microsoft.AspNetCore.Mvc;
using Web.Api.Domain.Services;
using Web.Api.Infrastructure.Controller;

namespace Web.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WeatherForecastController(IWeatherForecastService weatherForecastService) : PublicController
    {

        [HttpGet(Name = "GetWeatherForecast")]
        public IActionResult Get()
        {
            var result = weatherForecastService.GetWeatherForecast();

            if (result == null || !result.Any())
            {
                return NotFound(); // Respond with a 404 if no data is available
            }

            return Ok(result); // Respond with a 200 OK and the result if available
        }
    }
}
