import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import {
  authAPI,
  userAPI,
  inventoryAPI,
  orderAPI,
  warrantyAPI,
  adminAPI,
} from './api'

vi.mock('axios')

describe('API Services', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('authAPI', () => {
    it('calls login endpoint', async () => {
      const credentials = { email: 'test@example.com', password: 'password' }
      const mockResponse = { data: { token: 'jwt-token', user: {} } }
      axios.create().post = vi.fn(() => Promise.resolve(mockResponse))

      const result = await authAPI.login(credentials)

      expect(result.data).toEqual(mockResponse.data)
    })

    it('calls register endpoint', async () => {
      const userData = { email: 'new@example.com', password: 'pass123' }
      axios.create().post = vi.fn(() => Promise.resolve({ data: {} }))

      await authAPI.register(userData)

      expect(axios.create().post).toHaveBeenCalledWith('/auth/register/', userData)
    })
  })

  describe('inventoryAPI', () => {
    it('fetches battery models with params', async () => {
      const params = { ordering: '-created_at' }
      axios.create().get = vi.fn(() => Promise.resolve({ data: { results: [] } }))

      await inventoryAPI.getBatteryModels(params)

      expect(axios.create().get).toHaveBeenCalledWith('/inventory/models/', {
        params,
      })
    })

    it('creates battery model', async () => {
      const modelData = { name: 'LV 150Ah', sku: 'LV-150' }
      axios.create().post = vi.fn(() => Promise.resolve({ data: modelData }))

      await inventoryAPI.createBatteryModel(modelData)

      expect(axios.create().post).toHaveBeenCalledWith(
        '/inventory/models/',
        modelData
      )
    })

    it('allocates stock', async () => {
      const allocationData = {
        battery_model_id: 1,
        wholesaler_id: 2,
        quantity: 10,
      }
      axios.create().post = vi.fn(() => Promise.resolve({ data: {} }))

      await inventoryAPI.allocateStock(allocationData)

      expect(axios.create().post).toHaveBeenCalledWith(
        '/inventory/allocations/',
        allocationData
      )
    })
  })

  describe('orderAPI', () => {
    it('fetches orders', async () => {
      axios.create().get = vi.fn(() => Promise.resolve({ data: { results: [] } }))

      await orderAPI.getOrders({ status: 'PENDING' })

      expect(axios.create().get).toHaveBeenCalledWith('/orders/', {
        params: { status: 'PENDING' },
      })
    })

    it('creates order', async () => {
      const orderData = { items: [], notes: '' }
      axios.create().post = vi.fn(() => Promise.resolve({ data: {} }))

      await orderAPI.createOrder(orderData)

      expect(axios.create().post).toHaveBeenCalledWith('/orders/', orderData)
    })

    it('accepts order', async () => {
      axios.create().post = vi.fn(() => Promise.resolve({ data: {} }))

      await orderAPI.acceptOrder(1)

      expect(axios.create().post).toHaveBeenCalledWith('/orders/1/accept/')
    })

    it('rejects order', async () => {
      axios.create().post = vi.fn(() => Promise.resolve({ data: {} }))

      await orderAPI.rejectOrder(1)

      expect(axios.create().post).toHaveBeenCalledWith('/orders/1/reject/')
    })

    it('fulfills order', async () => {
      axios.create().post = vi.fn(() => Promise.resolve({ data: {} }))

      await orderAPI.fulfillOrder(1)

      expect(axios.create().post).toHaveBeenCalledWith('/orders/1/fulfill/')
    })
  })

  describe('warrantyAPI', () => {
    it('claims warranty', async () => {
      const claimData = {
        serial_number: 'LV000001',
        consumer_email: 'test@example.com',
      }
      axios.create().post = vi.fn(() => Promise.resolve({ data: {} }))

      await warrantyAPI.claimWarranty(claimData)

      expect(axios.create().post).toHaveBeenCalledWith(
        '/warranty/claim/',
        claimData
      )
    })

    it('issues warranty', async () => {
      const issueData = {
        serial_number: 'LV000001',
        consumer_email: 'test@example.com',
      }
      axios.create().post = vi.fn(() => Promise.resolve({ data: {} }))

      await warrantyAPI.issueWarranty(issueData)

      expect(axios.create().post).toHaveBeenCalledWith(
        '/warranty/issue/',
        issueData
      )
    })

    it('gets certificate with blob response type', async () => {
      axios.create().get = vi.fn(() => Promise.resolve({ data: new Blob() }))

      await warrantyAPI.getCertificate(1)

      expect(axios.create().get).toHaveBeenCalledWith(
        '/warranty/1/certificate/',
        { responseType: 'blob' }
      )
    })
  })

  describe('adminAPI', () => {
    it('fetches admin metrics', async () => {
      const mockMetrics = {
        users_by_role: {},
        orders_by_status: {},
      }
      axios.create().get = vi.fn(() => Promise.resolve({ data: mockMetrics }))

      await adminAPI.getMetrics()

      expect(axios.create().get).toHaveBeenCalledWith('/admin/metrics/')
    })
  })

  describe('userAPI', () => {
    it('toggles user active status', async () => {
      axios.create().post = vi.fn(() => Promise.resolve({ data: {} }))

      await userAPI.toggleActive(5)

      expect(axios.create().post).toHaveBeenCalledWith('/users/5/toggle_active/')
    })

    it('gets wholesaler applications', async () => {
      axios.create().get = vi.fn(() => Promise.resolve({ data: { results: [] } }))

      await userAPI.getWholesalerApplications({ status: 'PENDING' })

      expect(axios.create().get).toHaveBeenCalledWith(
        '/users/wholesaler-applications/',
        { params: { status: 'PENDING' } }
      )
    })

    it('approves wholesaler application', async () => {
      axios.create().post = vi.fn(() => Promise.resolve({ data: {} }))

      await userAPI.approveWholesalerApplication(1, { notes: 'Approved' })

      expect(axios.create().post).toHaveBeenCalledWith(
        '/users/wholesaler-applications/1/approve/',
        { notes: 'Approved' }
      )
    })
  })
})
