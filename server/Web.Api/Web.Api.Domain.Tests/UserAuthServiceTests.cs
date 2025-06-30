using AuthProvider.Interfaces;
using AuthProvider.Models;
using Moq;
using Web.Api.Domain.Services.Auth;

namespace Web.Api.Domain.Tests
{
    public class UserAuthServiceTests
    {
        [Fact]
        public async Task AuthenticateAsync_ProviderCanHandleAndSucceeds_ReturnsSuccess()
        {
            // Arrange
            var credentials = new UserCredentials { Username = "user", Password = "pass" };
            var providerMock = new Mock<IAuthProvider>();
            providerMock.Setup(p => p.CanHandle(credentials)).Returns(true);
            providerMock.Setup(p => p.TryAuthenticateAsync(credentials)).ReturnsAsync(true);

            var service = new UserAuthService([providerMock.Object]);

            // Act
            var result = await service.AuthenticateAsync(credentials);

            // Assert
            Assert.True(result.Success);
            Assert.True(result.Data);
            Assert.Empty(result.Errors);
        }

        [Fact]
        public async Task AuthenticateAsync_ProviderCanHandleAndFails_ReturnsFailure()
        {
            // Arrange
            var credentials = new UserCredentials { Username = "user", Password = "wrongpass" };
            var providerMock = new Mock<IAuthProvider>();
            providerMock.Setup(p => p.CanHandle(credentials)).Returns(true);
            providerMock.Setup(p => p.TryAuthenticateAsync(credentials)).ReturnsAsync(false);

            var service = new UserAuthService(new[] { providerMock.Object });

            // Act
            var result = await service.AuthenticateAsync(credentials);

            // Assert
            Assert.False(result.Success);
            Assert.False(result.Data);
            Assert.Contains("Authentication failed.", result.Errors);
        }

        [Fact]
        public async Task AuthenticateAsync_NoProviderCanHandle_ReturnsFailure()
        {
            // Arrange
            var credentials = new UserCredentials { Username = "user", Password = "pass" };
            var providerMock = new Mock<IAuthProvider>();
            providerMock.Setup(p => p.CanHandle(credentials)).Returns(false);

            var service = new UserAuthService([providerMock.Object]);

            // Act
            var result = await service.AuthenticateAsync(credentials);

            // Assert
            Assert.False(result.Success);
            Assert.False(result.Data);
            Assert.Contains("No suitable provider found.", result.Errors);
        }

        [Fact]
        public async Task AuthenticateAsync_NullCredentials_ReturnsCredentialsMustNotBeNull()
        {
            // Arrange
            var providerMock = new Mock<IAuthProvider>();
            var service = new UserAuthService([providerMock.Object]);

            // Act
            var result = await service.AuthenticateAsync(null);

            // Assert
            Assert.False(result.Success);
            Assert.False(result.Data);
            Assert.Contains("Credentials must not be null.", result.Errors);
        }

        [Fact]
        public async Task AuthenticateAsync_MultipleProviders_UsesFirstCapableProvider()
        {
            // Arrange
            var credentials = new UserCredentials { Username = "user", Password = "pass" };

            var provider1 = new Mock<IAuthProvider>();
            provider1.Setup(p => p.CanHandle(credentials)).Returns(false);

            var provider2 = new Mock<IAuthProvider>();
            provider2.Setup(p => p.CanHandle(credentials)).Returns(true);
            provider2.Setup(p => p.TryAuthenticateAsync(credentials)).ReturnsAsync(true);

            var service = new UserAuthService([provider1.Object, provider2.Object]);

            // Act
            var result = await service.AuthenticateAsync(credentials);

            // Assert
            Assert.True(result.Success);
            Assert.True(result.Data);
            Assert.Empty(result.Errors);
            provider2.Verify(p => p.TryAuthenticateAsync(credentials), Times.Once);
            provider1.Verify(p => p.TryAuthenticateAsync(It.IsAny<IAuthCredentials>()), Times.Never);
        }

        [Fact]
        public async Task AuthenticateAsync_ProviderThrowsException_PropagatesException()
        {
            // Arrange
            var credentials = new UserCredentials { Username = "user", Password = "pass" };
            var providerMock = new Mock<IAuthProvider>();
            providerMock.Setup(p => p.CanHandle(credentials)).Returns(true);
            providerMock.Setup(p => p.TryAuthenticateAsync(credentials)).ThrowsAsync(new System.Exception("Provider error"));

            var service = new UserAuthService(new[] { providerMock.Object });

            // Act & Assert
            await Assert.ThrowsAsync<System.Exception>(() => service.AuthenticateAsync(credentials));
        }

    }
}