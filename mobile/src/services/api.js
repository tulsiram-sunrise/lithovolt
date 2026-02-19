import axios from 'axios';
import Constants from 'expo-constants';
import { useAuthStore } from '../store/authStore';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token = null) => {
  refreshQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  refreshQueue = [];
};

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const { refreshToken, setAuth, logout } = useAuthStore.getState();

    if (status === 401 && refreshToken && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await api.post('/auth/refresh/', { refresh: refreshToken });
        const newAccess = response.data.access;
        const currentUser = useAuthStore.getState().user;
        setAuth(currentUser, newAccess, refreshToken);
        processQueue(null, newAccess);
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (status === 401) {
      logout();
    }

    return Promise.reject(error);
  }
);

export default api;

// API methods
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (data) => api.post('/auth/register/', data),
  sendOTP: (data) => api.post('/auth/otp/send/', data),
  verifyOTP: (data) => api.post('/auth/otp/verify/', data),
  passwordResetRequest: (data) => api.post('/auth/password-reset/', data),
  passwordResetConfirm: (data) => api.post('/auth/password-reset/confirm/', data),
  refresh: (data) => api.post('/auth/refresh/', data),
};

export const userAPI = {
  getMe: () => api.get('/users/me/'),
  updateProfile: (data) => api.patch('/users/update_profile/', data),
  getWholesalerApplication: () => api.get('/users/wholesaler-applications/me/'),
  submitWholesalerApplication: (formData) =>
    api.post('/users/wholesaler-applications/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const inventoryAPI = {
  getModels: (params) => api.get('/inventory/models/', { params }),
  getAccessories: (params) => api.get('/inventory/accessories/', { params }),
  getCategories: (params) => api.get('/inventory/categories/', { params }),
  getProducts: (params) => api.get('/inventory/products/', { params }),
  getInventory: (params) => api.get('/inventory/serials/', { params }),
  getAllocations: (params) => api.get('/inventory/allocations/', { params }),
  allocateStock: (data) => api.post('/inventory/allocate/', data),
};

export const ordersAPI = {
  getOrders: (params) => api.get('/orders/', { params }),
  getOrder: (id) => api.get(`/orders/${id}/`),
  getOrderItems: (id) => api.get(`/orders/${id}/items/`),
  createOrder: (data) => api.post('/orders/', data),
  acceptOrder: (id) => api.post(`/orders/${id}/accept/`),
  rejectOrder: (id) => api.post(`/orders/${id}/reject/`),
  fulfillOrder: (id) => api.post(`/orders/${id}/fulfill/`),
};

export const warrantyAPI = {
  activateWarranty: (data) => api.post('/warranty/claim/', data),
  verifyWarranty: (serial) => api.get(`/warranty/verify/${serial}/`),
  getWarranties: (params) => api.get('/warranty/', { params }),
  getClaims: (params) => api.get('/warranty/claims/', { params }),
  createClaim: (data, config) => api.post('/warranty/claims/', data, config),
  issueWarranty: (data) => api.post('/warranty/issue/', data),
};
