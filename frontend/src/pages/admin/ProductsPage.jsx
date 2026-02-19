import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { inventoryAPI } from '../../services/api'
import { useToastStore } from '../../store/toastStore'

const emptyForm = {
  name: '',
  sku: '',
  category_id: '',
  price: '',
  total_quantity: '',
  available_quantity: '',
  low_stock_threshold: '',
  is_active: true,
}

export default function ProductsPage() {
  const [form, setForm] = useState(emptyForm)
  const queryClient = useQueryClient()
  const addToast = useToastStore((state) => state.addToast)

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => inventoryAPI.getProducts({ ordering: '-created_at' }),
    select: (response) => response.data,
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => inventoryAPI.getCategories({ ordering: 'name' }),
    select: (response) => response.data,
  })

  const createProduct = useMutation({
    mutationFn: (payload) => inventoryAPI.createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      setForm(emptyForm)
      addToast({ type: 'success', title: 'Product created', message: 'Product added to catalog.' })
    },
    onError: (error) => {
      addToast({ type: 'error', title: 'Create failed', message: error.response?.data?.detail || 'Unable to create product.' })
    },
  })

  const deleteProduct = useMutation({
    mutationFn: (id) => inventoryAPI.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      addToast({ type: 'success', title: 'Product deleted', message: 'Product removed.' })
    },
    onError: (error) => {
      addToast({ type: 'error', title: 'Delete failed', message: error.response?.data?.detail || 'Unable to delete product.' })
    },
  })

  const products = Array.isArray(productsData) ? productsData : productsData?.results || []
  const categories = Array.isArray(categoriesData) ? categoriesData : categoriesData?.results || []

  const handleSubmit = (event) => {
    event.preventDefault()
    createProduct.mutate({
      name: form.name.trim(),
      sku: form.sku.trim(),
      category: form.category_id ? Number(form.category_id) : null,
      price: Number(form.price || 0),
      total_quantity: Number(form.total_quantity || 0),
      available_quantity: Number(form.available_quantity || 0),
      low_stock_threshold: Number(form.low_stock_threshold || 0),
      is_active: form.is_active,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold neon-title">Products</h1>
        <p className="text-[color:var(--muted)]">Manage non-serialized products beyond batteries.</p>
      </div>

      <form onSubmit={handleSubmit} className="panel-card p-6 grid gap-4 md:grid-cols-4">
        <div>
          <label className="field-label">Name</label>
          <input
            className="neon-input"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
        </div>
        <div>
          <label className="field-label">SKU</label>
          <input
            className="neon-input"
            value={form.sku}
            onChange={(event) => setForm((prev) => ({ ...prev, sku: event.target.value }))}
            required
          />
        </div>
        <div>
          <label className="field-label">Category</label>
          <select
            className="neon-input"
            value={form.category_id}
            onChange={(event) => setForm((prev) => ({ ...prev, category_id: event.target.value }))}
          >
            <option value="">Uncategorized</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label">Price</label>
          <input
            className="neon-input"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
          />
        </div>
        <div>
          <label className="field-label">Total Qty</label>
          <input
            className="neon-input"
            type="number"
            min="0"
            value={form.total_quantity}
            onChange={(event) => setForm((prev) => ({ ...prev, total_quantity: event.target.value }))}
          />
        </div>
        <div>
          <label className="field-label">Available Qty</label>
          <input
            className="neon-input"
            type="number"
            min="0"
            value={form.available_quantity}
            onChange={(event) => setForm((prev) => ({ ...prev, available_quantity: event.target.value }))}
          />
        </div>
        <div>
          <label className="field-label">Low Stock</label>
          <input
            className="neon-input"
            type="number"
            min="0"
            value={form.low_stock_threshold}
            onChange={(event) => setForm((prev) => ({ ...prev, low_stock_threshold: event.target.value }))}
          />
        </div>
        <div className="flex items-end gap-3">
          <label className="flex items-center gap-2 text-sm text-[color:var(--muted)]">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => setForm((prev) => ({ ...prev, is_active: event.target.checked }))}
            />
            Active
          </label>
          <button className="neon-btn" type="submit" disabled={createProduct.isLoading}>
            {createProduct.isLoading ? 'Saving...' : 'Add'}
          </button>
        </div>
      </form>

      <div className="panel-card p-6">
        <div className="mt-2 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Available</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(isLoading ? [] : products).map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.sku}</td>
                  <td>{product.category_name || '-'}</td>
                  <td>{product.available_quantity}</td>
                  <td><span className="tag">{product.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <button
                      className="neon-btn-ghost"
                      type="button"
                      onClick={() => deleteProduct.mutate(product.id)}
                      disabled={deleteProduct.isLoading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isLoading ? <p className="mt-3 text-sm text-[color:var(--muted)]">Loading products...</p> : null}
          {!isLoading && products.length === 0 ? (
            <p className="mt-3 text-sm text-[color:var(--muted)]">No products added yet.</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
