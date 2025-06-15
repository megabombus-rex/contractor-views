using ContractorsAPI.Database;
using ContractorsAPI.Entities;
using ContractorsAPI.Model.Common;
using ContractorsAPI.Model.Contractor;
using ContractorsAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

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
                    contractor.AdditionalData.Select(ad => new GetAdditionalDataDTO(
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

        public async Task<Result<PaginatedData<GetContractorDTO>>> GetContractorsAsync(int userId, string? query, int page, int count, bool orderByAsc, CancellationToken ct)
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
                        c.AdditionalData.Select(ad => new GetAdditionalDataDTO(
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


        public async Task<Result<int>> CreateNewContractorAsync(AddUpdateContractorDTO contractorDTO, CancellationToken ct)
        {
            // all of validation could be moved to fluent validators
            if (string.IsNullOrEmpty(contractorDTO.Name))
            {
                return Result<int>.Failure("The contractor name cannot be empty.", StatusCodes.Status422UnprocessableEntity);
            }

            var invalidProperties = contractorDTO.AdditionalData
                .GroupBy(ad => ad.FieldName.ToLower())
                .Where(g =>
                    g.Count() > 1
                    || g.Any(ad => !CheckIfFieldIsCorrect(ad.FieldType, ad.FieldValue)))
                .Select(g => g.Key)
                .ToList();

            if (invalidProperties.Count > 0)
            {
                var message = $"Invalid fields: {string.Join(',', invalidProperties)}. Check for duplicates and if the values are correct.";
                return Result<int>.Failure(message, StatusCodes.Status422UnprocessableEntity);
            }

            if (!await _dbContext.Users.AnyAsync(u => u.Id == contractorDTO.UserId, ct))
            {
                return Result<int>.Failure($"No user with given id was found.", StatusCodes.Status404NotFound);
            }

            using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);

            try
            {
                var contractor = new Contractor()
                {
                    UserId = contractorDTO.UserId,
                    Name = contractorDTO.Name,
                    Description = contractorDTO.Description ?? string.Empty,
                };

                _dbContext.Contractors.Add(contractor);
                await _dbContext.SaveChangesAsync(ct);

                var additionalData = contractorDTO.AdditionalData
                    .Select(ad => new ContractorAdditionalData()
                    {
                        ContractorId = contractor.Id,
                        FieldName = ad.FieldName,
                        FieldType = ad.FieldType,
                        FieldValue = ad.FieldValue
                    }).ToList();

                _dbContext.ContractorsAdditionalData.AddRange(additionalData);

                await _dbContext.SaveChangesAsync(ct);
                await transaction.CommitAsync(ct);

                return Result<int>.Success(contractor.Id);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(ct);
                _logger.LogError($"Exception thrown while adding a contractor. Exception: {ex.Message}.", ex);
                return Result<int>.Failure("The encountered issue while adding a contractor.", StatusCodes.Status500InternalServerError);
            }            
        }

        public async Task<Result> UpdateContractorAsync(int userId, int contractorId, AddUpdateContractorDTO contractorDTO, CancellationToken ct)
        {
            var invalidProperties = contractorDTO.AdditionalData
                .GroupBy(ad => ad.FieldName.ToLower())
                .Where(g =>
                    g.Count() > 1
                    || g.Any(ad => !CheckIfFieldIsCorrect(ad.FieldType, ad.FieldValue)))
                .Select(g => g.Key)
                .ToList();

            if (invalidProperties.Count > 0)
            {
                var message = $"Invalid fields: {string.Join(',', invalidProperties)}. Check for duplicates and if the values are correct.";
                return Result.Failure(message, StatusCodes.Status422UnprocessableEntity);
            }

            if (!await _dbContext.Users.AnyAsync(u => u.Id == contractorDTO.UserId, ct))
            {
                _logger.LogError($"No user with id {userId} was found.");
                return Result.Failure("No user with given id was found.", StatusCodes.Status404NotFound);
            }

            var contractorToUpdate = await _dbContext.Contractors
                .Include(c => c.AdditionalData)
                .FirstOrDefaultAsync(c => c.Id == contractorId && c.UserId == userId, ct);

            if (contractorToUpdate == null)
            {
                _logger.LogError($"No contractor with id {contractorId} was found for a user with id {userId}.");
                return Result.Failure("The contractor with given id could not be found for a user with given id.", StatusCodes.Status404NotFound);
            }

            using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);

            try
            {
                contractorToUpdate.Name = contractorDTO.Name;
                contractorToUpdate.Description = contractorDTO.Description ?? string.Empty;

                var newData = contractorDTO.AdditionalData.Select(ad => new ContractorAdditionalData()
                {
                    ContractorId = contractorId,
                    FieldName = ad.FieldName,
                    FieldType = ad.FieldType,
                    FieldValue = ad.FieldValue
                }).ToList();

                _dbContext.ContractorsAdditionalData.RemoveRange(contractorToUpdate.AdditionalData);
                _dbContext.ContractorsAdditionalData.AddRange(newData);
                _dbContext.Contractors.Update(contractorToUpdate);

                await _dbContext.SaveChangesAsync(ct);
                await transaction.CommitAsync(ct);
                return Result.Success();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(ct);
                _logger.LogError($"Exception thrown while adding a contractor. Exception: {ex.Message}.", ex);
                return Result.Failure("The encountered issue while updating a contractor.", StatusCodes.Status500InternalServerError);
            }
        }

        public async Task<Result> DeleteContractorAsync(int userId, int contractorId, CancellationToken ct)
        {
            var contractorDataToRemove = await _dbContext.Contractors
                .Include(c => c.AdditionalData)
                .FirstOrDefaultAsync(c => c.Id == contractorId && c.UserId == userId, ct);

            if (contractorDataToRemove == null)
            {
                return Result.Failure($"No contractor with given id was found for the user with given id.", StatusCodes.Status404NotFound);
            }

            using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);

            try
            {
                _dbContext.Contractors.Remove(contractorDataToRemove);

                await _dbContext.SaveChangesAsync(ct);
                await transaction.CommitAsync(ct);
                return Result.Success();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(ct);
                _logger.LogError($"Exception thrown while adding a contractor. Exception: {ex.Message}.", ex);
                return Result.Failure("The encountered issue while updating a contractor.", StatusCodes.Status500InternalServerError);
            }
        }
        
        private bool CheckIfFieldIsCorrect(string type, string value)
        {
            switch (type)
            {
                case ("string"):
                    // string can be more or less anything
                    return true;
                case ("int"):
                    return int.TryParse(value, out _);
                case ("double"):
                    return double.TryParse(value, out _);
                case ("char"):
                    return value.Length == 1;
                case ("bool"):
                    return bool.TryParse(value.ToLower(), out _);
                case ("datetime"):
                    return DateTime.TryParse(value, out _);
                default: 
                    return false;
            }
        }
    }
}
