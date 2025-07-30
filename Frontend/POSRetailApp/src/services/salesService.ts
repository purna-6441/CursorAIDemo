import apiClient, { handleApiResponse, handleApiError } from './api';
import {
  Sale,
  CreateSaleRequest,
  SaleResponse,
  DailySalesReport,
  TopSellingProductReport,
  PaginatedResponse,
} from '@/types';

export class SalesService {
  static async createSale(saleData: CreateSaleRequest): Promise<SaleResponse> {
    try {
      const response = await apiClient.post<SaleResponse>('/sales', saleData);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  static async getSales(params?: {
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Sale>> {
    try {
      const response = await apiClient.get<Sale[]>('/sales', { params });
      const data = handleApiResponse(response);
      
      // Extract pagination info from headers
      const totalCount = parseInt(response.headers['x-total-count'] || '0');
      const page = parseInt(response.headers['x-page'] || '1');
      const pageSize = parseInt(response.headers['x-page-size'] || '50');
      
      return {
        data,
        totalCount,
        page,
        pageSize,
      };
    } catch (error) {
      handleApiError(error);
    }
  }

  static async getSale(id: number): Promise<Sale> {
    try {
      const response = await apiClient.get<Sale>(`/sales/${id}`);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  static async getReceipt(saleId: number): Promise<Blob> {
    try {
      const response = await apiClient.get(`/sales/${saleId}/receipt`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }

  static async getDailySalesReport(date?: string): Promise<DailySalesReport> {
    try {
      const params = date ? { date } : undefined;
      const response = await apiClient.get<DailySalesReport>('/sales/reports/daily', { params });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  static async getTopSellingProducts(params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<TopSellingProductReport[]> {
    try {
      const response = await apiClient.get<TopSellingProductReport[]>(
        '/sales/reports/top-selling',
        { params }
      );
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  static async getSalesAnalytics(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{
    totalSales: number;
    totalTransactions: number;
    averageTransactionValue: number;
    dailyTrend: Array<{ date: string; sales: number; transactions: number }>;
  }> {
    try {
      // This would be a custom analytics endpoint that aggregates sales data
      const salesData = await this.getSales(params);
      
      // Calculate analytics from the sales data
      const totalSales = salesData.data.reduce((sum, sale) => sum + sale.total, 0);
      const totalTransactions = salesData.data.length;
      const averageTransactionValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;
      
      // Group by date for trend analysis
      const dailyTrend = salesData.data.reduce((acc, sale) => {
        const date = sale.createdAt.split('T')[0]; // Extract date part
        const existing = acc.find(item => item.date === date);
        
        if (existing) {
          existing.sales += sale.total;
          existing.transactions += 1;
        } else {
          acc.push({
            date,
            sales: sale.total,
            transactions: 1,
          });
        }
        
        return acc;
      }, [] as Array<{ date: string; sales: number; transactions: number }>);
      
      return {
        totalSales,
        totalTransactions,
        averageTransactionValue,
        dailyTrend: dailyTrend.sort((a, b) => a.date.localeCompare(b.date)),
      };
    } catch (error) {
      handleApiError(error);
    }
  }

  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

export default SalesService;