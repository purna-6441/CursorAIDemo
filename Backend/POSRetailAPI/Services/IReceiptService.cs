using POSRetailAPI.Models;

namespace POSRetailAPI.Services
{
    public interface IReceiptService
    {
        Task<string> GenerateReceiptPdfAsync(Sale sale);
    }
}