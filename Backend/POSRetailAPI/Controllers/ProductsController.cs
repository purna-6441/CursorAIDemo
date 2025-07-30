using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using POSRetailAPI.Data;
using POSRetailAPI.DTOs;
using POSRetailAPI.Models;

namespace POSRetailAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProductsController : ControllerBase
    {
        private readonly POSDbContext _context;

        public ProductsController(POSDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts(
            [FromQuery] string? search = null,
            [FromQuery] string? category = null,
            [FromQuery] bool? lowStock = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            var query = _context.Products.Where(p => p.IsActive);

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(p => p.Name.Contains(search) || 
                                   p.SKU.Contains(search) || 
                                   p.Description!.Contains(search));
            }

            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(p => p.Category == category);
            }

            if (lowStock.HasValue && lowStock.Value)
            {
                query = query.Where(p => p.Quantity <= 10); // Low stock threshold
            }

            var totalCount = await query.CountAsync();
            var products = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new ProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    SKU = p.SKU,
                    Category = p.Category,
                    Price = p.Price,
                    Quantity = p.Quantity,
                    Description = p.Description,
                    Barcode = p.Barcode,
                    IsActive = p.IsActive,
                    CreatedAt = p.CreatedAt
                })
                .ToListAsync();

            Response.Headers.Add("X-Total-Count", totalCount.ToString());
            Response.Headers.Add("X-Page", page.ToString());
            Response.Headers.Add("X-Page-Size", pageSize.ToString());

            return Ok(products);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDto>> GetProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null || !product.IsActive)
            {
                return NotFound();
            }

            var productDto = new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                SKU = product.SKU,
                Category = product.Category,
                Price = product.Price,
                Quantity = product.Quantity,
                Description = product.Description,
                Barcode = product.Barcode,
                IsActive = product.IsActive,
                CreatedAt = product.CreatedAt
            };

            return Ok(productDto);
        }

        [HttpGet("barcode/{barcode}")]
        public async Task<ActionResult<ProductDto>> GetProductByBarcode(string barcode)
        {
            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Barcode == barcode && p.IsActive);

            if (product == null)
            {
                return NotFound();
            }

            var productDto = new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                SKU = product.SKU,
                Category = product.Category,
                Price = product.Price,
                Quantity = product.Quantity,
                Description = product.Description,
                Barcode = product.Barcode,
                IsActive = product.IsActive,
                CreatedAt = product.CreatedAt
            };

            return Ok(productDto);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,InventoryManager")]
        public async Task<ActionResult<ProductDto>> CreateProduct(CreateProductRequest request)
        {
            if (await _context.Products.AnyAsync(p => p.SKU == request.SKU))
            {
                return BadRequest(new { message = "SKU already exists" });
            }

            if (!string.IsNullOrEmpty(request.Barcode) && 
                await _context.Products.AnyAsync(p => p.Barcode == request.Barcode))
            {
                return BadRequest(new { message = "Barcode already exists" });
            }

            var product = new Product
            {
                Name = request.Name,
                SKU = request.SKU,
                Category = request.Category,
                Price = request.Price,
                Quantity = request.Quantity,
                Description = request.Description,
                Barcode = request.Barcode,
                CreatedAt = DateTime.UtcNow
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            var productDto = new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                SKU = product.SKU,
                Category = product.Category,
                Price = product.Price,
                Quantity = product.Quantity,
                Description = product.Description,
                Barcode = product.Barcode,
                IsActive = product.IsActive,
                CreatedAt = product.CreatedAt
            };

            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, productDto);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,InventoryManager")]
        public async Task<IActionResult> UpdateProduct(int id, UpdateProductRequest request)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null)
            {
                return NotFound();
            }

            if (!string.IsNullOrEmpty(request.Name))
                product.Name = request.Name;

            if (!string.IsNullOrEmpty(request.Category))
                product.Category = request.Category;

            if (request.Price.HasValue)
                product.Price = request.Price.Value;

            if (request.Quantity.HasValue)
                product.Quantity = request.Quantity.Value;

            if (request.Description != null)
                product.Description = request.Description;

            if (!string.IsNullOrEmpty(request.Barcode))
            {
                if (await _context.Products.AnyAsync(p => p.Barcode == request.Barcode && p.Id != id))
                {
                    return BadRequest(new { message = "Barcode already exists" });
                }
                product.Barcode = request.Barcode;
            }

            if (request.IsActive.HasValue)
                product.IsActive = request.IsActive.Value;

            product.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpPost("adjust-stock")]
        [Authorize(Roles = "Admin,InventoryManager")]
        public async Task<IActionResult> AdjustStock(StockAdjustmentRequest request)
        {
            var product = await _context.Products.FindAsync(request.ProductId);

            if (product == null)
            {
                return NotFound();
            }

            var newQuantity = product.Quantity + request.QuantityChange;

            if (newQuantity < 0)
            {
                return BadRequest(new { message = "Insufficient stock" });
            }

            product.Quantity = newQuantity;
            product.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { newQuantity = product.Quantity });
        }

        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<string>>> GetCategories()
        {
            var categories = await _context.Products
                .Where(p => p.IsActive)
                .Select(p => p.Category)
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();

            return Ok(categories);
        }

        [HttpGet("low-stock")]
        [Authorize(Roles = "Admin,InventoryManager")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetLowStockProducts(int threshold = 10)
        {
            var products = await _context.Products
                .Where(p => p.IsActive && p.Quantity <= threshold)
                .Select(p => new ProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    SKU = p.SKU,
                    Category = p.Category,
                    Price = p.Price,
                    Quantity = p.Quantity,
                    Description = p.Description,
                    Barcode = p.Barcode,
                    IsActive = p.IsActive,
                    CreatedAt = p.CreatedAt
                })
                .ToListAsync();

            return Ok(products);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null)
            {
                return NotFound();
            }

            // Soft delete
            product.IsActive = false;
            product.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}