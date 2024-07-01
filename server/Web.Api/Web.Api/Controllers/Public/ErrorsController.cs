using Microsoft.AspNetCore.Mvc;
using Web.Api.Infrastructure.Controller;

namespace Web.Api.Controllers.Public
{
//    [Route("api/[controller]")]
    [ApiController]
    public class ErrorsController : PublicController
    {
        //[Route("access-denied")]
        [HttpGet("access-denied")]
        public IActionResult AccessDenied()
        {
            // Log the access denied event, if necessary
            //return StatusCode(403, "You do not have permission to access this resource.");

            return Ok();
        }
    }
}
