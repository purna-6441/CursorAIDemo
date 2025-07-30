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
    addItem: (state, action: PayloadAction<{ product: Product; quantity: number }>) => {
      const { product, quantity } = action.payload;
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
      
      // Recalculate totals
      const subtotal = state.items.reduce((sum, item) => {
        const itemTotal = (item.product.price * item.quantity) - item.discountAmount;
        return sum + itemTotal;
      }, 0);
      state.total = Math.max(0, subtotal - state.discountAmount);
    },
    
    removeItem: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(item => item.product.id !== action.payload);
      
      // Recalculate totals
      const subtotal = state.items.reduce((sum, item) => {
        const itemTotal = (item.product.price * item.quantity) - item.discountAmount;
        return sum + itemTotal;
      }, 0);
      state.total = Math.max(0, subtotal - state.discountAmount);
    },
    
    incrementQuantity: (state, action: PayloadAction<number>) => {
      const item = state.items.find(item => item.product.id === action.payload);
      if (item && item.quantity < item.product.quantity) {
        item.quantity += 1;
        
        // Recalculate totals
        const subtotal = state.items.reduce((sum, item) => {
          const itemTotal = (item.product.price * item.quantity) - item.discountAmount;
          return sum + itemTotal;
        }, 0);
        state.total = Math.max(0, subtotal - state.discountAmount);
      }
    },
    
    decrementQuantity: (state, action: PayloadAction<number>) => {
      const item = state.items.find(item => item.product.id === action.payload);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
        
        // Recalculate totals
        const subtotal = state.items.reduce((sum, item) => {
          const itemTotal = (item.product.price * item.quantity) - item.discountAmount;
          return sum + itemTotal;
        }, 0);
        state.total = Math.max(0, subtotal - state.discountAmount);
      } else if (item && item.quantity === 1) {
        // Remove item if quantity becomes 0
        state.items = state.items.filter(item => item.product.id !== action.payload);
        
        // Recalculate totals
        const subtotal = state.items.reduce((sum, item) => {
          const itemTotal = (item.product.price * item.quantity) - item.discountAmount;
          return sum + itemTotal;
        }, 0);
        state.total = Math.max(0, subtotal - state.discountAmount);
      }
    },
    
    updateItemDiscount: (state, action: PayloadAction<{ productId: number; discountAmount: number }>) => {
      const { productId, discountAmount } = action.payload;
      const item = state.items.find(item => item.product.id === productId);
      
      if (item) {
        item.discountAmount = Math.max(0, discountAmount);
        
        // Recalculate totals
        const subtotal = state.items.reduce((sum, item) => {
          const itemTotal = (item.product.price * item.quantity) - item.discountAmount;
          return sum + itemTotal;
        }, 0);
        state.total = Math.max(0, subtotal - state.discountAmount);
      }
    },
    
    updateCartDiscount: (state, action: PayloadAction<number>) => {
      state.discountAmount = Math.max(0, action.payload);
      
      // Recalculate totals
      const subtotal = state.items.reduce((sum, item) => {
        const itemTotal = (item.product.price * item.quantity) - item.discountAmount;
        return sum + itemTotal;
      }, 0);
      state.total = Math.max(0, subtotal - state.discountAmount);
    },
    
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.discountAmount = 0;
    },
  },
});

export const {
  addItem,
  removeItem,
  incrementQuantity,
  decrementQuantity,
  updateItemDiscount,
  updateCartDiscount,
  clearCart,
} = cartSlice.actions;

// Selectors - Fixed to match actual store structure
export const selectCartItems = (state: any) => state.cart.items;
export const selectCartTotal = (state: any) => state.cart.total;
export const selectCartSubtotal = (state: any) => 
  state.cart.items.reduce((sum: number, item: CartItem) => sum + (item.product.price * item.quantity), 0);
export const selectCartDiscountAmount = (state: any) => state.cart.discountAmount;
export const selectCartItemCount = (state: any) => 
  state.cart.items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);

export default cartSlice.reducer;