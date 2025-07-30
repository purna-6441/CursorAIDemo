using System.ComponentModel.DataAnnotations;

namespace POSRetailAPI.DTOs
{
    public class ProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public string? Description { get; set; }
        public string? Barcode { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }
    
    public class CreateProductRequest
    {
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [StringLength(50)]
        public string SKU { get; set; } = string.Empty;
        
        [Required]
        [StringLength(100)]
        public string Category { get; set; } = string.Empty;
        
        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Price { get; set; }
        
        [Required]
        [Range(0, int.MaxValue)]
        public int Quantity { get; set; }
        
        public string? Description { get; set; }
        
        public string? Barcode { get; set; }
    }
    
    public class UpdateProductRequest
    {
        [StringLength(200)]
        public string? Name { get; set; }
        
        [StringLength(100)]
        public string? Category { get; set; }
        
        [Range(0.01, double.MaxValue)]
        public decimal? Price { get; set; }
        
        [Range(0, int.MaxValue)]
        public int? Quantity { get; set; }
        
        public string? Description { get; set; }
        
        public string? Barcode { get; set; }
        
        public bool? IsActive { get; set; }
    }
    
    public class StockAdjustmentRequest
    {
        [Required]
        public int ProductId { get; set; }
        
        [Required]
        public int QuantityChange { get; set; } // Can be negative for reduction
        
        public string? Reason { get; set; }
    }
}