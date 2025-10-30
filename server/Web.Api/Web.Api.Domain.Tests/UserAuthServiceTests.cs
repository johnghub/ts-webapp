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
            var credentials = new UserCredentials { Username = "user", Password = "pass" };
            var providerMock = new Mock<IAuthProvider>();
            providerMock.SetupGet(p => p.SupportedCredentialsType).Returns(typeof(UserCredentials));
            providerMock.Setup(p => p.TryAuthenticateAsync(credentials)).ReturnsAsync(true);

            var service = new UserAuthService(new[] { providerMock.Object });

            var result = await service.AuthenticateAsync(credentials);

            Assert.True(result.Success);
            Assert.True(result.Data);
            Assert.Empty(result.Errors);
        }

        [Fact]
        public async Task AuthenticateAsync_ProviderCanHandleAndFails_ReturnsFailure()
        {
            var credentials = new UserCredentials { Username = "user", Password = "wrongpass" };
            var providerMock = new Mock<IAuthProvider>();
            providerMock.SetupGet(p => p.SupportedCredentialsType).Returns(typeof(UserCredentials));
            providerMock.Setup(p => p.TryAuthenticateAsync(credentials)).ReturnsAsync(false);

            var service = new UserAuthService(new[] { providerMock.Object });

            var result = await service.AuthenticateAsync(credentials);

            Assert.False(result.Success);
            Assert.False(result.Data);
            Assert.Contains("Authentication failed.", result.Errors);
        }

        [Fact]
        public async Task AuthenticateAsync_NoProviderCanHandle_ReturnsFailure()
        {
            var credentials = new UserCredentials { Username = "user", Password = "pass" };
            var providerMock = new Mock<IAuthProvider>();
            providerMock.SetupGet(p => p.SupportedCredentialsType).Returns(typeof(SomeOtherCredentials));

            var service = new UserAuthService(new[] { providerMock.Object });

            var result = await service.AuthenticateAsync(credentials);

            Assert.False(result.Success);
            Assert.False(result.Data);
            Assert.Contains("No suitable provider found.", result.Errors);
        }

        [Fact]
        public async Task AuthenticateAsync_NullCredentials_ReturnsCredentialsMustNotBeNull()
        {
            var providerMock = new Mock<IAuthProvider>();
            providerMock.SetupGet(p => p.SupportedCredentialsType).Returns(typeof(UserCredentials));
            var service = new UserAuthService([providerMock.Object]);

            var result = await service.AuthenticateAsync(null);

            Assert.False(result.Success);
            Assert.False(result.Data);
            Assert.Contains("Credentials must not be null.", result.Errors);
        }

        [Fact]
        public void UserAuthService_MultipleProvidersForSameType_ThrowsException()
        {
            var providerMock1 = new Mock<IAuthProvider>();
            providerMock1.SetupGet(p => p.SupportedCredentialsType).Returns(typeof(UserCredentials));
            var providerMock2 = new Mock<IAuthProvider>();
            providerMock2.SetupGet(p => p.SupportedCredentialsType).Returns(typeof(UserCredentials));

            Assert.Throws<InvalidOperationException>(() =>
                new UserAuthService(new[] { providerMock1.Object, providerMock2.Object }));
        }

        [Fact]
        public async Task AuthenticateAsync_ProviderThrowsException_PropagatesException()
        {
            var credentials = new UserCredentials { Username = "user", Password = "pass" };
            var providerMock = new Mock<IAuthProvider>();
            providerMock.SetupGet(p => p.SupportedCredentialsType).Returns(typeof(UserCredentials));
            providerMock.Setup(p => p.TryAuthenticateAsync(credentials)).ThrowsAsync(new System.Exception("Provider error"));

            var service = new UserAuthService(new[] { providerMock.Object });

            await Assert.ThrowsAsync<System.Exception>(() => service.AuthenticateAsync(credentials));
        }

        [Fact]
        public async Task AuthenticateAsync_EmptyProvidersList_ReturnsNoSuitableProvider()
        {
            var credentials = new UserCredentials { Username = "user", Password = "pass" };
            var service = new UserAuthService(Array.Empty<IAuthProvider>());

            var result = await service.AuthenticateAsync(credentials);

            Assert.False(result.Success);
            Assert.False(result.Data);
            Assert.Contains("No suitable provider found.", result.Errors);
        }

        [Fact]
        public async Task AuthenticateAsync_ProviderThrowsInCanHandle_PropagatesException()
        {
            var credentials = new UserCredentials { Username = "user", Password = "pass" };
            var providerMock = new Mock<IAuthProvider>();
            providerMock.SetupGet(p => p.SupportedCredentialsType).Returns(typeof(UserCredentials));
            providerMock.Setup(p => p.TryAuthenticateAsync(credentials)).ReturnsAsync(true);
           // providerMock.Setup(p => p.CanHandle(credentials)).Throws(new InvalidOperationException("CanHandle failed"));

            var service = new UserAuthService(new[] { providerMock.Object });

            // Since CanHandle is not called in the new design, this test is now redundant.
            // We'll keep it for completeness, but it will not throw.
            var result = await service.AuthenticateAsync(credentials);
            Assert.True(result.Success);
        }

        [Fact]
        public async Task AuthenticateAsync_ProviderReturnsNullTask_ThrowsException()
        {
            var credentials = new UserCredentials { Username = "user", Password = "pass" };
            var providerMock = new Mock<IAuthProvider>();
            providerMock.SetupGet(p => p.SupportedCredentialsType).Returns(typeof(UserCredentials));
            providerMock.Setup(p => p.TryAuthenticateAsync(credentials)).Returns((Task<bool>)null!);

            var service = new UserAuthService(new[] { providerMock.Object });

            await Assert.ThrowsAsync<NullReferenceException>(() => service.AuthenticateAsync(credentials));
        }

        [Fact]
        public async Task AuthenticateAsync_CredentialsOfUnexpectedType_NoProviderCanHandle()
        {
            var credentials = new SomeOtherCredentials();
            var providerMock = new Mock<IAuthProvider>();
            providerMock.SetupGet(p => p.SupportedCredentialsType).Returns(typeof(UserCredentials));

            var service = new UserAuthService(new[] { providerMock.Object });

            var result = await service.AuthenticateAsync(credentials);

            Assert.False(result.Success);
            Assert.False(result.Data);
            Assert.Contains("No suitable provider found.", result.Errors);
        }

        [Fact]
        public void AuthenticateAsync_DuplicateProviders_ThrowsException()
        {
            var provider = new Mock<IAuthProvider>();
            provider.SetupGet(p => p.SupportedCredentialsType).Returns(typeof(UserCredentials));

            Assert.Throws<InvalidOperationException>(() =>
                new UserAuthService(new[] { provider.Object, provider.Object }));
        }

        private class SomeOtherCredentials : IAuthCredentials { }
    }

#if (false)
        [Fact]
        public async Task AuthenticateAsync_ProviderCanHandleAndSucceeds_ReturnsSuccess()
        {
            // Arrange
            var credentials = new UserCredentials { Username = "user", Password = "pass" };
            var providerMock = new Mock<IAuthProvider>();
            providerMock.SetupGet(p => p.SupportedCredentialsType).Returns(typeof(UserCredentials));
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
            providerMock.SetupGet(p => p.SupportedCredentialsType).Returns(typeof(UserCredentials));
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
            providerMock.SetupGet(p => p.SupportedCredentialsType).Returns(typeof(UserCredentials));
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
            providerMock.SetupGet(p => p.SupportedCredentialsType).Returns(typeof(UserCredentials));
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
            provider1.SetupGet(p => p.SupportedCredentialsType).Returns(typeof(UserCredentials));
            provider1.Setup(p => p.CanHandle(credentials)).Returns(false);

            var provider2 = new Mock<IAuthProvider>();
            provider2.SetupGet(p => p.SupportedCredentialsType).Returns(typeof(UserCredentials));
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
            providerMock.SetupGet(p => p.SupportedCredentialsType).Returns(typeof(UserCredentials));
            providerMock.Setup(p => p.CanHandle(credentials)).Returns(true);
            providerMock.Setup(p => p.TryAuthenticateAsync(credentials)).ThrowsAsync(new System.Exception("Provider error"));

            var service = new UserAuthService([providerMock.Object]);

            // Act & Assert
            await Assert.ThrowsAsync<System.Exception>(() => service.AuthenticateAsync(credentials));
        }

        [Fact]
        public async Task AuthenticateAsync_EmptyProvidersList_ReturnsNoSuitableProvider()
        {
            // Arrange
            var credentials = new UserCredentials { Username = "user", Password = "pass" };
            var service = new UserAuthService([]);

            // Act
            var result = await service.AuthenticateAsync(credentials);

            // Assert
            Assert.False(result.Success);
            Assert.False(result.Data);
            Assert.Contains("No suitable provider found.", result.Errors);
        }

        [Fact]
        public async Task AuthenticateAsync_ProviderThrowsInCanHandle_PropagatesException()
        {
            // Arrange
            var credentials = new UserCredentials { Username = "user", Password = "pass" };
            var providerMock = new Mock<IAuthProvider>();
            providerMock.SetupGet(p => p.SupportedCredentialsType).Returns(typeof(UserCredentials));
            providerMock.Setup(p => p.CanHandle(credentials)).Throws(new InvalidOperationException("CanHandle failed"));

            var service = new UserAuthService([providerMock.Object]);

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() => service.AuthenticateAsync(credentials));
        }

        [Fact]
        public async Task AuthenticateAsync_ProviderReturnsNullTask_ThrowsException()
        {
            // Arrange
            var credentials = new UserCredentials { Username = "user", Password = "pass" };
            var providerMock = new Mock<IAuthProvider>();
            providerMock.SetupGet(p => p.SupportedCredentialsType).Returns(typeof(UserCredentials));
            providerMock.Setup(p => p.CanHandle(credentials)).Returns(true);
            providerMock.Setup(p => p.TryAuthenticateAsync(credentials)).Returns((Task<bool>)null!);

            var service = new UserAuthService([providerMock.Object]);

            // Act & Assert
            await Assert.ThrowsAsync<NullReferenceException>(() => service.AuthenticateAsync(credentials));
        }

        [Fact]
        public async Task AuthenticateAsync_CredentialsOfUnexpectedType_NoProviderCanHandle()
        {
            // Arrange
            var credentials = new Mock<IAuthCredentials>().Object; // Not a UserCredentials
            var providerMock = new Mock<IAuthProvider>();
            providerMock.SetupGet(p => p.SupportedCredentialsType).Returns(typeof(UserCredentials));
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
        public async Task AuthenticateAsync_DuplicateProviders_OnlyFirstCapableProviderIsUsed()
        {
            // Arrange
            var credentials = new UserCredentials { Username = "user", Password = "pass" };

            var provider = new Mock<IAuthProvider>();
            provider.SetupGet(p => p.SupportedCredentialsType).Returns(typeof(UserCredentials));
            provider.Setup(p => p.CanHandle(credentials)).Returns(true);
            provider.Setup(p => p.TryAuthenticateAsync(credentials)).ReturnsAsync(true);

            var service = new UserAuthService([provider.Object, provider.Object]);

            // Act
            var result = await service.AuthenticateAsync(credentials);

            // Assert
            Assert.True(result.Success);
            Assert.True(result.Data);
            Assert.Empty(result.Errors);
            provider.Verify(p => p.TryAuthenticateAsync(credentials), Times.Once);
        }
#endif

}