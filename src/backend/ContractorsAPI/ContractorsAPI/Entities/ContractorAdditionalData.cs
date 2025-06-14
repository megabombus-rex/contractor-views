namespace ContractorsAPI.Entities
{
    public class ContractorAdditionalData
    {
        public required int ContractorId { get; set; }

        // if the contractors were common for multiple users
        //public required int UserId { get; set; }
        public required string FieldName { get; set; }

        // int, decimal, varchar etc.
        public required string FieldType { get; set; }
        public required string FieldValue { get; set; }
    }
}
