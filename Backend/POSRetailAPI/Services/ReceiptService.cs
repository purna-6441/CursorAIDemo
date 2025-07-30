using iTextSharp.text;
using iTextSharp.text.pdf;
using Microsoft.EntityFrameworkCore;
using POSRetailAPI.Data;
using POSRetailAPI.Models;

namespace POSRetailAPI.Services
{
    public class ReceiptService : IReceiptService
    {
        private readonly POSDbContext _context;

        public ReceiptService(POSDbContext context)
        {
            _context = context;
        }

        public async Task<string> GenerateReceiptPdfAsync(Sale sale)
        {
            using var memoryStream = new MemoryStream();
            var document = new Document();
            var writer = PdfWriter.GetInstance(document, memoryStream);

            document.Open();

            // Load sale with related data
            var saleWithDetails = await _context.Sales
                .Include(s => s.User)
                .Include(s => s.SaleItems)
                    .ThenInclude(si => si.Product)
                .FirstOrDefaultAsync(s => s.Id == sale.Id);

            if (saleWithDetails == null)
                throw new InvalidOperationException("Sale not found");

            // Store header
            var titleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 16);
            var headerFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 12);
            var normalFont = FontFactory.GetFont(FontFactory.HELVETICA, 10);

            // Title
            var title = new Paragraph("POS Retail Store", titleFont)
            {
                Alignment = Element.ALIGN_CENTER
            };
            document.Add(title);

            // Store info
            document.Add(new Paragraph("123 Main Street, City, State 12345", normalFont) { Alignment = Element.ALIGN_CENTER });
            document.Add(new Paragraph("Phone: (555) 123-4567", normalFont) { Alignment = Element.ALIGN_CENTER });
            document.Add(new Paragraph(" ")); // Empty line

            // Receipt info
            document.Add(new Paragraph($"Receipt #: {saleWithDetails.Id}", normalFont));
            document.Add(new Paragraph($"Date: {saleWithDetails.CreatedAt:yyyy-MM-dd HH:mm:ss}", normalFont));
            document.Add(new Paragraph($"Cashier: {saleWithDetails.User.Username}", normalFont));
            document.Add(new Paragraph(" ")); // Empty line

            // Items table
            var table = new PdfPTable(5) { WidthPercentage = 100 };
            table.SetWidths(new float[] { 3f, 1f, 1.5f, 1.5f, 2f });

            // Table headers
            table.AddCell(new PdfPCell(new Phrase("Item", headerFont)) { HorizontalAlignment = Element.ALIGN_LEFT });
            table.AddCell(new PdfPCell(new Phrase("Qty", headerFont)) { HorizontalAlignment = Element.ALIGN_CENTER });
            table.AddCell(new PdfPCell(new Phrase("Price", headerFont)) { HorizontalAlignment = Element.ALIGN_RIGHT });
            table.AddCell(new PdfPCell(new Phrase("Discount", headerFont)) { HorizontalAlignment = Element.ALIGN_RIGHT });
            table.AddCell(new PdfPCell(new Phrase("Total", headerFont)) { HorizontalAlignment = Element.ALIGN_RIGHT });

            // Table rows
            foreach (var item in saleWithDetails.SaleItems)
            {
                table.AddCell(new PdfPCell(new Phrase(item.Product.Name, normalFont)) { HorizontalAlignment = Element.ALIGN_LEFT });
                table.AddCell(new PdfPCell(new Phrase(item.Quantity.ToString(), normalFont)) { HorizontalAlignment = Element.ALIGN_CENTER });
                table.AddCell(new PdfPCell(new Phrase($"${item.UnitPrice:F2}", normalFont)) { HorizontalAlignment = Element.ALIGN_RIGHT });
                table.AddCell(new PdfPCell(new Phrase($"${item.DiscountAmount:F2}", normalFont)) { HorizontalAlignment = Element.ALIGN_RIGHT });
                table.AddCell(new PdfPCell(new Phrase($"${item.LineTotal:F2}", normalFont)) { HorizontalAlignment = Element.ALIGN_RIGHT });
            }

            document.Add(table);
            document.Add(new Paragraph(" ")); // Empty line

            // Totals
            document.Add(new Paragraph($"Subtotal: ${saleWithDetails.SubTotal:F2}", normalFont) { Alignment = Element.ALIGN_RIGHT });
            if (saleWithDetails.DiscountAmount > 0)
            {
                document.Add(new Paragraph($"Discount: -${saleWithDetails.DiscountAmount:F2}", normalFont) { Alignment = Element.ALIGN_RIGHT });
            }
            document.Add(new Paragraph($"Total: ${saleWithDetails.Total:F2}", headerFont) { Alignment = Element.ALIGN_RIGHT });

            document.Add(new Paragraph(" ")); // Empty line
            document.Add(new Paragraph($"Payment Method: {saleWithDetails.PaymentMethod}", normalFont));

            document.Add(new Paragraph(" ")); // Empty line
            document.Add(new Paragraph("Thank you for your business!", normalFont) { Alignment = Element.ALIGN_CENTER });

            document.Close();

            var pdfBytes = memoryStream.ToArray();
            return Convert.ToBase64String(pdfBytes);
        }
    }
}