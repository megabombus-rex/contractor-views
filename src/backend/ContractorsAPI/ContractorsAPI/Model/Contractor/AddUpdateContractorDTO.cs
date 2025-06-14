namespace ContractorsAPI.Model.Contractor
{
    public record AddUpdateContractorDTO(string Name, string? Description, int UserId, IEnumerable<AdditionalDataDTO> AdditionalData);
}
