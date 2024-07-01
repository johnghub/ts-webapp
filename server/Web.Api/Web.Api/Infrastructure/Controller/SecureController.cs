using Microsoft.AspNetCore.Authorization;

namespace Web.Api.Infrastructure.Controller
{
    [Authorize]
    public class SecureController : ModelStateController
    {
        // All actions here require authentication
    }
}
