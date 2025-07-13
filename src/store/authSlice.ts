import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../config/api';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'staff' | 'cashier';
  firstName: string;
  lastName: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false, // Only true after validation
  loading: false,
};


import { createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk to validate token and fetch user profile
export const validateTokenAndLoadUser = createAsyncThunk(
  'auth/validateTokenAndLoadUser',
  async (_, { dispatch, rejectWithValue }) => {
    const token = localStorage.getItem('token');
    if (!token) return rejectWithValue('No token');
    try {
      const response = await fetch(API_ENDPOINTS.PROFILE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && data.user) {
        return { user: data.user, token };
      } else {
        dispatch(logout());
        return rejectWithValue('Invalid token');
      }
    } catch (err) {
      dispatch(logout());
      return rejectWithValue('Token validation failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token);
    },
    loginFailure: (state) => {
      state.loading = false;
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(validateTokenAndLoadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(validateTokenAndLoadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(validateTokenAndLoadUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;
