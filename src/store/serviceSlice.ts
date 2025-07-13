import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  status: 'active' | 'inactive';
  image_url?: string;
  created_at: string;
}

interface ServiceState {
  services: Service[];
  loading: boolean;
  error: string | null;
}

const initialState: ServiceState = {
  services: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchServices = createAsyncThunk(
  'services/fetchServices',
  async () => {
    const response = await fetch('http://localhost:3000/api/services');
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch services');
    }
    return data.services;
  }
);

export const createService = createAsyncThunk(
  'services/createService',
  async (serviceData: Omit<Service, 'id' | 'created_at' | 'image_url'>) => {
    const response = await fetch('http://localhost:3000/api/services', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(serviceData),
    });
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to create service');
    }
    return data.service;
  }
);

export const updateService = createAsyncThunk(
  'services/updateService',
  async ({ id, ...serviceData }: { id: string } & Omit<Service, 'id' | 'created_at' | 'image_url'>) => {
    const response = await fetch(`http://localhost:3000/api/services/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(serviceData),
    });
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to update service');
    }
    return data.service;
  }
);

export const deleteService = createAsyncThunk(
  'services/deleteService',
  async (id: string) => {
    const response = await fetch(`http://localhost:3000/api/services/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to delete service');
    }
    return id;
  }
);

const serviceSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch services
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch services';
      })
      
      // Create service
      .addCase(createService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createService.fulfilled, (state, action) => {
        state.loading = false;
        state.services.push(action.payload);
      })
      .addCase(createService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create service';
      })
      
      // Update service
      .addCase(updateService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateService.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.services.findIndex(service => service.id === action.payload.id);
        if (index !== -1) {
          state.services[index] = action.payload;
        }
      })
      .addCase(updateService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update service';
      })
      
      // Delete service
      .addCase(deleteService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.loading = false;
        state.services = state.services.filter(service => service.id !== action.payload);
      })
      .addCase(deleteService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete service';
      });
  },
});

export const { clearError } = serviceSlice.actions;
export default serviceSlice.reducer;
