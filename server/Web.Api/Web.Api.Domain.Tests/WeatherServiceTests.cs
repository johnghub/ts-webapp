using Microsoft.Extensions.Logging;
using Moq;
using Web.Api.Domain.Services;

namespace Web.Api.Domain.Tests
{
    public class WeatherServiceTests
    {
        private readonly Mock<ILogger<WeatherService>> _loggerMock;
        private readonly WeatherService _weatherService;

        public WeatherServiceTests()
        {
            _loggerMock = new Mock<ILogger<WeatherService>>();
            _weatherService = new WeatherService(_loggerMock.Object);
        }

        [Fact]
        public void GetWeather_InvalidLocation_ReturnsFailureResult()
        {
            // Arrange
            var invalidLocation = "not valid"; //"InvalidLocation";

            // Act
            var result = _weatherService.GetWeather(invalidLocation);

            // Assert
            Assert.False(result.Success);
            Assert.Null(result.Data);
            Assert.Contains("Weather request failed: Location is not valid.", result.Errors);

            _loggerMock.Verify(logger => logger.Log(
                 LogLevel.Information,
                 It.IsAny<EventId>(),
                 It.IsAny<It.IsAnyType>(),
                 It.IsAny<Exception>(),
                 (Func<It.IsAnyType, Exception?, string>)It.IsAny<object>()),
                 Times.Once);
        }

        [Fact]
        public void GetWeather_EmptyLocation_ReturnsFailureResult()
        {
            // Arrange
            var emptyLocation = "";

            // Act
            var result = _weatherService.GetWeather(emptyLocation);

            // Assert
            Assert.False(result.Success);
            Assert.Null(result.Data);

            _loggerMock.Verify(logger => logger.Log(
                 LogLevel.Information,
                 It.IsAny<EventId>(),
                 It.IsAny<It.IsAnyType>(),
                 It.IsAny<Exception>(),
                 (Func<It.IsAnyType, Exception?, string>)It.IsAny<object>()),
                 Times.Once);
        }

        [Fact]
        public void GetWeather_ValidLocation_ReturnsSuccessResult()
        {
            // Arrange
            var validLocation = "ValidLocation";

            // Act
            var result = _weatherService.GetWeather(validLocation);

            // Assert
            Assert.True(result.Success);
            Assert.NotNull(result.Data);
            Assert.Equal("23°C", result.Data.Temperature);
            Assert.Equal("Sunny", result.Data.Condition);
            Assert.Empty(result.Errors);
        }
    }
}
