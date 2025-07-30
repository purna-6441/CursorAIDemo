using Microsoft.EntityFrameworkCore;
using POSRetailAPI.Models;

namespace POSRetailAPI.Data
{
    public class POSDbContext : DbContext
    {
        public POSDbContext(DbContextOptions<POSDbContext> options) : base(options)
        {
        }
        
        public DbSet<User> Users { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Sale> Sales { get; set; }
        public DbSet<SaleItem> SaleItems { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // User entity configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(e => e.Email).IsUnique();
                entity.HasIndex(e => e.Username).IsUnique();
                entity.Property(e => e.Role).HasConversion<string>();
            });
            
            // Product entity configuration
            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasIndex(e => e.SKU).IsUnique();
                entity.HasIndex(e => e.Barcode).IsUnique();
            });
            
            // Sale entity configuration
            modelBuilder.Entity<Sale>(entity =>
            {
                entity.HasOne(s => s.User)
                    .WithMany(u => u.Sales)
                    .HasForeignKey(s => s.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
            
            // SaleItem entity configuration
            modelBuilder.Entity<SaleItem>(entity =>
            {
                entity.HasOne(si => si.Sale)
                    .WithMany(s => s.SaleItems)
                    .HasForeignKey(si => si.SaleId)
                    .OnDelete(DeleteBehavior.Cascade);
                    
                entity.HasOne(si => si.Product)
                    .WithMany(p => p.SaleItems)
                    .HasForeignKey(si => si.ProductId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
            
            // Seed data
            SeedData(modelBuilder);
        }
        
        private void SeedData(ModelBuilder modelBuilder)
        {
            // Seed admin user
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    Username = "admin",
                    Email = "admin@posretail.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                    Role = UserRole.Admin,
                    CreatedAt = DateTime.UtcNow
                }
            );
            
            // Seed sample products
            modelBuilder.Entity<Product>().HasData(
                new Product
                {
                    Id = 1,
                    Name = "Shampoo",
                    SKU = "123456",
                    Category = "Health",
                    Price = 5.99m,
                    Quantity = 30,
                    Barcode = "1234567890123",
                    CreatedAt = DateTime.UtcNow
                },
                new Product
                {
                    Id = 2,
                    Name = "Coca Cola",
                    SKU = "789012",
                    Category = "Beverages",
                    Price = 1.50m,
                    Quantity = 100,
                    Barcode = "2345678901234",
                    CreatedAt = DateTime.UtcNow
                }
            );
        }
    }
}