import axios from 'axios';

// Get API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const isDemoSession = () =>
  localStorage.getItem('stocksmart_token') === 'demo-token' ||
  localStorage.getItem('stocksmart_demo') === '1';

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('stocksmart_token');
    if (token && token !== 'demo-token') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      const isAuthRequest =
        url.includes('/login') ||
        url.includes('/register') ||
        url.includes('/auth/register');

      if (!isAuthRequest && !isDemoSession()) {
        localStorage.removeItem('stocksmart_token');
        localStorage.removeItem('stocksmart_user');
        localStorage.removeItem('stocksmart_tenant');
        localStorage.removeItem('stocksmart_demo');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============ Authentication Endpoints ============
export const authAPI = {
  login: (email, password) => 
    apiClient.post('/login', { email, password }),
  
  signup: (email, password, name) => 
    apiClient.post('/auth/register', { email, password, name }),
  
  logout: () => 
    apiClient.post('/auth/logout'),
  
  getCurrentUser: () => 
    apiClient.get('/auth/me'),
  
  updateProfile: (updates) => 
    apiClient.put('/auth/profile', updates),
};

// ============ Products Endpoints ============
export const productsAPI = {
  list: (filters = {}) => 
    apiClient.get('/products', { params: filters }),
  
  getOne: (id) => 
    apiClient.get(`/products/${id}`),
  
  create: (data) => 
    apiClient.post('/products', data),
  
  update: (id, data) => 
    apiClient.put(`/products/${id}`, data),
  
  delete: (id) => 
    apiClient.delete(`/products/${id}`),
};

// ============ Suppliers Endpoints ============
export const suppliersAPI = {
  list: (filters = {}) => 
    apiClient.get('/suppliers', { params: filters }),
  
  getOne: (id) => 
    apiClient.get(`/suppliers/${id}`),
  
  create: (data) => 
    apiClient.post('/suppliers', data),
  
  update: (id, data) => 
    apiClient.put(`/suppliers/${id}`, data),
  
  delete: (id) => 
    apiClient.delete(`/suppliers/${id}`),
};

// ============ Brands Endpoints ============
export const brandsAPI = {
  list: (filters = {}) => 
    apiClient.get('/brands', { params: filters }),
  
  getOne: (id) => 
    apiClient.get(`/brands/${id}`),
  
  create: (data) => 
    apiClient.post('/brands', data),
  
  update: (id, data) => 
    apiClient.put(`/brands/${id}`, data),
  
  delete: (id) => 
    apiClient.delete(`/brands/${id}`),
};

// ============ Movements Endpoints ============
export const movementsAPI = {
  list: (filters = {}) => 
    apiClient.get('/movements', { params: filters }),
  
  getOne: (id) => 
    apiClient.get(`/movements/${id}`),
  
  create: (data) => 
    apiClient.post('/movements', data),
};

// ============ Stock Endpoints ============
export const stockAPI = {
  getStock: () => 
    apiClient.get('/stock'),
  
  addStock: (data) => 
    apiClient.post('/stock/add', data),
  
  removeStock: (data) => 
    apiClient.post('/stock/remove', data),
};

// ============ Dashboard Endpoints ============
export const dashboardAPI = {
  getStats: () => 
    apiClient.get('/dashboard/stats'),
};

// ============ Reports Endpoints ============
export const reportsAPI = {
  getStockReport: (filters = {}) => 
    apiClient.get('/reports/stock', { params: filters }),
  
  getMovementsReport: (filters = {}) => 
    apiClient.get('/reports/movements', { params: filters }),
  
  getValueReport: (filters = {}) => 
    apiClient.get('/reports/value', { params: filters }),
  
  getPredictions: () => 
    apiClient.get('/reports/predictions'),
};

// ============ Orders Endpoints ============
export const ordersAPI = {
  list: (filters = {}) => 
    apiClient.get('/orders', { params: filters }),
  
  getOne: (id) => 
    apiClient.get(`/orders/${id}`),
  
  create: (data) => 
    apiClient.post('/orders', data),
  
  update: (id, data) => 
    apiClient.put(`/orders/${id}`, data),
  
  delete: (id) => 
    apiClient.delete(`/orders/${id}`),

  // Manager approval endpoints
  getPending: (filters = {}) => 
    apiClient.get('/orders/pending', { params: filters }),

  approve: (id) => 
    apiClient.patch(`/orders/${id}/approve`),

  reject: (id, data) => 
    apiClient.patch(`/orders/${id}/reject`, data),

  selectSupplier: (id, data) => 
    apiClient.post(`/orders/${id}/select-supplier`, data),
};

// ============ Tenants Endpoints ============
export const tenantsAPI = {
  list: () =>
    apiClient.get('/tenants'),

  getOne: (id) => 
    apiClient.get(`/tenants/${id}`),
  
  create: (data) =>
    apiClient.post('/tenants', data),

  update: (id, data) => 
    apiClient.put(`/tenants/${id}`, data),

  delete: (id) =>
    apiClient.delete(`/tenants/${id}`),
};

// ============ Admin / Users Endpoints ============
export const usersAPI = {
  listAll: () =>
    apiClient.get('/users/all'),

  listTenant: () =>
    apiClient.get('/users/tenant'),

  create: (data) =>
    apiClient.post('/users/create', data),

  update: (id, data) =>
    apiClient.put(`/users/${id}`, data),

  delete: (id) =>
    apiClient.delete(`/users/${id}`),
};

export const depotsAPI = {
  list: () =>
    apiClient.get('/depots'),

  create: (data) =>
    apiClient.post('/depots', data),

  update: (id, data) =>
    apiClient.put(`/depots/${id}`, data),

  delete: (id) =>
    apiClient.delete(`/depots/${id}`),
};

export const adminAPI = {
  inviteTenantAdmin: (data) =>
    apiClient.post('/invite-admin', data),

  inviteUser: (data) =>
    apiClient.post('/invite-user', data),
};

// ============ Automation Endpoints ============

export const automationAPI = {
  // Build the multipart body and let axios set the boundary. Content-Type:
  // undefined removes the instance default ('application/json'), which is what
  // was breaking the upload.
  visionUpdate: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.post('/automation/vision-update', formData, {
      headers: { 'Content-Type': 'application/json' },
    });
},

  visionApply: (items) =>
    apiClient.post('/automation/vision-apply', { items }),

  getAlerts: () =>
    apiClient.get('/automation/alerts'),

  triggerN8n: (data) =>
    apiClient.post('/automation/trigger-n8n', data),
};

export default apiClient;
