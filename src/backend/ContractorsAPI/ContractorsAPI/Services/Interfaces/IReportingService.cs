using ContractorsAPI.Model.Common;
using QuestPDF.Infrastructure;

namespace ContractorsAPI.Services.Interfaces
{
    public interface IReportingService
    {
        Task<Result<byte[]>> CreateReportAsync(int userId, CancellationToken ct);
    }
}
