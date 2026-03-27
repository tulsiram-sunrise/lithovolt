import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryAPI } from '../../services/api'
import { useToastStore } from '../../store/toastStore'

const initialForm = {
  name: '',
  brand: '',
  series: '',
  description: '',
  sku: '',
  model_code: '',
  group_size: '',
  voltage: '',
  capacity: '',
  chemistry: '',
  battery_type: '',
  cca: '',
  reserve_capacity: '',
  capacity_ah: '',
  length_mm: '',
  width_mm: '',
  height_mm: '',
  total_height_mm: '',
  terminal_type: '',
  terminal_layout: '',
  hold_down: '',
  vent_type: '',
  maintenance_free: false,
  private_warranty_months: '',
  commercial_warranty_months: '',
  unit_weight_kg: '',
  datasheet_url: '',
  application_segment: '',
  specs_text: '',
  total_quantity: '',
  available_quantity: '',
  price: '',
  warranty_months: '',
  status: 'active',
}

const asNumber = (value) => (value === '' ? undefined : Number(value))
const asInteger = (value) => (value === '' ? undefined : parseInt(value, 10))

export default function BatteryModelCreatePage() {
  const [form, setForm] = useState(initialForm)
  const [formError, setFormError] = useState('')
  const queryClient = useQueryClient()
  const addToast = useToastStore((state) => state.addToast)
  const navigate = useNavigate()

  const createModel = useMutation({
    mutationFn: (payload) => inventoryAPI.createCatalogItem(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['battery-models'] })
      addToast({ type: 'success', title: 'Battery model created', message: 'New battery model added successfully.' })
      navigate('/admin/battery-models')
    },
    onError: (error) => {
      const details = error.response?.data?.errors || error.response?.data?.details
      if (details && typeof details === 'object') {
        const firstError = Object.values(details)[0]
        if (Array.isArray(firstError) && firstError.length > 0) {
          setFormError(firstError[0])
          return
        }
      }
      setFormError(error.response?.data?.message || error.response?.data?.error || 'Unable to create battery model.')
    },
  })

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setFormError('')

    const totalQty = asInteger(form.total_quantity) ?? 0
    const availableQty = asInteger(form.available_quantity) ?? 0
    if (availableQty > totalQty) {
      setFormError('Available quantity cannot be greater than total quantity.')
      return
    }

    let specs
    if (form.specs_text.trim()) {
      try {
        specs = JSON.parse(form.specs_text)
        if (Array.isArray(specs) || typeof specs !== 'object' || specs === null) {
          setFormError('Specs must be a valid JSON object.')
          return
        }
      } catch {
        setFormError('Specs must be valid JSON.')
        return
      }
    }

    createModel.mutate({
      product_type: 'BATTERY',
      name: form.name,
      brand: form.brand || undefined,
      series: form.series || undefined,
      description: form.description || undefined,
      sku: form.sku,
      model_code: form.model_code || undefined,
      group_size: form.group_size || undefined,
      voltage: Number(form.voltage || 0),
      capacity: Number(form.capacity || 0),
      chemistry: form.chemistry || undefined,
      battery_type: form.battery_type || undefined,
      cca: asInteger(form.cca),
      reserve_capacity: asInteger(form.reserve_capacity),
      capacity_ah: asNumber(form.capacity_ah),
      length_mm: asNumber(form.length_mm),
      width_mm: asNumber(form.width_mm),
      height_mm: asNumber(form.height_mm),
      total_height_mm: asNumber(form.total_height_mm),
      terminal_type: form.terminal_type || undefined,
      terminal_layout: form.terminal_layout || undefined,
      hold_down: form.hold_down || undefined,
      vent_type: form.vent_type || undefined,
      maintenance_free: form.maintenance_free,
      private_warranty_months: asInteger(form.private_warranty_months),
      commercial_warranty_months: asInteger(form.commercial_warranty_months),
      unit_weight_kg: asNumber(form.unit_weight_kg),
      datasheet_url: form.datasheet_url || undefined,
      application_segment: form.application_segment || undefined,
      specs,
      total_quantity: totalQty,
      available_quantity: availableQty,
      price: Number(form.price || 0),
      low_stock_threshold: 5,
      warranty_months: asInteger(form.warranty_months) ?? 0,
      default_warranty_months: asInteger(form.warranty_months) ?? 0,
      status: form.status,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold neon-title">Add Battery Model</h1>
          <p className="text-[color:var(--muted)]">Create a model with complete specification fields.</p>
        </div>
        <Link className="neon-btn-secondary" to="/admin/battery-models">Back To List</Link>
      </div>

      <form className="panel-card p-6 space-y-6" onSubmit={handleSubmit}>
        {/* Basic Information Section */}
        <div>
          <h3 className="mb-6 text-base font-bold uppercase text-[color:var(--text-primary)] tracking-wider">Basic Information</h3>
          <div className="grid gap-4 md:grid-cols-4">
            <Field label="Name" name="name" value={form.name} onChange={handleChange} required />
            <Field label="SKU" name="sku" value={form.sku} onChange={handleChange} required />
            <Field label="Brand" name="brand" value={form.brand} onChange={handleChange} />
            <Field label="Series" name="series" value={form.series} onChange={handleChange} />
            <Field label="Model Code" name="model_code" value={form.model_code} onChange={handleChange} />
            <Field label="Group Size" name="group_size" value={form.group_size} onChange={handleChange} />
          </div>
        </div>

        <div className="border-t border-[color:var(--border)]"></div>

        {/* Electrical Specifications */}
        <div>
          <h3 className="mb-6 text-base font-bold uppercase text-[color:var(--text-primary)] tracking-wider">Electrical Specifications</h3>
          <div className="grid gap-4 md:grid-cols-4">
            <Field label="Voltage" name="voltage" type="number" step="0.01" value={form.voltage} onChange={handleChange} required />
            <Field label="Capacity" name="capacity" type="number" step="0.01" value={form.capacity} onChange={handleChange} required />
            <Field label="Capacity (Ah)" name="capacity_ah" type="number" step="0.01" value={form.capacity_ah} onChange={handleChange} />
            <Field label="Chemistry" name="chemistry" value={form.chemistry} onChange={handleChange} />
            <Field label="Battery Type" name="battery_type" value={form.battery_type} onChange={handleChange} />
            <Field label="CCA" name="cca" type="number" value={form.cca} onChange={handleChange} />
            <Field label="Reserve Capacity" name="reserve_capacity" type="number" value={form.reserve_capacity} onChange={handleChange} />
          </div>
        </div>

        <div className="border-t border-[color:var(--border)]"></div>

        {/* Physical Dimensions */}
        <div>
          <h3 className="mb-6 text-base font-bold uppercase text-[color:var(--text-primary)] tracking-wider">Physical Dimensions</h3>
          <div className="grid gap-4 md:grid-cols-4">
            <Field label="Length (mm)" name="length_mm" type="number" step="0.01" value={form.length_mm} onChange={handleChange} />
            <Field label="Width (mm)" name="width_mm" type="number" step="0.01" value={form.width_mm} onChange={handleChange} />
            <Field label="Height (mm)" name="height_mm" type="number" step="0.01" value={form.height_mm} onChange={handleChange} />
            <Field label="Total Height (mm)" name="total_height_mm" type="number" step="0.01" value={form.total_height_mm} onChange={handleChange} />
            <Field label="Unit Weight (kg)" name="unit_weight_kg" type="number" step="0.01" value={form.unit_weight_kg} onChange={handleChange} />
          </div>
        </div>

        <div className="border-t border-[color:var(--border)]"></div>

        {/* Terminal & Configuration */}
        <div>
          <h3 className="mb-6 text-base font-bold uppercase text-[color:var(--text-primary)] tracking-wider">Terminal & Configuration</h3>
          <div className="grid gap-4 md:grid-cols-4">
            <Field label="Terminal Type" name="terminal_type" value={form.terminal_type} onChange={handleChange} />
            <Field label="Terminal Layout" name="terminal_layout" value={form.terminal_layout} onChange={handleChange} />
            <Field label="Hold Down" name="hold_down" value={form.hold_down} onChange={handleChange} />
            <Field label="Vent Type" name="vent_type" value={form.vent_type} onChange={handleChange} />
            <div className="flex items-center gap-2 pt-7">
              <input id="maintenance_free" name="maintenance_free" type="checkbox" checked={form.maintenance_free} onChange={handleChange} />
              <label htmlFor="maintenance_free" className="field-label m-0">Maintenance Free</label>
            </div>
          </div>
        </div>

        <div className="border-t border-[color:var(--border)]"></div>

        {/* Warranty & Coverage */}
        <div>
          <h3 className="mb-6 text-base font-bold uppercase text-[color:var(--text-primary)] tracking-wider">Warranty & Coverage</h3>
          <div className="grid gap-4 md:grid-cols-4">
            <Field label="Warranty (months)" name="warranty_months" type="number" value={form.warranty_months} onChange={handleChange} required />
            <Field label="Private Warranty (months)" name="private_warranty_months" type="number" value={form.private_warranty_months} onChange={handleChange} />
            <Field label="Commercial Warranty (months)" name="commercial_warranty_months" type="number" value={form.commercial_warranty_months} onChange={handleChange} />
          </div>
        </div>

        <div className="border-t border-[color:var(--border)]"></div>

        {/* Inventory & Pricing */}
        <div>
          <h3 className="mb-6 text-base font-bold uppercase text-[color:var(--text-primary)] tracking-wider">Inventory & Pricing</h3>
          <div className="grid gap-4 md:grid-cols-4">
            <Field label="Total Quantity" name="total_quantity" type="number" value={form.total_quantity} onChange={handleChange} required />
            <Field label="Available Quantity" name="available_quantity" type="number" value={form.available_quantity} onChange={handleChange} required />
            <Field label="Price" name="price" type="number" step="0.01" value={form.price} onChange={handleChange} required />
            <div>
              <label htmlFor="status" className="field-label">Status</label>
              <select id="status" name="status" className="neon-input" value={form.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="border-t border-[color:var(--border)]"></div>

        {/* Additional Information */}
        <div>
          <h3 className="mb-6 text-base font-bold uppercase text-[color:var(--text-primary)] tracking-wider">Additional Information</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Application Segment" name="application_segment" value={form.application_segment} onChange={handleChange} />
            <Field label="Datasheet URL" name="datasheet_url" type="url" value={form.datasheet_url} onChange={handleChange} />
          </div>
        </div>

        <div className="border-t border-[color:var(--border)]"></div>

        {/* Extended Details */}
        <div>
          <h3 className="mb-6 text-base font-bold uppercase text-[color:var(--text-primary)] tracking-wider">Extended Details</h3>
          <div>
            <label htmlFor="description" className="field-label">Description</label>
            <textarea id="description" name="description" className="neon-input min-h-[80px]" value={form.description} onChange={handleChange} />
          </div>

          <div className="mt-4">
            <label htmlFor="specs_text" className="field-label">Specs JSON (object)</label>
            <textarea
              id="specs_text"
              name="specs_text"
              className="neon-input min-h-[100px]"
              placeholder='{"cold_start": "excellent", "cycle_life": 2000}'
              value={form.specs_text}
              onChange={handleChange}
            />
          </div>
        </div>

        {formError ? <p className="text-sm text-[color:var(--danger)]">{formError}</p> : null}

        <div className="flex justify-end">
          <button type="submit" className="neon-btn" disabled={createModel.isPending}>
            {createModel.isPending ? 'Saving...' : 'Create Model'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, name, value, onChange, type = 'text', required = false, step }) {
  return (
    <div>
      <label htmlFor={name} className="field-label">{label}</label>
      <input
        id={name}
        name={name}
        className="neon-input"
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        step={step}
      />
    </div>
  )
}
