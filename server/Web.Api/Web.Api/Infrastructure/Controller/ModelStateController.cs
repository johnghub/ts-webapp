using Microsoft.AspNetCore.Mvc;
using Web.Api.Domain.Models;

namespace Web.Api.Infrastructure.Controller
{
    public abstract class ModelStateController : ControllerBase
    {
        /// <summary>
        /// Validates the ModelState of the current request. This method checks if the ModelState is valid,
        /// and if it is not, it creates and returns a BadRequestObjectResult containing all validation errors.
        /// If the ModelState is valid, it returns null.
        /// 
        /// Returning null here is a performance optimization to avoid creating unnecessary objects in scenarios 
        /// where no validation errors are present. This approach helps minimize the allocation and disposal of 
        /// unnecessary ValidationResult objects, which can improve performance, especially in high-load scenarios.
        /// The use of null to indicate "no errors" follows a pattern where the absence of an object (null)
        /// naturally signifies the absence of errors, thus no further action is required.
        /// </summary>
        /// <returns>
        /// BadRequestObjectResult containing validation errors if ModelState is invalid; otherwise, null.
        /// </returns>
        protected IActionResult ValidateModelState()
        {
            if (!ModelState.IsValid)
            {
                //var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                //return BadRequest(new { Errors = errors });
                return BadRequest(ModelState);
            }
            return null;
        }

        /// <summary>
        /// Validates the result from a service call. This method checks if the result indicates success.
        /// If it does not, it adds the errors to the ModelState and returns a BadRequestObjectResult
        /// containing all these errors. If the service result indicates success, it returns null.
        ///
        /// Returning null for successful service results is a performance optimization. It avoids the creation
        /// of unnecessary ActionResult objects when there are no errors to report. This approach minimizes
        /// memory allocation and garbage collection overhead, which is beneficial in high-performance environments
        /// where minimizing latency and resource usage is critical. The use of null to indicate "no errors"
        /// simplifies further processing in controller actions.
        /// </summary>
        /// <typeparam name="T">The type of data encapsulated in the service result.</typeparam>
        /// <param name="result">The service result object containing success status and potential errors.</param>
        /// <returns>
        /// BadRequestObjectResult containing errors if the service result is unsuccessful; otherwise, null.
        /// </returns>
        protected IActionResult HandleServiceResult<T>(ServiceResult<T> result)
        {
            if (!result.Success)
            {
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError("", error);
                }
                return BadRequest(ModelState);
            }
            return null;
        }
    }
}
