import { API_BASE_URL } from '../config/api';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface ApiRequestOptions extends RequestInit {
  showSuccessNotification?: boolean;
  showErrorNotification?: boolean;
  successMessage?: string;
  errorMessage?: string;
  timeout?: number;
}

export class ApiError extends Error {
  public status: number;
  public response?: unknown;

  constructor(message: string, status: number, response?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
  }
}

class ApiService {
  private baseUrl: string;
  private defaultTimeout: number = 30000; // 30 seconds

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      showSuccessNotification = false,
      showErrorNotification = true,
      successMessage,
      timeout = this.defaultTimeout,
      ...fetchOptions
    } = options;

    const url = `${this.baseUrl}${endpoint}`;
    
    // Set default headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add existing headers from options
    if (fetchOptions.headers) {
      if (fetchOptions.headers instanceof Headers) {
        fetchOptions.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(fetchOptions.headers)) {
        fetchOptions.headers.forEach(([key, value]) => {
          headers[key] = value;
        });
      } else {
        Object.assign(headers, fetchOptions.headers);
      }
    }

    // Add authorization token if available
    const token = localStorage.getItem('token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let responseData: unknown;
      try {
        responseData = await response.json();
      } catch {
        responseData = { message: 'Invalid response format' };
      }

      if (!response.ok) {
        const errorData = responseData as { message?: string; error?: string };
        const errorMsg = errorData.message || errorData.error || `HTTP ${response.status}`;
        throw new ApiError(errorMsg, response.status, responseData);
      }

      // Handle success notification
      if (showSuccessNotification && successMessage) {
        // Note: This would need to be injected or use a global notification system
        console.log('Success:', successMessage);
      }

      const data = responseData as { data?: T; message?: string };
      return {
        success: true,
        data: data.data || (responseData as T),
        message: data.message,
      };

    } catch (error) {
      clearTimeout(timeoutId);

      let errorMessage = 'An unexpected error occurred';

      if (error instanceof ApiError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timeout';
        } else {
          errorMessage = error.message;
        }
      }

      // Handle error notification
      if (showErrorNotification) {
        console.error('API Error:', errorMessage);
      }

      return {
        success: false,
        error: errorMessage,
        message: errorMessage,
      };
    }
  }

  // GET request
  async get<T>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'GET' });
  }

  // POST request
  async post<T>(
    endpoint: string,
    data?: Record<string, unknown>,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(
    endpoint: string,
    data?: Record<string, unknown>,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // PATCH request
  async patch<T>(
    endpoint: string,
    data?: Record<string, unknown>,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // File upload
  async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, string | number | boolean>,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const restOptions = { ...options };
    delete restOptions.headers;
    
    return this.makeRequest<T>(endpoint, {
      ...restOptions,
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it with boundary
      } as Record<string, string>,
    });
  }
}
// Create a singleton instance
export const apiService = new ApiService(API_BASE_URL);

// Utility functions for common operations
export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export const isNetworkError = (error: unknown): boolean => {
  return error instanceof TypeError && error.message.includes('fetch');
};

export const isTimeoutError = (error: unknown): boolean => {
  return error instanceof Error && error.name === 'AbortError';
};

export default apiService;
