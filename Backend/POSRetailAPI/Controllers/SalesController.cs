using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using POSRetailAPI.Data;
using POSRetailAPI.DTOs;
using POSRetailAPI.Models;
using POSRetailAPI.Services;
using System.Security.Claims;

namespace POSRetailAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SalesController : ControllerBase
    {
        private readonly POSDbContext _context;
        private readonly IReceiptService _receiptService;

        public SalesController(POSDbContext context, IReceiptService receiptService)
        {
            _context = context;
            _receiptService = receiptService;
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Cashier")]
        public async Task<ActionResult<SaleResponse>> CreateSale(CreateSaleRequest request)
        {
            var userIdClaim = User.FindFirst("UserId");
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized();
            }

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Validate products and calculate totals
                decimal subTotal = 0;
                var saleItems = new List<SaleItem>();

                foreach (var item in request.Items)
                {
                    var product = await _context.Products.FindAsync(item.ProductId);
                    if (product == null || !product.IsActive)
                    {
                        return BadRequest(new { message = $"Product with ID {item.ProductId} not found" });
                    }

                    if (product.Quantity < item.Quantity)
                    {
                        return BadRequest(new { message = $"Insufficient stock for {product.Name}" });
                    }

                    var lineTotal = (product.Price * item.Quantity) - item.DiscountAmount;
                    subTotal += lineTotal;

                    saleItems.Add(new SaleItem
                    {
                        ProductId = item.ProductId,
                        Quantity = item.Quantity,
                        UnitPrice = product.Price,
                        DiscountAmount = item.DiscountAmount,
                        LineTotal = lineTotal
                    });

                    // Update product stock
                    product.Quantity -= item.Quantity;
                    product.UpdatedAt = DateTime.UtcNow;
                }

                // Create sale
                var sale = new Sale
                {
                    UserId = userId,
                    SubTotal = subTotal,
                    DiscountAmount = request.DiscountAmount,
                    Total = subTotal - request.DiscountAmount,
                    PaymentMethod = request.PaymentMethod,
                    CreatedAt = DateTime.UtcNow,
                    SaleItems = saleItems
                };

                _context.Sales.Add(sale);
                await _context.SaveChangesAsync();

                // Generate receipt PDF
                var receiptPdf = await _receiptService.GenerateReceiptPdfAsync(sale);
                sale.ReceiptPdf = receiptPdf;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                var response = new SaleResponse
                {
                    SaleId = sale.Id,
                    ReceiptPdf = receiptPdf,
                    Total = sale.Total,
                    CreatedAt = sale.CreatedAt
                };

                return Ok(response);
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SaleDto>>> GetSales(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            var query = _context.Sales.Include(s => s.User).AsQueryable();

            if (startDate.HasValue)
            {
                query = query.Where(s => s.CreatedAt >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(s => s.CreatedAt <= endDate.Value);
            }

            var totalCount = await query.CountAsync();
            var sales = await query
                .OrderByDescending(s => s.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(s => new SaleDto
                {
                    Id = s.Id,
                    UserId = s.UserId,
                    UserName = s.User.Username,
                    SubTotal = s.SubTotal,
                    DiscountAmount = s.DiscountAmount,
                    Total = s.Total,
                    PaymentMethod = s.PaymentMethod,
                    CreatedAt = s.CreatedAt
                })
                .ToListAsync();

            Response.Headers.Add("X-Total-Count", totalCount.ToString());
            Response.Headers.Add("X-Page", page.ToString());
            Response.Headers.Add("X-Page-Size", pageSize.ToString());

            return Ok(sales);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SaleDto>> GetSale(int id)
        {
            var sale = await _context.Sales
                .Include(s => s.User)
                .Include(s => s.SaleItems)
                    .ThenInclude(si => si.Product)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (sale == null)
            {
                return NotFound();
            }

            var saleDto = new SaleDto
            {
                Id = sale.Id,
                UserId = sale.UserId,
                UserName = sale.User.Username,
                SubTotal = sale.SubTotal,
                DiscountAmount = sale.DiscountAmount,
                Total = sale.Total,
                PaymentMethod = sale.PaymentMethod,
                CreatedAt = sale.CreatedAt,
                Items = sale.SaleItems.Select(si => new SaleItemDto
                {
                    Id = si.Id,
                    ProductId = si.ProductId,
                    ProductName = si.Product.Name,
                    ProductSKU = si.Product.SKU,
                    Quantity = si.Quantity,
                    UnitPrice = si.UnitPrice,
                    DiscountAmount = si.DiscountAmount,
                    LineTotal = si.LineTotal
                }).ToList()
            };

            return Ok(saleDto);
        }

        [HttpGet("{id}/receipt")]
        public async Task<ActionResult> GetReceipt(int id)
        {
            var sale = await _context.Sales.FindAsync(id);

            if (sale == null)
            {
                return NotFound();
            }

            if (string.IsNullOrEmpty(sale.ReceiptPdf))
            {
                return NotFound(new { message = "Receipt not found" });
            }

            var pdfBytes = Convert.FromBase64String(sale.ReceiptPdf);
            return File(pdfBytes, "application/pdf", $"receipt_{sale.Id}.pdf");
        }

        [HttpGet("reports/daily")]
        public async Task<ActionResult<DailySalesReport>> GetDailySalesReport([FromQuery] DateTime? date = null)
        {
            var targetDate = date ?? DateTime.Today;
            var startDate = targetDate.Date;
            var endDate = startDate.AddDays(1);

            var salesQuery = _context.Sales
                .Include(s => s.User)
                .Where(s => s.CreatedAt >= startDate && s.CreatedAt < endDate);

            var totalSales = await salesQuery.SumAsync(s => s.Total);
            var transactionCount = await salesQuery.CountAsync();

            var sales = await salesQuery
                .OrderByDescending(s => s.CreatedAt)
                .Select(s => new SaleDto
                {
                    Id = s.Id,
                    UserId = s.UserId,
                    UserName = s.User.Username,
                    SubTotal = s.SubTotal,
                    DiscountAmount = s.DiscountAmount,
                    Total = s.Total,
                    PaymentMethod = s.PaymentMethod,
                    CreatedAt = s.CreatedAt
                })
                .ToListAsync();

            var report = new DailySalesReport
            {
                Date = targetDate,
                TotalSales = totalSales,
                TransactionCount = transactionCount,
                Sales = sales
            };

            return Ok(report);
        }

        [HttpGet("reports/top-selling")]
        public async Task<ActionResult<IEnumerable<TopSellingProductReport>>> GetTopSellingProducts(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] int limit = 10)
        {
            var query = _context.SaleItems
                .Include(si => si.Product)
                .Include(si => si.Sale)
                .AsQueryable();

            if (startDate.HasValue)
            {
                query = query.Where(si => si.Sale.CreatedAt >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(si => si.Sale.CreatedAt <= endDate.Value);
            }

            var topProducts = await query
                .GroupBy(si => new { si.ProductId, si.Product.Name, si.Product.SKU })
                .Select(g => new TopSellingProductReport
                {
                    ProductId = g.Key.ProductId,
                    ProductName = g.Key.Name,
                    SKU = g.Key.SKU,
                    TotalQuantitySold = g.Sum(si => si.Quantity),
                    TotalRevenue = g.Sum(si => si.LineTotal)
                })
                .OrderByDescending(p => p.TotalQuantitySold)
                .Take(limit)
                .ToListAsync();

            return Ok(topProducts);
        }
    }
}