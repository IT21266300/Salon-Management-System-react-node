// API Configuration
export const API_BASE_URL = 'http://localhost:3000/api';

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/auth/login`,
  PROFILE: `${API_BASE_URL}/auth/profile`,
  
  // Users
  USERS: `${API_BASE_URL}/users`,
  
  // Customers
  CUSTOMERS: `${API_BASE_URL}/customers`,
  
  // Inventory
  INVENTORY: `${API_BASE_URL}/inventory`,
  
  // Sales
  SALES: `${API_BASE_URL}/sales`,
  
  // Suppliers
  SUPPLIERS: `${API_BASE_URL}/suppliers`,
  
  // Appointments
  APPOINTMENTS: `${API_BASE_URL}/appointments`,
  
  // Reports
  REPORTS: {
    DASHBOARD_STATS: `${API_BASE_URL}/reports/dashboard-stats`,
    SALES_SUMMARY: `${API_BASE_URL}/reports/sales-summary`,
    INVENTORY_REPORT: `${API_BASE_URL}/reports/inventory-report`,
  },
  
  // Services
  SERVICES: `${API_BASE_URL}/services`,
  
  // Workstations
  WORKSTATIONS: `${API_BASE_URL}/workstations`,
  
  // Activity Logs
  ACTIVITY_LOGS: `${API_BASE_URL}/activity-logs`,
};

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string, id?: string) => {
  return id ? `${endpoint}/${id}` : endpoint;
};
