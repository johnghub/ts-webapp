using Moq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Web.Api.Domain.Services;
using Web.Api.Controllers.Secure;
using Web.Api.Domain.Models;

namespace Web.Api.Domain.Tests
{
    public class WeatherControllerTests
    {
        private readonly WeatherController _controller;
        private readonly Mock<IWeatherService> _weatherServiceMock;

        public WeatherControllerTests()
        {
            _weatherServiceMock = new Mock<IWeatherService>();
            _controller = new(_weatherServiceMock.Object)
            {
                // Setup Controller Context with ModelState
                ControllerContext = new ControllerContext
                {
                    HttpContext = new DefaultHttpContext()
                }
            };
        }

        [Fact]
        public void GetWeather_InvalidModelState_ReturnsBadRequest()
        {
            // Arrange - Add an error to ModelState
            _controller.ModelState.AddModelError("Location", "Location is required");

            // Act
            var result = _controller.GetWeather(new WeatherRequest());

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
            var badRequestResult = result as BadRequestObjectResult;
            Assert.NotNull(badRequestResult);
            var values = badRequestResult.Value as SerializableError;
            Assert.Contains("Location", values.Keys);
        }

        [Fact]
        public void GetWeather_ServiceFailure_ReturnsBadRequestWithErrors()
        {
            // Arrange
            var location = "UnknownLocation";
            var serviceResult = ServiceResult<WeatherData>.Failure(new List<string> { "No weather data available for this location." });
            _weatherServiceMock.Setup(service => service.GetWeather(location))
                .Returns(serviceResult);

            var weatherRequest = new WeatherRequest { Location = location };

            // Act
            var result = _controller.GetWeather(weatherRequest);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.NotNull(badRequestResult);
            var serializableError = badRequestResult.Value as SerializableError;
            Assert.NotNull(serializableError); // Ensure casting is successful
            Assert.True(serializableError.ContainsKey(string.Empty)); // Check if the generic error key contains the expected error
            Assert.Contains("No weather data available for this location.", serializableError[string.Empty] as string[]);
        }

        [Fact]
        public void GetWeather_ValidRequest_ReturnsOkWithWeatherData()
        {
            // Arrange
            var location = "ValidLocation";
            var expectedWeatherData = new WeatherData { Temperature = "23°C", Condition = "Sunny" };
            var serviceResult = ServiceResult<WeatherData>.SuccessResult(expectedWeatherData);
            _weatherServiceMock.Setup(service => service.GetWeather(location))
                .Returns(serviceResult);

            var weatherRequest = new WeatherRequest { Location = location };

            // Act
            var result = _controller.GetWeather(weatherRequest);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult);
            var actualWeatherData = okResult.Value as WeatherData;
            Assert.NotNull(actualWeatherData);
            Assert.Equal(expectedWeatherData.Temperature, actualWeatherData.Temperature);
            Assert.Equal(expectedWeatherData.Condition, actualWeatherData.Condition);
        }

        // Additional tests for valid ModelState or service behavior can be added here
    }
}
