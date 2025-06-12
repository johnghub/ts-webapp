
using Web.Api.Domain.Services;

namespace Web.Api.Domain.Tests
{
    public class WeatherForecastServiceTests
    {
        [Fact]
        public void GetWeatherForecast_ReturnsSuccessResult_WithTenForecasts()
        {
            // Arrange
            var service = new WeatherForecastService();

            // Act
            var result = service.GetWeatherForecast();

            // Assert
            Assert.NotNull(result);
            Assert.True(result.Success);
            Assert.NotNull(result.Data);

            var forecasts = result.Data.ToArray();
            Assert.Equal(10, forecasts.Length);

            // Check that each forecast has a unique Id and a summary
            Assert.Equal(10, forecasts.Select(f => f.Id).Distinct().Count());
            Assert.All(forecasts, f => Assert.False(string.IsNullOrWhiteSpace(f.Summary)));
        }

        [Fact]
        public void GetWeatherForecast_ForecastProperties_AreWithinExpectedRange()
        {
            // Arrange
            var service = new WeatherForecastService();

            // Act
            var result = service.GetWeatherForecast();
            var forecasts = result.Data.ToArray();

            // Assert
            foreach (var forecast in forecasts)
            {
                Assert.InRange(forecast.TemperatureC, -20, 54); // Random.Shared.Next is exclusive of max
                Assert.InRange(forecast.Date.DayNumber, DateOnly.FromDateTime(DateTime.Now.AddDays(1)).DayNumber, DateOnly.FromDateTime(DateTime.Now.AddDays(10)).DayNumber);
                Assert.Contains(forecast.Summary, new[]
                {
                    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
                });
            }
        }
    }
}
