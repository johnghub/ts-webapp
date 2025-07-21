using Codegen.Common.Attributes;
using Codegen.Common.Infrastructure;
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
        [GenerateProxy(AuthScheme = AuthScheme.Anonymous,
            Intent = ClientIntent.UI,
            ProxyType = ProxyType.TypeScript,
            AIHint = "Anonymous endpoint. Issuing an HTTP request will retrieve the current weather forecast.")]
        public IActionResult GetWeatherForecast()
        {
            return HandleResult(weatherForecastService.GetWeatherForecast());
        }
    }
}
