namespace ContractorsAPI.Model.Contractor
{
    public record GetContractorDTO(int Id, string Name, string Description, int UserId, IEnumerable<AdditionalDataDTO> AdditionalData);
}
