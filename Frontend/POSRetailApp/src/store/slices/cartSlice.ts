import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartState, CartItem, Product } from '@/types';

const initialState: CartState = {
  items: [],
  total: 0,
  discountAmount: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<{ product: Product; quantity?: number }>) => {
      const { product, quantity = 1 } = action.payload;
      const existingItem = state.items.find(item => item.product.id === product.id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          product,
          quantity,
          discountAmount: 0,
        });
      }

      recalculateTotal(state);
    },

    removeItem: (state, action: PayloadAction<number>) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item.product.id !== productId);
      recalculateTotal(state);
    },

    updateQuantity: (state, action: PayloadAction<{ productId: number; quantity: number }>) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(item => item.product.id === productId);

      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(item => item.product.id !== productId);
        } else {
          item.quantity = quantity;
        }
      }

      recalculateTotal(state);
    },

    updateItemDiscount: (state, action: PayloadAction<{ productId: number; discountAmount: number }>) => {
      const { productId, discountAmount } = action.payload;
      const item = state.items.find(item => item.product.id === productId);

      if (item) {
        item.discountAmount = Math.max(0, discountAmount);
      }

      recalculateTotal(state);
    },

    applyCartDiscount: (state, action: PayloadAction<number>) => {
      state.discountAmount = Math.max(0, action.payload);
      recalculateTotal(state);
    },

    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.discountAmount = 0;
    },

    incrementQuantity: (state, action: PayloadAction<number>) => {
      const productId = action.payload;
      const item = state.items.find(item => item.product.id === productId);

      if (item) {
        item.quantity += 1;
        recalculateTotal(state);
      }
    },

    decrementQuantity: (state, action: PayloadAction<number>) => {
      const productId = action.payload;
      const item = state.items.find(item => item.product.id === productId);

      if (item) {
        if (item.quantity > 1) {
          item.quantity -= 1;
        } else {
          state.items = state.items.filter(item => item.product.id !== productId);
        }
        recalculateTotal(state);
      }
    },
  },
});

// Helper function to recalculate total
const recalculateTotal = (state: CartState) => {
  const subtotal = state.items.reduce((sum, item) => {
    const itemTotal = (item.product.price * item.quantity) - item.discountAmount;
    return sum + itemTotal;
  }, 0);

  state.total = Math.max(0, subtotal - state.discountAmount);
};

export const {
  addItem,
  removeItem,
  updateQuantity,
  updateItemDiscount,
  applyCartDiscount,
  clearCart,
  incrementQuantity,
  decrementQuantity,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartTotal = (state: { cart: CartState }) => state.cart.total;
export const selectCartDiscountAmount = (state: { cart: CartState }) => state.cart.discountAmount;
export const selectCartItemCount = (state: { cart: CartState }) => 
  state.cart.items.reduce((count, item) => count + item.quantity, 0);
export const selectCartSubtotal = (state: { cart: CartState }) => 
  state.cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
export const selectCartItemDiscounts = (state: { cart: CartState }) => 
  state.cart.items.reduce((sum, item) => sum + item.discountAmount, 0);

export default cartSlice.reducer;