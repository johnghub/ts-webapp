using Microsoft.AspNetCore.Authorization;

namespace Web.Api.Infrastructure.Controller
{
    [AllowAnonymous]
    public class PublicController : ModelStateController
    {
        // All actions here allow anonymous access
    }
}
