using Microsoft.Extensions.DependencyInjection;
using Web.Api.Domain.Infrastructure;
using Web.Api.Domain.Models;

namespace Web.Api.Domain.Services
{

    [RegisterAsService(typeof(IWeatherService), ServiceLifetime.Transient)]
    public class WeatherService : IWeatherService
    {
        public ServiceResult<WeatherData> GetWeather(string location)
        {
            if (location != "ValidLocation")
            {
                return ServiceResult<WeatherData>.Failure([$"No weather data available for {location}."]);
            }

            return ServiceResult<WeatherData>.SuccessResult(new() { Temperature = "23°C", Condition = "Sunny" });
        }
    }

    public interface IWeatherService
    {
        ServiceResult<WeatherData> GetWeather(string location);
    }
}
