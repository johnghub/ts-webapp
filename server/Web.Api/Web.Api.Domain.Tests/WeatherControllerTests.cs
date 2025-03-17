using Moq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Web.Api.Domain.Services;
using Web.Api.Controllers.Secure;
using Web.Api.Domain.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Web.Api.Domain.Tests
{
    public class WeatherControllerTests
    {
        private readonly WeatherController _controller;
        private readonly Mock<IWeatherService> _weatherServiceMock;

        public WeatherControllerTests()
        {
            _weatherServiceMock = new Mock<IWeatherService>();

            var user = CreateMockUser("TestUser", "testuser@example.com");

            _controller = new(_weatherServiceMock.Object);

        }

        private ClaimsPrincipal CreateMockUser(string name, string email, string role = null)
        {
            var claims = new List<Claim>
            {
                new(ClaimTypes.Name, name),
                new(ClaimTypes.Email, email)
            };

            if (role != null)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            return new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuthType"));
        }

        private ControllerContext CreateControllerContextWithUser(
            string? name = null,
            string? email = null,
            string? role = null)
        {
            // Create claims based on parameters
            var claims = new List<Claim>();

            if (!string.IsNullOrEmpty(name))
                claims.Add(new Claim(ClaimTypes.Name, name));

            if (!string.IsNullOrEmpty(email))
                claims.Add(new Claim(ClaimTypes.Email, email));

            if (!string.IsNullOrEmpty(role))
                claims.Add(new Claim(ClaimTypes.Role, role));

            var identity = claims.Any()
                ? new ClaimsIdentity(claims, "TestAuthType")
                : new ClaimsIdentity(); // Unauthenticated if no claims

            var user = new ClaimsPrincipal(identity);

            // Create and return ControllerContext
            return new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = user
                }
            };
        }

        private ControllerContext CreateControllerContextWithValidUser()
        {
            return CreateControllerContextWithUser(
                name: "ValidUser",
                email: "validuser@example.com",
                role: "Admin");
        }

        private ControllerContext CreateControllerContextWithInvalidUser()
        {
            return CreateControllerContextWithUser(); // No claims, unauthenticated
        }

        [Fact]
        public void GetWeather_InvalidModelState_ReturnsBadRequest()
        {

            // Arrange - Add an error to ModelState

            var location = "location";
            var errorMsg = "Location is required";
            var serviceResult = ServiceResult<WeatherData>.FailureResult(errorMsg); // Use new Failure overload

            var weatherRequest = new WeatherRequest { Location = location };

            _weatherServiceMock.Setup(service => service.GetWeather(location))
                .Returns(serviceResult);

            _controller.ControllerContext = CreateControllerContextWithValidUser();

            // Act
            var result = _controller.GetWeather(weatherRequest);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.NotNull(badRequestResult);

            // Ensure response is a dictionary or validation error structure
            var errorResponse = Assert.IsType<SerializableError>(badRequestResult.Value);

            // Extract and verify error messages
            var errorMessages = errorResponse.Values.Cast<string[]>().SelectMany(e => e).ToList();

            var values = badRequestResult.Value as SerializableError;
            Assert.Contains("Location is required", errorMessages);
        }

        [Fact]
        public void GetWeather_ServiceFailure_ReturnsBadRequestWithErrors()
        {
            // Arrange
            _controller.ControllerContext = CreateControllerContextWithValidUser();

            var location = "UnknownLocation";
            var errorMsg = "No weather data available for this location.";
            var serviceResult = ServiceResult<WeatherData>.FailureResult(errorMsg); // Use new Failure overload

            _weatherServiceMock.Setup(service => service.GetWeather(location))
                .Returns(serviceResult);

            var weatherRequest = new WeatherRequest { Location = location };

            // Act
            var result = _controller.GetWeather(weatherRequest);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.NotNull(badRequestResult);

            // Ensure response is a dictionary or validation error structure
            var errorResponse = Assert.IsType<SerializableError>(badRequestResult.Value);

            // Extract and verify error messages
            var errorMessages = errorResponse.Values.Cast<string[]>().SelectMany(e => e).ToList();

            Assert.Contains(errorMsg, errorMessages);

        }

        [Fact]
        public void GetWeather_ValidRequest_ReturnsOkWithWeatherData()
        {
            // Arrange
            _controller.ControllerContext = CreateControllerContextWithValidUser();

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

        [Fact]
        public void GetUserInfo_Returns_Unauthorized_When_User_Is_Null()
        {
            // Arrange
            _controller.ControllerContext = CreateControllerContextWithInvalidUser();

            var location = "ValidLocation";
            var serviceResult = ServiceResult<WeatherData>.FailureResult("Unauthorized");

            _weatherServiceMock.Setup(service => service.GetWeather(location))
                .Returns(serviceResult);

            var weatherRequest = new WeatherRequest { Location = location };

            // Act
            var result = _controller.GetWeather(weatherRequest);

            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            // Extract the value as a dynamic object
            var errorResponse = unauthorizedResult.Value;

            // Verify that the response contains the expected error message
            Assert.NotNull(errorResponse);
            Assert.Contains("Unauthorized", errorResponse.ToString());

        }

    }
}
