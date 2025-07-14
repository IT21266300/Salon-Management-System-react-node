import { apiService, ApiResponse } from './apiService';

// Type definitions for common data structures
export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  phone?: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  preferences?: string;
  notes?: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: number;
  customer_id: number;
  customer_name?: string;
  service_id: number;
  service_name?: string;
  staff_id: number;
  staff_name?: string;
  workstation_id?: number;
  workstation_name?: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  total_amount?: number;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: number;
  name: string;
  description?: string;
  duration: number;
  price: number;
  category?: string;
  image?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: number;
  user_id: number;
  username?: string;
  action: string;
  resource_type: string;
  resource_id?: number;
  details?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// API functions with proper typing and error handling

// Authentication APIs
export const authApi = {
  login: async (credentials: { username: string; password: string }): Promise<ApiResponse<{ user: User; token: string }>> => {
    return apiService.post('/auth/login', credentials, {
      showSuccessNotification: true,
      successMessage: 'Successfully logged in!',
      showErrorNotification: true,
    });
  },

  register: async (userData: {
    username: string;
    password: string;
    email: string;
    full_name: string;
    role?: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> => {
    return apiService.post('/auth/register', userData, {
      showSuccessNotification: true,
      successMessage: 'Account created successfully!',
      showErrorNotification: true,
    });
  },

  validateToken: async (): Promise<ApiResponse<{ user: User }>> => {
    return apiService.get('/auth/validate', {
      showErrorNotification: false, // Don't show errors for token validation
    });
  },

  logout: async (): Promise<ApiResponse<{ message: string }>> => {
    return apiService.post('/auth/logout', {}, {
      showSuccessNotification: true,
      successMessage: 'Successfully logged out!',
    });
  },
};

// Customer APIs
export const customerApi = {
  getAll: async (params?: { search?: string; page?: number; limit?: number }): Promise<ApiResponse<{ customers: Customer[]; total: number }>> => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiService.get(`/customers${query}`);
  },

  getById: async (id: number): Promise<ApiResponse<Customer>> => {
    return apiService.get(`/customers/${id}`);
  },

  create: async (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Customer>> => {
    return apiService.post('/customers', customerData, {
      showSuccessNotification: true,
      successMessage: 'Customer created successfully!',
    });
  },

  update: async (id: number, customerData: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>): Promise<ApiResponse<Customer>> => {
    return apiService.put(`/customers/${id}`, customerData, {
      showSuccessNotification: true,
      successMessage: 'Customer updated successfully!',
    });
  },

  delete: async (id: number): Promise<ApiResponse<{ message: string }>> => {
    return apiService.delete(`/customers/${id}`, {
      showSuccessNotification: true,
      successMessage: 'Customer deleted successfully!',
    });
  },
};

// Appointment APIs
export const appointmentApi = {
  getAll: async (params?: { 
    date?: string; 
    status?: string; 
    customer_id?: number; 
    staff_id?: number;
    page?: number; 
    limit?: number;
  }): Promise<ApiResponse<{ appointments: Appointment[]; total: number }>> => {
    const searchParams = new URLSearchParams();
    if (params?.date) searchParams.append('date', params.date);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.customer_id) searchParams.append('customer_id', params.customer_id.toString());
    if (params?.staff_id) searchParams.append('staff_id', params.staff_id.toString());
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiService.get(`/appointments${query}`);
  },

  getById: async (id: number): Promise<ApiResponse<Appointment>> => {
    return apiService.get(`/appointments/${id}`);
  },

  create: async (appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'customer_name' | 'service_name' | 'staff_name' | 'workstation_name'>): Promise<ApiResponse<Appointment>> => {
    return apiService.post('/appointments', appointmentData, {
      showSuccessNotification: true,
      successMessage: 'Appointment created successfully!',
    });
  },

  update: async (id: number, appointmentData: Partial<Omit<Appointment, 'id' | 'created_at' | 'updated_at'>>): Promise<ApiResponse<Appointment>> => {
    return apiService.put(`/appointments/${id}`, appointmentData, {
      showSuccessNotification: true,
      successMessage: 'Appointment updated successfully!',
    });
  },

  updateStatus: async (id: number, status: Appointment['status'], notes?: string): Promise<ApiResponse<Appointment>> => {
    return apiService.patch(`/appointments/${id}/status`, { status, notes }, {
      showSuccessNotification: true,
      successMessage: `Appointment ${status} successfully!`,
    });
  },

  delete: async (id: number): Promise<ApiResponse<{ message: string }>> => {
    return apiService.delete(`/appointments/${id}`, {
      showSuccessNotification: true,
      successMessage: 'Appointment deleted successfully!',
    });
  },
};

// Service APIs
export const serviceApi = {
  getAll: async (params?: { active_only?: boolean; category?: string }): Promise<ApiResponse<Service[]>> => {
    const searchParams = new URLSearchParams();
    if (params?.active_only) searchParams.append('active_only', 'true');
    if (params?.category) searchParams.append('category', params.category);
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiService.get(`/services${query}`);
  },

  getById: async (id: number): Promise<ApiResponse<Service>> => {
    return apiService.get(`/services/${id}`);
  },

  create: async (serviceData: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Service>> => {
    return apiService.post('/services', serviceData, {
      showSuccessNotification: true,
      successMessage: 'Service created successfully!',
    });
  },

  update: async (id: number, serviceData: Partial<Omit<Service, 'id' | 'created_at' | 'updated_at'>>): Promise<ApiResponse<Service>> => {
    return apiService.put(`/services/${id}`, serviceData, {
      showSuccessNotification: true,
      successMessage: 'Service updated successfully!',
    });
  },

  delete: async (id: number): Promise<ApiResponse<{ message: string }>> => {
    return apiService.delete(`/services/${id}`, {
      showSuccessNotification: true,
      successMessage: 'Service deleted successfully!',
    });
  },
};

// Activity Log APIs
export const activityLogApi = {
  getAll: async (params?: {
    user_id?: number;
    action?: string;
    resource_type?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ logs: ActivityLog[]; total: number; totalPages: number }>> => {
    const searchParams = new URLSearchParams();
    if (params?.user_id) searchParams.append('user_id', params.user_id.toString());
    if (params?.action) searchParams.append('action', params.action);
    if (params?.resource_type) searchParams.append('resource_type', params.resource_type);
    if (params?.start_date) searchParams.append('start_date', params.start_date);
    if (params?.end_date) searchParams.append('end_date', params.end_date);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiService.get(`/activity-logs${query}`);
  },

  getStats: async (): Promise<ApiResponse<{
    totalLogs: number;
    todayLogs: number;
    topActions: Array<{ action: string; count: number }>;
    topUsers: Array<{ username: string; count: number }>;
  }>> => {
    return apiService.get('/activity-logs/stats');
  },

  cleanup: async (days: number): Promise<ApiResponse<{ deletedCount: number }>> => {
    return apiService.delete(`/activity-logs/cleanup/${days}`, {
      showSuccessNotification: true,
      successMessage: `Cleaned up activity logs older than ${days} days!`,
    });
  },
};

// User APIs
export const userApi = {
  getAll: async (): Promise<ApiResponse<User[]>> => {
    return apiService.get('/users');
  },

  getById: async (id: number): Promise<ApiResponse<User>> => {
    return apiService.get(`/users/${id}`);
  },

  create: async (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<User>> => {
    return apiService.post('/users', userData, {
      showSuccessNotification: true,
      successMessage: 'User created successfully!',
    });
  },

  update: async (id: number, userData: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>): Promise<ApiResponse<User>> => {
    return apiService.put(`/users/${id}`, userData, {
      showSuccessNotification: true,
      successMessage: 'User updated successfully!',
    });
  },

  delete: async (id: number): Promise<ApiResponse<{ message: string }>> => {
    return apiService.delete(`/users/${id}`, {
      showSuccessNotification: true,
      successMessage: 'User deleted successfully!',
    });
  },

  updatePassword: async (id: number, passwords: { currentPassword: string; newPassword: string }): Promise<ApiResponse<{ message: string }>> => {
    return apiService.patch(`/users/${id}/password`, passwords, {
      showSuccessNotification: true,
      successMessage: 'Password updated successfully!',
    });
  },
};
