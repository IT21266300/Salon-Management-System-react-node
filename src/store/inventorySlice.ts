import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Product {
  stock: ReactNode;
  id: string;
  name: string;
  description: string;
  category: string;
  sku: string;
  purchasePrice: number;
  sellingPrice: number;
  quantityInStock: number;
  reorderLevel: number;
  supplierId: string;
  supplierName: string;
  createdAt: string;
  updatedAt: string;
}

interface InventoryState {
  products: Product[];
  categories: string[];
  loading: boolean;
  error: string | null;
  lowStockAlerts: Product[];
}

const initialState: InventoryState = {
  products: [],
  categories: [],
  loading: false,
  error: null,
  lowStockAlerts: [],
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
      state.lowStockAlerts = action.payload.filter(p => p.quantityInStock <= p.reorderLevel);
    },
    addProduct: (state, action: PayloadAction<Product>) => {
      state.products.push(action.payload);
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.products.findIndex(product => product.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
      state.lowStockAlerts = state.products.filter(p => p.quantityInStock <= p.reorderLevel);
    },
    deleteProduct: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter(product => product.id !== action.payload);
    },
    setCategories: (state, action: PayloadAction<string[]>) => {
      state.categories = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setLoading,
  setProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  setCategories,
  setError,
} = inventorySlice.actions;

export default inventorySlice.reducer;
