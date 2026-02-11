import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { inventoryAPI, userAPI } from '../../services/api'
import { useToastStore } from '../../store/toastStore'

export default function InventoryPage() {
  const [allocation, setAllocation] = useState({ battery_model_id: '', wholesaler_id: '', quantity: '' })
  const queryClient = useQueryClient()
  const addToast = useToastStore((state) => state.addToast)

  const { data: modelsData } = useQuery({
    queryKey: ['admin-models'],
    queryFn: () => inventoryAPI.getBatteryModels({ ordering: '-created_at' }),
    select: (response) => response.data,
  })

  const { data: allocationsData, isLoading: allocationsLoading } = useQuery({
    queryKey: ['admin-allocations'],
    queryFn: () => inventoryAPI.getAllocations({ ordering: '-created_at' }),
    select: (response) => response.data,
  })

  const { data: wholesalersData } = useQuery({
    queryKey: ['admin-wholesalers'],
    queryFn: () => userAPI.getWholesalers(),
    select: (response) => response.data,
  })

  const allocateStock = useMutation({
    mutationFn: (payload) => inventoryAPI.allocateStock(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-allocations'] })
      setAllocation({ battery_model_id: '', wholesaler_id: '', quantity: '' })
      addToast({ type: 'success', title: 'Stock allocated', message: 'Serial numbers allocated to wholesaler.' })
    },
    onError: (error) => {
      addToast({ type: 'error', title: 'Allocation failed', message: error.response?.data?.error || 'Unable to allocate stock.' })
    },
  })

  const models = Array.isArray(modelsData) ? modelsData : modelsData?.results || []
  const allocations = Array.isArray(allocationsData) ? allocationsData : allocationsData?.results || []
  const wholesalers = Array.isArray(wholesalersData) ? wholesalersData : wholesalersData?.results || []

  const totals = useMemo(() => {
    const available = models.reduce((sum, item) => sum + (item.available_stock || 0), 0)
    const allocated = models.reduce((sum, item) => sum + (item.allocated_stock || 0), 0)
    return { available, allocated }
  }, [models])

  const handleSubmit = (event) => {
    event.preventDefault()
    allocateStock.mutate({
      battery_model_id: Number(allocation.battery_model_id),
      wholesaler_id: Number(allocation.wholesaler_id),
      quantity: Number(allocation.quantity || 0),
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold neon-title">Inventory</h1>
        <p className="text-[color:var(--muted)]">Track stock and allocations.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="stat-card">
          <p className="stat-label">Available Units</p>
          <p className="stat-value">{totals.available}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Allocated Units</p>
          <p className="stat-value">{totals.allocated}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Low Stock Alerts</p>
          <p className="stat-value">{models.filter((item) => (item.available_stock || 0) <= (item.low_stock_threshold || 0)).length}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="panel-card p-6 grid gap-4 md:grid-cols-4">
        <div>
          <label className="field-label">Battery Model</label>
          <select
            className="neon-input"
            value={allocation.battery_model_id}
            onChange={(event) => setAllocation((prev) => ({ ...prev, battery_model_id: event.target.value }))}
          >
            <option value="">Select model</option>
            {models.map((model) => (
              <option key={model.id} value={model.id}>{model.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label">Wholesaler</label>
          <select
            className="neon-input"
            value={allocation.wholesaler_id}
            onChange={(event) => setAllocation((prev) => ({ ...prev, wholesaler_id: event.target.value }))}
          >
            <option value="">Select wholesaler</option>
            {wholesalers.map((wholesaler) => (
              <option key={wholesaler.id} value={wholesaler.id}>{wholesaler.company_name || wholesaler.full_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label">Quantity</label>
          <input
            className="neon-input"
            type="number"
            value={allocation.quantity}
            onChange={(event) => setAllocation((prev) => ({ ...prev, quantity: event.target.value }))}
          />
        </div>
        <div className="flex items-end">
          <button className="neon-btn" type="submit" disabled={allocateStock.isLoading}>
            {allocateStock.isLoading ? 'Allocating...' : 'Allocate'}
          </button>
        </div>
      </form>

      <div className="panel-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Latest Allocations</h2>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Battery Model</th>
                <th>Wholesaler</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {(allocationsLoading ? [] : allocations).map((allocationItem) => (
                <tr key={allocationItem.id}>
                  <td>{allocationItem.battery_model_name}</td>
                  <td>{allocationItem.wholesaler_email}</td>
                  <td>{allocationItem.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {allocationsLoading ? <p className="mt-3 text-sm text-[color:var(--muted)]">Loading allocations...</p> : null}
        </div>
      </div>
    </div>
  )
}
