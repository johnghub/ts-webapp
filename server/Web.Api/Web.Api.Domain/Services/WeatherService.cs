using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Web.Api.Common.DI;
using Web.Api.Domain.Models;

namespace Web.Api.Domain.Services
{

    [RegisterAsService(typeof(IWeatherService), ServiceLifetime.Transient)]
    public class WeatherService(ILogger<WeatherService> logger) : IWeatherService
    {
        public ServiceResult<WeatherData> GetWeather(string location)
        {
            if (location != "ValidLocation")
            {
                var locationError = $"Weather request failed: Location is {(string.IsNullOrEmpty(location) ? "not set" : "not valid")}.";
                logger.LogInformation("Weather request failed: Location is {LocationStatus}.", string.IsNullOrEmpty(location) ? "not set" : "not valid");
                return ServiceResult<WeatherData>.FailureResult([locationError]);
            }

            return ServiceResult<WeatherData>.SuccessResult(new() { Temperature = "23°C", Condition = "Sunny" });
        }
    }

    public interface IWeatherService
    {
        ServiceResult<WeatherData> GetWeather(string location);
    }
}
