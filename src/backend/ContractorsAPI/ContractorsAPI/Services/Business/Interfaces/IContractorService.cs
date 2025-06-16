using ContractorsAPI.Model.Common;
using ContractorsAPI.Model.Contractor;

namespace ContractorsAPI.Services.Business.Interfaces
{
    public interface IContractorService
    {
        Task<Result<PaginatedData<GetContractorDTO>>> GetContractorsAsync(int userId, string? query, int page, int count, bool orderByAsc, CancellationToken ct);
        Task<Result<GetContractorDTO>> GetContractorByIdAsync(int contractorId, CancellationToken ct);

        Task<Result<int>> CreateNewContractorAsync(AddUpdateContractorDTO contractorDTO, CancellationToken ct);

        Task<Result> UpdateContractorAsync(int userId, int contractorId, AddUpdateContractorDTO contractorDTO, CancellationToken ct);
        Task<Result> DeleteContractorAsync(int userId, int contractorId, CancellationToken ct);
    }
}
