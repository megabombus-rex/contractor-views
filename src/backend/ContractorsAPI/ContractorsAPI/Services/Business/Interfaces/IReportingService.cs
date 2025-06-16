using ContractorsAPI.Model.Common;
using QuestPDF.Infrastructure;

namespace ContractorsAPI.Services.Business.Interfaces
{
    public interface IReportingService
    {
        Task<Result<byte[]>> CreateReportAsync(int userId, CancellationToken ct);
    }
}
