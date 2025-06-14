namespace ContractorsAPI.Model.Contractor
{
    public record GetAdditionalDataDTO(int ContractorId, string FieldName, string FieldType, string FieldValue);
}
