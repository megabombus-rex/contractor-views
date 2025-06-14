using ContractorsAPI.Entities;
using Microsoft.EntityFrameworkCore;

namespace ContractorsAPI.Database
{
    public class ContractorsDbContext : DbContext
    {
        public ContractorsDbContext()
        {
            
        }

        public ContractorsDbContext(DbContextOptions options) : base(options)
        {
            
        }

        public virtual DbSet<User> Users { get; set; }
        public virtual DbSet<Contractor> Contractors { get; set; }
        public virtual DbSet<ContractorAdditionalData> ContractorsAdditionalData { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
                .HasKey(x => x.Id);

            modelBuilder.Entity<User>()
                .HasMany(e => e.Contractors)
                .WithOne(c => c.User)
                .HasForeignKey(c => c.UserId);

            // if the contractors were common for multiple users
            //modelBuilder.Entity<User>()
            //    .HasMany(e => e.Contractors)
            //    .WithMany(c => c.ContractorUsers);

            modelBuilder.Entity<Contractor>()
                .HasKey(c => c.Id);

            modelBuilder.Entity<Contractor>()
                .HasMany(c => c.AdditionalData)
                .WithOne(cad => cad.Contractor)
                .HasForeignKey(cad => cad.ContractorId);

            modelBuilder.Entity<Contractor>()
                .Property(c => c.Description)
                .HasMaxLength(200);

            modelBuilder.Entity<Contractor>()
                .Property(c => c.Name)
                .HasMaxLength(100);

            // each contractor should have only one field with a given name
            // the case insensitivity will be handled in application BE and FE
            modelBuilder.Entity<ContractorAdditionalData>()
                .HasKey(cad => new { cad.ContractorId, cad.FieldName });

            modelBuilder.Entity<ContractorAdditionalData>()
                .Property(cad => cad.FieldName)
                .HasMaxLength(100);

            modelBuilder.Entity<ContractorAdditionalData>()
                .Property(cad => cad.FieldType)
                .HasMaxLength(50);

            modelBuilder.Entity<ContractorAdditionalData>()
                .Property(cad => cad.FieldValue)
                .HasMaxLength(1000);

            // if the contractors were common for multiple users
            //modelBuilder.Entity<ContractorAdditionalData>()
            //    .HasKey(cad => new { cad.ContractorId, cad.UserId, cad.FieldName });

        }
    }
}
