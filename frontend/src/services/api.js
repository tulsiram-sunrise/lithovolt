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

// Public API instance (no auth headers, no auth redirect interceptor)
const publicApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

const redirectToLogin = () => {
  if (typeof window === 'undefined') {
    return
  }

  if (import.meta.env.MODE === 'test') {
    window.history.pushState({}, '', '/login')
    return
  }

  window.location.assign('/login')
}

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
    // Handle authentication errors
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      redirectToLogin()
      return Promise.reject(error)
    }

    // Handle entity access denial (403 Forbidden)
    if (error.response?.status === 403) {
      const errorMessage = error.response.data?.message || 'Access denied'
      
      // Create a more user-friendly error for entity access failures
      if (errorMessage.includes('permission')) {
        error.isEntityAccessDenial = true
        error.userFriendlyMessage = 'You do not have permission to access this resource'
      }
    }

    return Promise.reject(error)
  }
)

export default api

// Admin API
export const adminAPI = {
  getMetrics: () => api.get('/admin/metrics'),
  getOrderStats: () => api.get('/admin/orders/stats/'),
  getUserStats: () => api.get('/admin/users/stats/'),
  getWarrantyStats: () => api.get('/admin/warranties/stats/'),
  getTrends: (params) => api.get('/admin/trends/', { params }),
  exportData: (model) => api.get(`/admin/export/${model}/`),
  getRoles: (params) => api.get('/admin/roles', { params }),
  createRole: (data) => api.post('/admin/roles', data),
  updateRole: (id, data) => api.put(`/admin/roles/${id}`, data),
  deleteRole: (id) => api.delete(`/admin/roles/${id}`),
  getPermissions: (params) => api.get('/admin/permissions', { params }),
  createPermission: (data) => api.post('/admin/permissions', data),
  updatePermission: (id, data) => api.put(`/admin/permissions/${id}`, data),
  deletePermission: (id) => api.delete(`/admin/permissions/${id}`),
  bulkAssignPermissions: (data) => api.post('/admin/permissions/bulk-assign', data),
  getStaff: (params) => api.get('/admin/staff', { params }),
  createStaff: (data) => api.post('/admin/staff', data),
  updateStaff: (id, data) => api.put(`/admin/staff/${id}`, data),
  deleteStaff: (id) => api.delete(`/admin/staff/${id}`),
  getActivity: (params) => api.get('/admin/activity', { params }),
  getAudit: (params) => api.get('/admin/audit', { params }),
  inviteWholesaler: (data) => api.post('/users/invite-wholesaler', data),
}

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  verifyEmailToken: (token) => publicApi.get('/auth/verify-email/', { params: { token } }),
  sendOTP: (data) => api.post('/auth/otp/send', data),
  verifyOTP: (data) => api.post('/auth/otp/verify', data),
  profile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.patch('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  passwordResetRequest: (data) => api.post('/auth/password-reset', data),
  passwordResetConfirm: (data) => api.post('/auth/password-reset/confirm', data),
  refreshToken: (refresh) => api.post('/auth/refresh', { refresh }),
  logout: () => api.post('/auth/logout'),
}

// User API
export const userAPI = {
  getMe: () => api.get('/auth/profile'),
  updateProfile: (data) => api.patch('/users/update_profile', data),
  getUsers: (params) => api.get('/users', { params }),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.patch(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getWholesalers: () => api.get('/users/wholesalers'),
  toggleActive: (id) => api.post(`/users/${id}/toggle_active`),
  getWholesalerApplications: (params) => api.get('/users/wholesaler-applications', { params }),
  getWholesalerApplication: (id) => api.get(`/users/wholesaler-applications/${id}`),
  approveWholesalerApplication: (id, data) => api.post(`/users/wholesaler-applications/${id}/approve`, data),
  rejectWholesalerApplication: (id, data) => api.post(`/users/wholesaler-applications/${id}/reject`, data),
  submitWholesalerApplication: (data) => api.post('/users/wholesaler-applications', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
}

// Inventory API
export const inventoryAPI = {
  getCatalogItems: (params) => api.get('/inventory/catalog', { params }),
  getCatalogItem: (id) => api.get(`/inventory/catalog/${id}`),
  getCatalogSummary: () => api.get('/inventory/catalog/summary/'),
  createCatalogItem: (data) => api.post('/inventory/catalog/', data),
  updateCatalogItem: (id, data) => api.put(`/inventory/catalog/${id}/`, data),
  deleteCatalogItem: (id) => api.delete(`/inventory/catalog/${id}/`),

  getBatteryModels: (params) => api.get('/inventory/models', { params }),
  getBatteryModel: (id) => api.get(`/inventory/models/${id}`),
  createBatteryModel: (data) => api.post('/inventory/models', data),
  updateBatteryModel: (id, data) => api.patch(`/inventory/models/${id}`, data),
  deleteBatteryModel: (id) => api.delete(`/inventory/models/${id}`),

  getAccessories: (params) => api.get('/inventory/accessories', { params }),
  createAccessory: (data) => api.post('/inventory/accessories', data),
  updateAccessory: (id, data) => api.patch(`/inventory/accessories/${id}`, data),
  deleteAccessory: (id) => api.delete(`/inventory/accessories/${id}`),

  getCategories: (params) => api.get('/inventory/categories', { params }),
  createCategory: (data) => api.post('/inventory/categories', data),
  updateCategory: (id, data) => api.patch(`/inventory/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/inventory/categories/${id}`),

  getProducts: (params) => api.get('/inventory/products', { params }),
  createProduct: (data) => api.post('/inventory/products', data),
  updateProduct: (id, data) => api.patch(`/inventory/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/inventory/products/${id}`),
  
  getSerials: (params) => api.get('/inventory/serials', { params }),
  generateSerials: (data) => api.post('/inventory/serials/generate', data),
  getAllocations: (params) => api.get('/inventory/allocations', { params }),
  allocateStock: (data) => api.post('/inventory/allocations', data),
}

// Order API
export const orderAPI = {
  getOrders: (params) => api.get('/orders', { params }),
  createOrder: (data) => api.post('/orders', data),
  getOrder: (id) => api.get(`/orders/${id}`),
  updateOrder: (id, data) => api.patch(`/orders/${id}`, data),
  acceptOrder: (id) => api.post(`/orders/${id}/accept`),
  rejectOrder: (id) => api.post(`/orders/${id}/reject`),
  fulfillOrder: (id) => api.post(`/orders/${id}/fulfill`),
  getInvoice: (id) => api.get(`/orders/${id}/invoice`, { responseType: 'blob' }),
}

// Warranty API
export const warrantyAPI = {
  getWarranties: (params) => api.get('/warranties/', { params }),
  claimWarranty: (data) => api.post('/warranty-claims/', data),
  issueWarranty: (data) => api.post('/warranties/', data),
  verifyWarranty: (serial) => api.get(`/warranties/verify/${serial}/`),
  getCertificate: (id) => api.get(`/warranties/${id}/certificate/`, { responseType: 'blob' }),
  getWarrantyClaims: (params) => api.get('/warranty-claims/', { params }),
  createClaim: (data) => api.post('/warranty-claims/', data),
}

// Public fitment lookup API
export const fitmentAPI = {
  registrationLookup: (data) => api.post('/fitment/registration-lookup/', data),
  vehicleLookup: (data) => api.post('/fitment/vehicle-lookup/', data),
}

export const publicCatalogAPI = {
  getBatteryModels: (params) => publicApi.get('/catalog/models/', { params }),
}
