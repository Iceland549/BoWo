namespace AuthMicroservice.Application.DTOs
{
    /// <summary>
    /// Standardized API response wrapper for all endpoints.
    /// </summary>
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public T? Data { get; set; }
        public string? Error { get; set; }

        public static ApiResponse<T> Ok(T data) => new()
        {
            Success = true,
            Data = data,
            Error = null
        };

        public static ApiResponse<T> Fail(string error) => new()
        {
            Success = false,
            Data = default,
            Error = error
        };
    }

    // Version sans données (pour logout, etc.)
    public class ApiResponse : ApiResponse<object>
    {
        public static ApiResponse Ok() => new()
        {
            Success = true,
            Data = null,
            Error = null
        };

        public new static ApiResponse Fail(string error) => new()
        {
            Success = false,
            Data = null,
            Error = error
        };
    }
}