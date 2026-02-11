import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { inventoryAPI } from '../../services/api'
import { useToastStore } from '../../store/toastStore'

export default function BatteryModelsPage() {
  const [form, setForm] = useState({
    name: '',
    sku: '',
    warranty_months: '',
  })
  const queryClient = useQueryClient()
  const addToast = useToastStore((state) => state.addToast)

  const { data, isLoading } = useQuery({
    queryKey: ['battery-models'],
    queryFn: () => inventoryAPI.getBatteryModels({ ordering: '-created_at' }),
    select: (response) => response.data,
  })

  const createModel = useMutation({
    mutationFn: (payload) => inventoryAPI.createBatteryModel(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['battery-models'] })
      setForm({ name: '', sku: '', warranty_months: '' })
      addToast({ type: 'success', title: 'Battery model created', message: 'New battery model added successfully.' })
    },
    onError: (error) => {
      addToast({ type: 'error', title: 'Creation failed', message: error.response?.data?.detail || 'Unable to create battery model.' })
    },
  })

  const models = Array.isArray(data) ? data : data?.results || []

  const handleSubmit = (event) => {
    event.preventDefault()
    createModel.mutate({
      name: form.name,
      sku: form.sku,
      warranty_months: Number(form.warranty_months || 0),
      is_active: true,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold neon-title">Battery Models</h1>
          <p className="text-[color:var(--muted)]">Maintain the master catalog.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="panel-card p-6 grid gap-4 md:grid-cols-4">
        <div>
          <label htmlFor="model-name" className="field-label">Model Name</label>
          <input id="model-name" className="neon-input" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
        </div>
        <div>
          <label htmlFor="model-sku" className="field-label">SKU</label>
          <input id="model-sku" className="neon-input" value={form.sku} onChange={(e) => setForm((prev) => ({ ...prev, sku: e.target.value }))} />
        </div>
        <div>
          <label htmlFor="model-warranty" className="field-label">Warranty (months)</label>
          <input id="model-warranty" className="neon-input" type="number" value={form.warranty_months} onChange={(e) => setForm((prev) => ({ ...prev, warranty_months: e.target.value }))} />
        </div>
        <div className="flex items-end">
          <button type="submit" className="neon-btn" disabled={createModel.isLoading}>
            {createModel.isLoading ? 'Saving...' : 'Add Model'}
          </button>
        </div>
      </form>

      <div className="panel-card p-6">
        <div className="mt-2 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Model</th>
                <th>SKU</th>
                <th>Available</th>
                <th>Warranty</th>
              </tr>
            </thead>
            <tbody>
              {(isLoading ? [] : models).map((model) => (
                <tr key={model.id}>
                  <td>{model.name}</td>
                  <td>{model.sku}</td>
                  <td>{model.available_stock ?? 0}</td>
                  <td>{model.warranty_months} mo</td>
                </tr>
              ))}
            </tbody>
          </table>
          {isLoading ? <p className="mt-3 text-sm text-[color:var(--muted)]">Loading models...</p> : null}
        </div>
      </div>
    </div>
  )
}
