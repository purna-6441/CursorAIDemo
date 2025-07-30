using System.ComponentModel.DataAnnotations;

namespace POSRetailAPI.DTOs
{
    public class CreateSaleRequest
    {
        [Required]
        public List<SaleItemRequest> Items { get; set; } = new List<SaleItemRequest>();
        
        [Required]
        public string PaymentMethod { get; set; } = string.Empty;
        
        public decimal DiscountAmount { get; set; } = 0;
        
        [Required]
        public decimal Total { get; set; }
    }
    
    public class SaleItemRequest
    {
        [Required]
        public int ProductId { get; set; }
        
        [Required]
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
        
        public decimal DiscountAmount { get; set; } = 0;
    }
    
    public class SaleResponse
    {
        public int SaleId { get; set; }
        public string ReceiptPdf { get; set; } = string.Empty;
        public decimal Total { get; set; }
        public DateTime CreatedAt { get; set; }
    }
    
    public class SaleDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public decimal SubTotal { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal Total { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public List<SaleItemDto> Items { get; set; } = new List<SaleItemDto>();
    }
    
    public class SaleItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string ProductSKU { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal LineTotal { get; set; }
    }
    
    public class DailySalesReport
    {
        public DateTime Date { get; set; }
        public decimal TotalSales { get; set; }
        public int TransactionCount { get; set; }
        public List<SaleDto> Sales { get; set; } = new List<SaleDto>();
    }
    
    public class TopSellingProductReport
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public int TotalQuantitySold { get; set; }
        public decimal TotalRevenue { get; set; }
    }
}