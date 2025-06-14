using ContractorsAPI.Entities;
using Microsoft.EntityFrameworkCore;

namespace ContractorsAPI.Database
{
    public class ContractorsDbContext : DbContext
    {
        public virtual DbSet<User> Users { get; set; }
        public virtual DbSet<Contractor> Contractors { get; set; }
        public virtual DbSet<ContractorAdditionalData> ContractorsAdditionalData { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
                .HasKey(x => x.Id);

            // if the contractors were common for multiple users
            //modelBuilder.Entity<User>()
            //    .HasMany(e => e.Contractors)
            //    .WithMany(c => c.ContractorUsers);

            modelBuilder.Entity<Contractor>()
                .HasKey(c => c.Id);

            // each contractor should have only one field with a given name
            modelBuilder.Entity<ContractorAdditionalData>()
                .HasKey(cad => new { cad.ContractorId, cad.FieldName });


            // if the contractors were common for multiple users
            //modelBuilder.Entity<ContractorAdditionalData>()
            //    .HasKey(cad => new { cad.ContractorId, cad.UserId, cad.FieldName });

        }
    }
}
