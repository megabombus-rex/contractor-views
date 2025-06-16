using ContractorsAPI.Model.Common;
using ContractorsAPI.Model.User;

namespace ContractorsAPI.Services.Authorization.Interfaces
{
    public interface IAuthenticationService
    {
        Task<Result<string>> AuthenticateUserAsync(AuthenticateUserDTO userDTO, CancellationToken ct);
        Task<Result<string>> RegisterUserAsync(RegisterUserDTO userDTO, CancellationToken ct);
        Task<Result> RemoveUserAsync(int userId, CancellationToken ct);
    }
}
