import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Sale {
  id: string;
  customerId?: string;
  customerName?: string;
  staffId: string;
  staffName: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'transfer';
  status: 'pending' | 'completed' | 'refunded';
  saleDate: string;
  notes?: string;
}

interface SalesState {
  sales: Sale[];
  currentSale: Sale | null;
  loading: boolean;
  error: string | null;
  dailyTotal: number;
  monthlyTotal: number;
}

const initialState: SalesState = {
  sales: [],
  currentSale: null,
  loading: false,
  error: null,
  dailyTotal: 0,
  monthlyTotal: 0,
};

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setSales: (state, action: PayloadAction<Sale[]>) => {
      state.sales = action.payload;
      // Calculate daily and monthly totals
      const today = new Date().toISOString().split('T')[0];
      const thisMonth = new Date().toISOString().slice(0, 7);
      
      state.dailyTotal = action.payload
        .filter(sale => sale.saleDate.startsWith(today) && sale.status === 'completed')
        .reduce((sum, sale) => sum + sale.total, 0);
      
      state.monthlyTotal = action.payload
        .filter(sale => sale.saleDate.startsWith(thisMonth) && sale.status === 'completed')
        .reduce((sum, sale) => sum + sale.total, 0);
    },
    addSale: (state, action: PayloadAction<Sale>) => {
      state.sales.push(action.payload);
    },
    updateSale: (state, action: PayloadAction<Sale>) => {
      const index = state.sales.findIndex(sale => sale.id === action.payload.id);
      if (index !== -1) {
        state.sales[index] = action.payload;
      }
    },
    setCurrentSale: (state, action: PayloadAction<Sale | null>) => {
      state.currentSale = action.payload;
    },
    addItemToCurrentSale: (state, action: PayloadAction<SaleItem>) => {
      if (state.currentSale) {
        const existingItem = state.currentSale.items.find(item => item.productId === action.payload.productId);
        if (existingItem) {
          existingItem.quantity += action.payload.quantity;
          existingItem.totalPrice = existingItem.quantity * existingItem.unitPrice;
        } else {
          state.currentSale.items.push(action.payload);
        }
        // Recalculate totals
        state.currentSale.subtotal = state.currentSale.items.reduce((sum, item) => sum + item.totalPrice, 0);
        state.currentSale.total = state.currentSale.subtotal - state.currentSale.discount + state.currentSale.tax;
      }
    },
    removeItemFromCurrentSale: (state, action: PayloadAction<string>) => {
      if (state.currentSale) {
        state.currentSale.items = state.currentSale.items.filter(item => item.id !== action.payload);
        state.currentSale.subtotal = state.currentSale.items.reduce((sum, item) => sum + item.totalPrice, 0);
        state.currentSale.total = state.currentSale.subtotal - state.currentSale.discount + state.currentSale.tax;
      }
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setLoading,
  setSales,
  addSale,
  updateSale,
  setCurrentSale,
  addItemToCurrentSale,
  removeItemFromCurrentSale,
  setError,
} = salesSlice.actions;

export default salesSlice.reducer;
