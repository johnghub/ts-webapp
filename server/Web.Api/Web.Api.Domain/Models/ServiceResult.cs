
namespace Web.Api.Domain.Models
{
    public class ServiceResult<T>
    {
        public bool Success { get; set; }
        public T Data { get; set; }
        public List<string> Errors { get; set; } = [];

        // Factory methods with consistent naming
        public static ServiceResult<T> SuccessResult(T data) => new() { Success = true, Data = data };
        public static ServiceResult<T> FailureResult(List<string> errors) => new() { Success = false, Errors = errors };
        public static ServiceResult<T> FailureResult(string error) => new() { Success = false, Errors = [error] };
 
    }

}
