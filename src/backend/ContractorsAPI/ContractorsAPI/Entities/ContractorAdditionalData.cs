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

        public virtual Contractor Contractor { get; set; }

        // case insensitive comparison
        public override bool Equals(object obj)
        {
            if (obj is ContractorAdditionalData other)
            {
                return FieldName == other.FieldName &&
                       string.Equals(FieldName, other.FieldName, StringComparison.OrdinalIgnoreCase);
            }
            return false;
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(FieldName, FieldName?.ToUpperInvariant());
        }
    }
}
