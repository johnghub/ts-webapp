
namespace Web.Api.Domain.Models
{
    public class ServiceResult<T>
    {
        public bool Success { get; set; }
        public T Data { get; set; }
        public List<string> Errors { get; set; } = [];

        public static ServiceResult<T> SuccessResult(T data) => new() { Success = true, Data = data };
        public static ServiceResult<T> Failure(List<string> errors) => new () { Success = false, Errors = errors };
    }

}
