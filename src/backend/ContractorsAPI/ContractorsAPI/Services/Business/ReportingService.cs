using ContractorsAPI.Database;
using ContractorsAPI.Model.Common;
using ContractorsAPI.Model.Contractor;
using ContractorsAPI.Model.Reports;
using ContractorsAPI.Model.User;
using ContractorsAPI.Reports.ContractorsReport;
using ContractorsAPI.Services.Business.Interfaces;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;

namespace ContractorsAPI.Services.Business
{
    public class ReportingService : IReportingService
    {
        private readonly ContractorsDbContext _dbContext;
        private readonly ILogger<ReportingService> _logger;

        public ReportingService(ContractorsDbContext dbContext, ILogger<ReportingService> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<Result<byte[]>> CreateReportAsync(int userId, CancellationToken ct)
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId, ct);

            if (user == null)
            {
                return Result<byte[]>.Failure("User not found.", StatusCodes.Status404NotFound);
            }

            var contractors = await _dbContext.Contractors
                .Include(c => c.AdditionalData)
                .Where(c => c.UserId == userId)
                .Select(c => new GetContractorDTO(
                    c.Id,
                    c.Name,
                    c.Description,
                    userId,
                    c.AdditionalData.Select(ad => new GetAdditionalDataDTO(
                        ad.ContractorId,
                        ad.FieldName,
                        ad.FieldType,
                        ad.FieldValue))))
                .ToListAsync(ct);

            var data = new ContractorsReportData(new GetUserDTO(userId, user.UserName, user.EmailAddress), contractors, DateTime.UtcNow);

            var document = new ContractorsReportDocument(data);

            return Result<byte[]>.Success(document.GeneratePdf());
        }
    }
}
