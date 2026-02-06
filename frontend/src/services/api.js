import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  sendOTP: (data) => api.post('/auth/otp/send/', data),
  verifyOTP: (data) => api.post('/auth/otp/verify/', data),
  refreshToken: (refresh) => api.post('/auth/refresh/', { refresh }),
  logout: () => api.post('/auth/logout/'),
}

// User API
export const userAPI = {
  getMe: () => api.get('/users/me/'),
  updateProfile: (data) => api.patch('/users/update_profile/', data),
  getUsers: (params) => api.get('/users/', { params }),
  createUser: (data) => api.post('/users/', data),
  updateUser: (id, data) => api.patch(`/users/${id}/`, data),
  deleteUser: (id) => api.delete(`/users/${id}/`),
  getWholesalers: () => api.get('/users/wholesalers/'),
}

// Inventory API
export const inventoryAPI = {
  getBatteryModels: (params) => api.get('/inventory/models/', { params }),
  createBatteryModel: (data) => api.post('/inventory/models/', data),
  updateBatteryModel: (id, data) => api.patch(`/inventory/models/${id}/`, data),
  deleteBatteryModel: (id) => api.delete(`/inventory/models/${id}/`),
  
  getSerials: (params) => api.get('/inventory/serials/', { params }),
  generateSerials: (data) => api.post('/inventory/serials/generate/', data),
  allocateStock: (data) => api.post('/inventory/allocate/', data),
}

// Order API
export const orderAPI = {
  getOrders: (params) => api.get('/orders/', { params }),
  createOrder: (data) => api.post('/orders/', data),
  getOrder: (id) => api.get(`/orders/${id}/`),
  updateOrder: (id, data) => api.patch(`/orders/${id}/`, data),
  approveOrder: (id) => api.post(`/orders/${id}/approve/`),
  getInvoice: (id) => api.get(`/orders/${id}/invoice/`, { responseType: 'blob' }),
}

// Warranty API
export const warrantyAPI = {
  getWarranties: (params) => api.get('/warranty/', { params }),
  activateWarranty: (data) => api.post('/warranty/activate/', data),
  verifyWarranty: (serial) => api.get(`/warranty/verify/${serial}/`),
  getCertificate: (id) => api.get(`/warranty/${id}/certificate/`, { responseType: 'blob' }),
  getWarrantyClaims: (params) => api.get('/warranty/claims/', { params }),
  createClaim: (data) => api.post('/warranty/claims/', data),
}
