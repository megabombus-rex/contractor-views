namespace ContractorsAPI.Model.Common
{

    public class Result<T>
    {
        public bool IsSuccess { get; }
        public T? Value { get; }
        public string? ErrorMessage { get; }
        public int? ErrorCode { get; }

        private Result(bool isSuccess, T? value, string? errorMessage, int? errorCode = null)
        {
            IsSuccess = isSuccess;
            Value = value;
            ErrorMessage = errorMessage;
            ErrorCode = errorCode;
        }

        public static Result<T> Success(T value) => new(true, value, null);
        public static Result<T> Failure(string errorMessage, int? errorCode = null) => new(false, default, errorMessage, errorCode);
    }

    // Non-generic version for operations that don't return data
    public class Result
    {
        public bool IsSuccess { get; }
        public string? ErrorMessage { get; }
        public int? ErrorCode { get; }

        private Result(bool isSuccess, string? errorMessage, int? errorCode = null)
        {
            IsSuccess = isSuccess;
            ErrorMessage = errorMessage;
            ErrorCode = errorCode;
        }

        public static Result Success() => new(true, null);
        public static Result Failure(string errorMessage, int? errorCode = null) => new(false, errorMessage, errorCode);
    }
}
