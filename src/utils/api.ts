import { store } from '../store';
import { logout } from '../store/authSlice';

// API utility to handle authenticated requests
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const state = store.getState();
  const token = state.auth.token;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // If unauthorized, logout user
    if (response.status === 401) {
      store.dispatch(logout());
      throw new Error('Authentication failed');
    }

    return response;
  } catch (error) {
    throw error;
  }
};

// Helper for GET requests
export const apiGet = (url: string) => authenticatedFetch(url, { method: 'GET' });

// Helper for POST requests
export const apiPost = (url: string, data: any) => 
  authenticatedFetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });

// Helper for PUT requests
export const apiPut = (url: string, data: any) => 
  authenticatedFetch(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

// Helper for DELETE requests
export const apiDelete = (url: string) => 
  authenticatedFetch(url, { method: 'DELETE' });
