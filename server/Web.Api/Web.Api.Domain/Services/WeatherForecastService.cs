using Microsoft.Extensions.DependencyInjection;
using Web.Api.Domain.Infrastructure;
using Web.Api.Domain.Models;

namespace Web.Api.Domain.Services
{
    [RegisterAsService(typeof(IWeatherForecastService), ServiceLifetime.Transient)]
    public class WeatherForecastService : IWeatherForecastService
    {
        private static readonly string[] _summaries =
        [
            "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
        ];


        [ReturnTypeDiscovery]
        public ServiceResult<IEnumerable<WeatherForecast>> GetWeatherForecast()
        {
            var result =  Enumerable.Range(1, 10).Select(index => new WeatherForecast
            {
                Id = index,  // Assign the index as the unique ID
                Date = DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                TemperatureC = Random.Shared.Next(-20, 55),
                Summary = _summaries[Random.Shared.Next(_summaries.Length)]
            })
            .ToArray();

            return ServiceResult<IEnumerable<WeatherForecast>>.SuccessResult(result);
        }
}

    public interface IWeatherForecastService
    {
        [ReturnTypeDiscovery]
        ServiceResult<IEnumerable<WeatherForecast>> GetWeatherForecast();
    }
}
