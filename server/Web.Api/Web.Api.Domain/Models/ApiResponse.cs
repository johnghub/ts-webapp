
namespace Web.Api.Domain.Models
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public T? Data { get; set; }
        public List<string>? Errors { get; set; }

        public static ApiResponse<T> SuccessResponse(T data) => new() { Success = true, Data = data };
        public static ApiResponse<T> FailureResponse(List<string> errors) => new() { Success = false, Errors = errors };
    }

}
