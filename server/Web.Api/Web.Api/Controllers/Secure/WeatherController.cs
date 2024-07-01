using Microsoft.AspNetCore.Mvc;
using Web.Api.Domain.Models;
using Web.Api.Domain.Services;
using Web.Api.Infrastructure.Controller;

namespace Web.Api.Controllers.Secure
{
    [Route("api/[controller]")]
    [ApiController]
    public class WeatherController(IWeatherService weatherService) : SecureController
    {
        [HttpGet("getweather")]
        public IActionResult GetWeather([FromQuery] WeatherRequest request)
        {
            var validationResponse = ValidateModelState();
            if (validationResponse != null)
                return validationResponse;

            var serviceResult = weatherService.GetWeather(request.Location);
            var serviceResponse = HandleServiceResult(serviceResult);
            if (serviceResponse != null)
                return serviceResponse;

            return Ok(serviceResult.Data);
        }
    }
}
