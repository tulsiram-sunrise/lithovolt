import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockClient, mockCreate } = vi.hoisted(() => {
  const client = {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  }

  return {
    mockClient: client,
    mockCreate: vi.fn(() => client),
  }
})

vi.mock('axios', () => ({
  default: { create: mockCreate },
  create: mockCreate,
}))

import axios from 'axios'
import {
  authAPI,
  userAPI,
  inventoryAPI,
  orderAPI,
  warrantyAPI,
  adminAPI,
} from './api'

describe('API Services', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    axios.create.mockReturnValue(mockClient)
    mockClient.get.mockReset()
    mockClient.post.mockReset()
    mockClient.patch.mockReset()
    mockClient.put.mockReset()
    mockClient.delete.mockReset()
  })

  describe('authAPI', () => {
    it('calls login endpoint', async () => {
      const credentials = { email: 'test@example.com', password: 'password' }
      const mockResponse = { data: { token: 'jwt-token', user: {} } }
      mockClient.post.mockResolvedValue(mockResponse)

      const result = await authAPI.login(credentials)

      expect(result.data).toEqual(mockResponse.data)
    })

    it('calls register endpoint', async () => {
      const userData = { email: 'new@example.com', password: 'pass123' }
      mockClient.post.mockResolvedValue({ data: {} })

      await authAPI.register(userData)

      expect(mockClient.post).toHaveBeenCalledWith('/auth/register', userData)
    })
  })

  describe('inventoryAPI', () => {
    it('fetches battery models with params', async () => {
      const params = { ordering: '-created_at' }
      mockClient.get.mockResolvedValue({ data: { results: [] } })

      await inventoryAPI.getBatteryModels(params)

      expect(mockClient.get).toHaveBeenCalledWith('/inventory/models', {
        params,
      })
    })

    it('creates battery model', async () => {
      const modelData = { name: 'LV 150Ah', sku: 'LV-150' }
      mockClient.post.mockResolvedValue({ data: modelData })

      await inventoryAPI.createBatteryModel(modelData)

      expect(mockClient.post).toHaveBeenCalledWith(
        '/inventory/models',
        modelData
      )
    })

    it('allocates stock', async () => {
      const allocationData = {
        battery_model_id: 1,
        wholesaler_id: 2,
        quantity: 10,
      }
      mockClient.post.mockResolvedValue({ data: {} })

      await inventoryAPI.allocateStock(allocationData)

      expect(mockClient.post).toHaveBeenCalledWith(
        '/inventory/allocations',
        allocationData
      )
    })
  })

  describe('orderAPI', () => {
    it('fetches orders', async () => {
      mockClient.get.mockResolvedValue({ data: { results: [] } })

      await orderAPI.getOrders({ status: 'PENDING' })

      expect(mockClient.get).toHaveBeenCalledWith('/orders', {
        params: { status: 'PENDING' },
      })
    })

    it('creates order', async () => {
      const orderData = { items: [], notes: '' }
      mockClient.post.mockResolvedValue({ data: {} })

      await orderAPI.createOrder(orderData)

      expect(mockClient.post).toHaveBeenCalledWith('/orders', orderData)
    })

    it('accepts order', async () => {
      mockClient.post.mockResolvedValue({ data: {} })

      await orderAPI.acceptOrder(1)

      expect(mockClient.post).toHaveBeenCalledWith('/orders/1/accept')
    })

    it('rejects order', async () => {
      mockClient.post.mockResolvedValue({ data: {} })

      await orderAPI.rejectOrder(1)

      expect(mockClient.post).toHaveBeenCalledWith('/orders/1/reject', {})
    })

    it('cancels order', async () => {
      mockClient.post.mockResolvedValue({ data: {} })

      await orderAPI.cancelOrder(1)

      expect(mockClient.post).toHaveBeenCalledWith('/orders/1/cancel', {})
    })

    it('fulfills order', async () => {
      mockClient.post.mockResolvedValue({ data: {} })

      await orderAPI.fulfillOrder(1)

      expect(mockClient.post).toHaveBeenCalledWith('/orders/1/fulfill')
    })
  })

  describe('warrantyAPI', () => {
    it('claims warranty', async () => {
      const claimData = {
        serial_number: 'LV000001',
        consumer_email: 'test@example.com',
      }
      mockClient.post.mockResolvedValue({ data: {} })

      await warrantyAPI.claimWarranty(claimData)

      expect(mockClient.post).toHaveBeenCalledWith(
        '/warranty-claims/',
        claimData
      )
    })

    it('issues warranty', async () => {
      const issueData = {
        serial_number: 'LV000001',
        consumer_email: 'test@example.com',
      }
      mockClient.post.mockResolvedValue({ data: {} })

      await warrantyAPI.issueWarranty(issueData)

      expect(mockClient.post).toHaveBeenCalledWith(
        '/warranties/',
        issueData
      )
    })

    it('gets certificate with blob response type', async () => {
      mockClient.get.mockResolvedValue({ data: new Blob() })

      await warrantyAPI.getCertificate(1)

      expect(mockClient.get).toHaveBeenCalledWith(
        '/warranties/1/certificate/',
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
      mockClient.get.mockResolvedValue({ data: mockMetrics })

      await adminAPI.getMetrics()

      expect(mockClient.get).toHaveBeenCalledWith('/admin/metrics')
    })
  })

  describe('userAPI', () => {
    it('toggles user active status', async () => {
      mockClient.post.mockResolvedValue({ data: {} })

      await userAPI.toggleActive(5)

      expect(mockClient.post).toHaveBeenCalledWith('/users/5/toggle_active')
    })

    it('gets wholesaler applications', async () => {
      mockClient.get.mockResolvedValue({ data: { results: [] } })

      await userAPI.getWholesalerApplications({ status: 'PENDING' })

      expect(mockClient.get).toHaveBeenCalledWith(
        '/users/wholesaler-applications',
        { params: { status: 'PENDING' } }
      )
    })

    it('approves wholesaler application', async () => {
      mockClient.post.mockResolvedValue({ data: {} })

      await userAPI.approveWholesalerApplication(1, { notes: 'Approved' })

      expect(mockClient.post).toHaveBeenCalledWith(
        '/users/wholesaler-applications/1/approve',
        { notes: 'Approved' }
      )
    })
  })
})
