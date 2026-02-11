import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

export function TestWrapper({ children, queryClient }) {
  const client = queryClient || createTestQueryClient()

  return (
    <QueryClientProvider client={client}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export const mockUser = {
  id: 1,
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  role: 'ADMIN',
  is_active: true,
}

export const mockWholesaler = {
  ...mockUser,
  id: 2,
  email: 'wholesaler@example.com',
  role: 'WHOLESALER',
}

export const mockConsumer = {
  ...mockUser,
  id: 3,
  email: 'consumer@example.com',
  role: 'CONSUMER',
}

export const mockBatteryModel = {
  id: 1,
  name: 'LV 150Ah',
  sku: 'LV-150',
  warranty_months: 24,
  total_stock: 100,
  available_stock: 50,
  allocated_stock: 30,
  sold_stock: 20,
}

export const mockOrder = {
  id: 1,
  consumer_name: 'Test Wholesaler',
  consumer_email: 'wholesaler@example.com',
  status: 'PENDING',
  total_items: 5,
  items: [
    {
      id: 1,
      product_type: 'BATTERY_MODEL',
      battery_model_name: 'LV 150Ah',
      quantity: 5,
    },
  ],
  created_at: '2026-02-11T10:00:00Z',
}

export const mockWarranty = {
  id: 1,
  warranty_number: 'WAR-2026-001',
  serial: 'LV000001',
  battery_model_name: 'LV 150Ah',
  consumer_name: 'Test Consumer',
  status: 'ACTIVE',
  issued_at: '2026-02-11T10:00:00Z',
}
