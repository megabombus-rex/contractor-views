namespace ContractorsAPI.Model.Contractor
{
    public record AddUpdateContractorDTO(int Id, string Name, string? Description, int UserId, IEnumerable<AdditionalDataDTO> AdditionalData);
}
