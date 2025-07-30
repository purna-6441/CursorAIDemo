import apiClient, { handleApiResponse, handleApiError } from './api';
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  StockAdjustmentRequest,
  PaginatedResponse,
} from '@/types';

export class ProductService {
  static async getProducts(params?: {
    search?: string;
    category?: string;
    lowStock?: boolean;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Product>> {
    try {
      const response = await apiClient.get<Product[]>('/products', { params });
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

  static async getProduct(id: number): Promise<Product> {
    try {
      const response = await apiClient.get<Product>(`/products/${id}`);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  static async getProductByBarcode(barcode: string): Promise<Product> {
    try {
      const response = await apiClient.get<Product>(`/products/barcode/${barcode}`);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  static async createProduct(productData: CreateProductRequest): Promise<Product> {
    try {
      const response = await apiClient.post<Product>('/products', productData);
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  static async updateProduct(id: number, productData: UpdateProductRequest): Promise<void> {
    try {
      await apiClient.put(`/products/${id}`, productData);
    } catch (error) {
      handleApiError(error);
    }
  }

  static async deleteProduct(id: number): Promise<void> {
    try {
      await apiClient.delete(`/products/${id}`);
    } catch (error) {
      handleApiError(error);
    }
  }

  static async adjustStock(adjustment: StockAdjustmentRequest): Promise<{ newQuantity: number }> {
    try {
      const response = await apiClient.post<{ newQuantity: number }>(
        '/products/adjust-stock',
        adjustment
      );
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  static async getCategories(): Promise<string[]> {
    try {
      const response = await apiClient.get<string[]>('/products/categories');
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  static async getLowStockProducts(threshold: number = 10): Promise<Product[]> {
    try {
      const response = await apiClient.get<Product[]>('/products/low-stock', {
        params: { threshold },
      });
      return handleApiResponse(response);
    } catch (error) {
      handleApiError(error);
    }
  }

  static async searchProducts(query: string): Promise<Product[]> {
    try {
      const response = await this.getProducts({ search: query, pageSize: 100 });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }
}

export default ProductService;