// Auth Types
export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
}

export enum UserRole {
  Admin = 'Admin',
  Cashier = 'Cashier',
  InventoryManager = 'InventoryManager',
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

// Product Types
export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  quantity: number;
  description?: string;
  barcode?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  category: string;
  price: number;
  quantity: number;
  description?: string;
  barcode?: string;
}

export interface UpdateProductRequest {
  name?: string;
  category?: string;
  price?: number;
  quantity?: number;
  description?: string;
  barcode?: string;
  isActive?: boolean;
}

export interface StockAdjustmentRequest {
  productId: number;
  quantityChange: number;
  reason?: string;
}

// Sale Types
export interface SaleItem {
  id: number;
  productId: number;
  productName: string;
  productSKU: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  lineTotal: number;
}

export interface Sale {
  id: number;
  userId: number;
  userName: string;
  subTotal: number;
  discountAmount: number;
  total: number;
  paymentMethod: string;
  createdAt: string;
  items: SaleItem[];
}

export interface CreateSaleRequest {
  items: {
    productId: number;
    quantity: number;
    discountAmount: number;
  }[];
  paymentMethod: string;
  discountAmount: number;
  total: number;
}

export interface SaleResponse {
  saleId: number;
  receiptPdf: string;
  total: number;
  createdAt: string;
}

// Cart Types
export interface CartItem {
  product: Product;
  quantity: number;
  discountAmount: number;
}

// Report Types
export interface DailySalesReport {
  date: string;
  totalSales: number;
  transactionCount: number;
  sales: Sale[];
}

export interface TopSellingProductReport {
  productId: number;
  productName: string;
  sku: string;
  totalQuantitySold: number;
  totalRevenue: number;
}

// Navigation Types
export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  ProductDetail: { productId: number };
  AddProduct: undefined;
  EditProduct: { productId: number };
  Sale: undefined;
  Cart: undefined;
  Payment: { total: number; items: CartItem[] };
  Receipt: { saleId: number };
  Reports: undefined;
  BarcodeScanner: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Sales: undefined;
  Inventory: undefined;
  Reports: undefined;
  Profile: undefined;
};

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// Form Types
export interface LoginFormData {
  username: string;
  password: string;
}

export interface ProductFormData {
  name: string;
  sku: string;
  category: string;
  price: string;
  quantity: string;
  description: string;
  barcode: string;
}

// Error Types
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

// Store Types
export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface ProductState {
  products: Product[];
  currentProduct: Product | null;
  categories: string[];
  isLoading: boolean;
  error: string | null;
}

export interface CartState {
  items: CartItem[];
  total: number;
  discountAmount: number;
}

export interface SaleState {
  sales: Sale[];
  currentSale: Sale | null;
  isLoading: boolean;
  error: string | null;
}