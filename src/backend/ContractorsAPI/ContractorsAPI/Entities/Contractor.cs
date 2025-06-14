using System.ComponentModel.DataAnnotations.Schema;

namespace ContractorsAPI.Entities
{
    public class Contractor
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public required string Name { get; set; }
        public string Description { get; set; } = string.Empty;

        public required int UserId { get; set; }

        // if the contractors were common for multiple users
        //public ICollection<User> ContractorUsers { get; set; } = new List<User>();
        public virtual User User { get; set; }
        public virtual ICollection<ContractorAdditionalData> AdditionalData { get; set; } = new List<ContractorAdditionalData>();

    }
}
