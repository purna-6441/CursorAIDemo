import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ProductState, Product, CreateProductRequest, UpdateProductRequest } from '@/types';
import ProductService from '@/services/productService';

const initialState: ProductState = {
  products: [],
  currentProduct: null,
  categories: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchProducts = createAsyncThunk<
  { products: Product[]; totalCount: number },
  { search?: string; category?: string; page?: number; pageSize?: number }
>('products/fetchProducts', async (params, { rejectWithValue }) => {
  try {
    const response = await ProductService.getProducts(params);
    return { products: response.data, totalCount: response.totalCount };
  } catch (error) {
    return rejectWithValue((error as Error).message);
  }
});

export const fetchProduct = createAsyncThunk<Product, number>(
  'products/fetchProduct',
  async (id, { rejectWithValue }) => {
    try {
      return await ProductService.getProduct(id);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchProductByBarcode = createAsyncThunk<Product, string>(
  'products/fetchProductByBarcode',
  async (barcode, { rejectWithValue }) => {
    try {
      return await ProductService.getProductByBarcode(barcode);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const createProduct = createAsyncThunk<Product, CreateProductRequest>(
  'products/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      return await ProductService.createProduct(productData);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateProduct = createAsyncThunk<
  void,
  { id: number; productData: UpdateProductRequest }
>('products/updateProduct', async ({ id, productData }, { rejectWithValue }) => {
  try {
    await ProductService.updateProduct(id, productData);
  } catch (error) {
    return rejectWithValue((error as Error).message);
  }
});

export const deleteProduct = createAsyncThunk<number, number>(
  'products/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await ProductService.deleteProduct(id);
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchCategories = createAsyncThunk<string[], void>(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await ProductService.getCategories();
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentProduct: (state, action: PayloadAction<Product | null>) => {
      state.currentProduct = action.payload;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.products;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch single product
      .addCase(fetchProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
        state.error = null;
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch product by barcode
      .addCase(fetchProductByBarcode.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductByBarcode.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
        state.error = null;
      })
      .addCase(fetchProductByBarcode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create product
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products.unshift(action.payload);
        state.error = null;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = state.products.filter(p => p.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      });
  },
});

export const { clearError, setCurrentProduct, clearCurrentProduct } = productSlice.actions;

// Selectors
export const selectProducts = (state: { products: ProductState }) => state.products.products;
export const selectCurrentProduct = (state: { products: ProductState }) => state.products.currentProduct;
export const selectCategories = (state: { products: ProductState }) => state.products.categories;
export const selectProductsLoading = (state: { products: ProductState }) => state.products.isLoading;
export const selectProductsError = (state: { products: ProductState }) => state.products.error;

export default productSlice.reducer;