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
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;

// API methods
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  sendOTP: (data) => api.post('/auth/otp/send/', data),
  verifyOTP: (data) => api.post('/auth/otp/verify/', data),
};

export const inventoryAPI = {
  getInventory: (params) => api.get('/inventory/serials/', { params }),
  allocateStock: (data) => api.post('/inventory/allocate/', data),
};

export const warrantyAPI = {
  activateWarranty: (data) => api.post('/warranty/activate/', data),
  verifyWarranty: (serial) => api.get(`/warranty/verify/${serial}/`),
  getWarranties: (params) => api.get('/warranty/', { params }),
};
