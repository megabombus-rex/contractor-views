using ContractorsAPI.Model.Common;
using ContractorsAPI.Model.Contractor;

namespace ContractorsAPI.Services.Interfaces
{
    public interface IContractorService
    {
        Task<Result<PaginatedData<GetContractorDTO>>> GetContractorsAsync(int userId, string query, int page, int count, bool orderByAsc, CancellationToken ct);
        Task<Result<GetContractorDTO>> GetContractorByIdAsync(int contractorId, CancellationToken ct);

        Result<int> CreateNewContractor();
    }
}
