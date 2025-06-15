using ContractorsAPI.Model.Contractor;
using ContractorsAPI.Model.User;

namespace ContractorsAPI.Model.Reports
{
    public record ContractorsReportData(GetUserDTO User, IEnumerable<GetContractorDTO> Contractors, DateTime CurrentTime);
}
