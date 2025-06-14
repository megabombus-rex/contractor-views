using ContractorsAPI.Database;
using ContractorsAPI.Entities;
using ContractorsAPI.Model.Common;
using ContractorsAPI.Model.Contractor;
using ContractorsAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace ContractorsAPI.Services
{
    public class ContractorService : IContractorService
    {
        private readonly ContractorsDbContext _dbContext;
        private readonly ILogger<ContractorService> _logger;

        public ContractorService(ContractorsDbContext dbContext, ILogger<ContractorService> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<Result<GetContractorDTO>> GetContractorByIdAsync(int contractorId, CancellationToken ct)
        {
            try
            {
                var contractor = await _dbContext.Contractors
                    .Include(c => c.AdditionalData)
                    .FirstOrDefaultAsync(c => c.Id == contractorId, ct);

                if (contractor == null)
                {
                    return Result<GetContractorDTO>.Failure("The contractor with given id could not be found.", StatusCodes.Status404NotFound);
                }

                return Result<GetContractorDTO>.Success(new GetContractorDTO(
                    contractorId,
                    contractor.Name,
                    contractor.Description,
                    contractor.UserId,
                    contractor.AdditionalData.Select(ad => new AdditionalDataDTO(
                        contractorId,
                        ad.FieldName,
                        ad.FieldType,
                        ad.FieldValue))));
            }
            catch (Exception ex)
            {
                _logger.LogError($"Exception thrown while getting contractor {contractorId}. Exception: {ex.Message}.", ex);
                return Result<GetContractorDTO>.Failure("The encountered issue while getting the contractor.", StatusCodes.Status500InternalServerError);
            }
        }

        public async Task<Result<PaginatedData<GetContractorDTO>>> GetContractorsAsync(int userId, string query, int page, int count, bool orderByAsc, CancellationToken ct)
        {
            try
            {
                IQueryable<Contractor> contractors = _dbContext.Contractors
                    .Where(c => c.UserId == userId);


                if (!string.IsNullOrEmpty(query))
                {
                    query = query.ToUpper();
                    contractors = contractors.Where(c => c.Name.ToUpper().Contains(query));
                }

                contractors = orderByAsc ? contractors.OrderBy(c => c.Name) : contractors.OrderByDescending(c => c.Name);

                var totalCount = await contractors.CountAsync(ct);

                var data = contractors
                    .Include(c => c.AdditionalData)
                    .Skip((page - 1) * count)
                    .Take(count)
                    .Select(c => new GetContractorDTO(
                        c.Id,
                        c.Name,
                        c.Description,
                        c.UserId,
                        c.AdditionalData.Select(ad => new AdditionalDataDTO(
                            ad.ContractorId,
                            ad.FieldName,
                            ad.FieldType,
                            ad.FieldValue))));

                var paginatedData = new PaginatedData<GetContractorDTO>(data, page, count, totalCount, (int)Math.Ceiling((double)totalCount / count));

                return Result<PaginatedData<GetContractorDTO>>.Success(paginatedData);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Exception thrown while getting contractors. Exception: {ex.Message}.", ex);
                return Result<PaginatedData<GetContractorDTO>>.Failure("The encountered issue while getting contractors.", StatusCodes.Status500InternalServerError);
            }
        }
    }
}
