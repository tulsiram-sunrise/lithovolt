import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { inventoryAPI } from '../../services/api'
import { useToastStore } from '../../store/toastStore'
import ShimmerTableRows from '../../components/common/ShimmerTableRows'
import ProductImage from '../../components/common/ProductImage'
import SearchableSelect from '../../components/common/SearchableSelect'
import CustomCheckbox from '../../components/common/CustomCheckbox'
import ActionConfirmModal from '../../components/common/ActionConfirmModal'
import { isValidHttpImageUrl, normalizeImageUrlInput } from '../../utils/imageUrl'

const emptyForm = {
  name: '',
  product_type: 'GENERIC',
  sku: '',
  image_url: '',
  category_id: '',
  price: '',
  total_quantity: '',
  available_quantity: '',
  low_stock_threshold: '',
  is_active: true,
}

export default function ProductsPage() {
  const [form, setForm] = useState(emptyForm)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const queryClient = useQueryClient()
  const addToast = useToastStore((state) => state.addToast)

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => inventoryAPI.getCatalogItems({ ordering: '-created_at' }),
    select: (response) => response.data,
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => inventoryAPI.getCategories({ ordering: 'name' }),
    select: (response) => response.data,
  })

  const createProduct = useMutation({
    mutationFn: (payload) => inventoryAPI.createCatalogItem(payload),
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
    mutationFn: (id) => inventoryAPI.deleteCatalogItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      addToast({ type: 'success', title: 'Product deleted', message: 'Product removed.' })
    },
    onError: (error) => {
      addToast({ type: 'error', title: 'Delete failed', message: error.response?.data?.detail || 'Unable to delete product.' })
    },
  })

  const productsRaw = Array.isArray(productsData) ? productsData : productsData?.results || productsData?.data || []
  const products = productsRaw.filter((item) => String(item.product_type || '').toUpperCase() !== 'BATTERY')
  const categories = Array.isArray(categoriesData) ? categoriesData : categoriesData?.results || []

  const handleSubmit = (event) => {
    event.preventDefault()

    const normalizedImageUrl = normalizeImageUrlInput(form.image_url)
    if (normalizedImageUrl !== form.image_url) {
      setForm((prev) => ({ ...prev, image_url: normalizedImageUrl }))
    }

    if (!isValidHttpImageUrl(normalizedImageUrl)) {
      addToast({ type: 'error', title: 'Invalid image URL', message: 'Please provide a valid http/https image URL.' })
      return
    }

    createProduct.mutate({
      name: form.name.trim(),
      product_type: form.product_type,
      sku: form.sku.trim(),
      image_url: normalizedImageUrl || undefined,
      category_id: form.category_id ? Number(form.category_id) : null,
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
          <SearchableSelect
            id="product-type"
            label="Type"
            value={form.product_type}
            onChange={(next) => setForm((prev) => ({ ...prev, product_type: next }))}
            options={[
              { value: 'GENERIC', label: 'Generic' },
              { value: 'ACCESSORY', label: 'Accessory' },
              { value: 'PART', label: 'Part' },
              { value: 'CONSUMABLE', label: 'Consumable' },
              { value: 'SERVICE', label: 'Service' },
            ]}
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
          <label className="field-label">Image URL</label>
          <input
            className="neon-input"
            type="url"
            value={form.image_url}
            onChange={(event) => setForm((prev) => ({ ...prev, image_url: event.target.value }))}
            onBlur={(event) => setForm((prev) => ({ ...prev, image_url: normalizeImageUrlInput(event.target.value) }))}
            placeholder="https://..."
          />
        </div>
        <div>
          <SearchableSelect
            id="product-category"
            label="Category"
            value={form.category_id}
            onChange={(next) => setForm((prev) => ({ ...prev, category_id: next }))}
            placeholder="Uncategorized"
            searchPlaceholder="Search category..."
            options={[{ value: '', label: 'Uncategorized' }, ...categories.map((category) => ({ value: String(category.id), label: category.name }))]}
          />
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
          <CustomCheckbox
            id="product-active"
            checked={form.is_active}
            onChange={(checked) => setForm((prev) => ({ ...prev, is_active: checked }))}
            label="Active"
          />
          <button className="neon-btn" type="submit" disabled={createProduct.isLoading}>
            {createProduct.isLoading ? 'Saving...' : 'Add'}
          </button>
        </div>
        {form.image_url?.trim() ? (
          <div className="md:col-span-4">
            <p className="mb-2 text-xs uppercase tracking-wide text-[color:var(--muted)]">Live Preview</p>
            <ProductImage src={form.image_url.trim()} alt={form.name || 'Product preview'} className="h-40 w-full max-w-sm" fallbackText="Preview unavailable" />
          </div>
        ) : null}
        <div className="md:col-span-4">
          <p className="text-xs text-[color:var(--muted)]">Use a direct image URL (http/https). Broken links will automatically fall back to a placeholder.</p>
        </div>
      </form>

      <div className="panel-card p-6">
        <div className="mt-2 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Type</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Available</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? <ShimmerTableRows rows={6} columns={8} /> : null}
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <ProductImage
                      src={product.image_url}
                      alt={product.name}
                      className="h-12 w-12"
                      fallbackText="N/A"
                    />
                  </td>
                  <td>{product.name}</td>
                  <td><span className="tag">{String(product.product_type || 'GENERIC').toUpperCase()}</span></td>
                  <td>{product.sku}</td>
                  <td>{product.category_name || '-'}</td>
                  <td>{product.available_quantity}</td>
                  <td><span className="tag">{product.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <button
                      className="neon-btn-ghost"
                      type="button"
                      onClick={() => setConfirmDelete({ id: product.id, name: product.name })}
                      disabled={deleteProduct.isLoading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && products.length === 0 ? (
            <p className="mt-3 text-sm text-[color:var(--muted)]">No products added yet.</p>
          ) : null}
        </div>
      </div>

      <ActionConfirmModal
        isOpen={!!confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete \"${confirmDelete?.name || ''}\"?`}
        confirmLabel="Delete"
        isSubmitting={deleteProduct.isLoading}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete?.id) {
            deleteProduct.mutate(confirmDelete.id)
          }
          setConfirmDelete(null)
        }}
      />
    </div>
  )
}
