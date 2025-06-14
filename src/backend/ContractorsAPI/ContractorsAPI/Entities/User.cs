using System.ComponentModel.DataAnnotations.Schema;

namespace ContractorsAPI.Entities
{
    public class User
    {
        // could be guid
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public required string EmailAddress { get; set; }
        public required string UserName { get; set; }
        public required string PasswordHash { get; set; }

        public ICollection<Contractor> Contractors { get; set; } = new List<Contractor>();
    }
}
