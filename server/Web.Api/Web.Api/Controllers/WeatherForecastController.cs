using Microsoft.AspNetCore.Mvc;
using Web.Api.Domain.Services;
using Web.Api.Infrastructure.Controller;

namespace Web.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WeatherForecastController(IWeatherForecastService weatherForecastService) : PublicController
    {

        [HttpGet("getweatherforecast", Name = "GetWeatherForecast" )]
        public IActionResult GetWeatherForecast()
        {
            return HandleResult(weatherForecastService.GetWeatherForecast());
        }
    }
}
