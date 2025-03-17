using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Web.Api.Domain.Infrastructure;
using Web.Api.Domain.Models;

namespace Web.Api.Domain.Services
{

    [RegisterAsService(typeof(IWeatherService), ServiceLifetime.Transient)]
    public class WeatherService(ILogger<WeatherService> logger) : IWeatherService
    {
        [ReturnTypeDiscovery]
        public ServiceResult<WeatherData> GetWeather(string location)
        {
            if (location != "ValidLocation")
            {
                var locationError = $"Weather request failed: Location is {(string.IsNullOrEmpty(location) ? "not set" : "not valid")}.";
                logger.LogInformation(locationError);
                return ServiceResult<WeatherData>.FailureResult([locationError]);
            }

            return ServiceResult<WeatherData>.SuccessResult(new() { Temperature = "23°C", Condition = "Sunny" });
        }
    }

    public interface IWeatherService
    {
        [ReturnTypeDiscovery]
        ServiceResult<WeatherData> GetWeather(string location);
    }
}
