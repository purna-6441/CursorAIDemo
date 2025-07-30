import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { SaleState, Sale, CreateSaleRequest, SaleResponse } from '@/types';
import SalesService from '@/services/salesService';

const initialState: SaleState = {
  sales: [],
  currentSale: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const createSale = createAsyncThunk<SaleResponse, CreateSaleRequest>(
  'sales/createSale',
  async (saleData, { rejectWithValue }) => {
    try {
      return await SalesService.createSale(saleData);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchSales = createAsyncThunk<
  { sales: Sale[]; totalCount: number },
  { startDate?: string; endDate?: string; page?: number; pageSize?: number }
>('sales/fetchSales', async (params, { rejectWithValue }) => {
  try {
    const response = await SalesService.getSales(params);
    return { sales: response.data, totalCount: response.totalCount };
  } catch (error) {
    return rejectWithValue((error as Error).message);
  }
});

export const fetchSale = createAsyncThunk<Sale, number>(
  'sales/fetchSale',
  async (id, { rejectWithValue }) => {
    try {
      return await SalesService.getSale(id);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchDailySalesReport = createAsyncThunk<
  any,
  string | undefined
>('sales/fetchDailySalesReport', async (date, { rejectWithValue }) => {
  try {
    return await SalesService.getDailySalesReport(date);
  } catch (error) {
    return rejectWithValue((error as Error).message);
  }
});

export const fetchTopSellingProducts = createAsyncThunk<
  any[],
  { startDate?: string; endDate?: string; limit?: number }
>('sales/fetchTopSellingProducts', async (params, { rejectWithValue }) => {
  try {
    return await SalesService.getTopSellingProducts(params);
  } catch (error) {
    return rejectWithValue((error as Error).message);
  }
});

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentSale: (state) => {
      state.currentSale = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create sale
      .addCase(createSale.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSale.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(createSale.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch sales
      .addCase(fetchSales.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSales.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sales = action.payload.sales;
        state.error = null;
      })
      .addCase(fetchSales.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch single sale
      .addCase(fetchSale.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSale.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSale = action.payload;
        state.error = null;
      })
      .addCase(fetchSale.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentSale } = salesSlice.actions;

// Selectors
export const selectSales = (state: { sales: SaleState }) => state.sales.sales;
export const selectCurrentSale = (state: { sales: SaleState }) => state.sales.currentSale;
export const selectSalesLoading = (state: { sales: SaleState }) => state.sales.isLoading;
export const selectSalesError = (state: { sales: SaleState }) => state.sales.error;

export default salesSlice.reducer;