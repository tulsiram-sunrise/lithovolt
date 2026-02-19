import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { inventoryAPI } from '../../services/api'
import { useToastStore } from '../../store/toastStore'

const emptyForm = { name: '', slug: '', parent_id: '', is_active: true }

export default function CategoriesPage() {
  const [form, setForm] = useState(emptyForm)
  const queryClient = useQueryClient()
  const addToast = useToastStore((state) => state.addToast)

  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => inventoryAPI.getCategories({ ordering: 'name' }),
    select: (response) => response.data,
  })

  const createCategory = useMutation({
    mutationFn: (payload) => inventoryAPI.createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      setForm(emptyForm)
      addToast({ type: 'success', title: 'Category created', message: 'New product category added.' })
    },
    onError: (error) => {
      addToast({ type: 'error', title: 'Create failed', message: error.response?.data?.detail || 'Unable to create category.' })
    },
  })

  const deleteCategory = useMutation({
    mutationFn: (id) => inventoryAPI.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      addToast({ type: 'success', title: 'Category deleted', message: 'Category removed.' })
    },
    onError: (error) => {
      addToast({ type: 'error', title: 'Delete failed', message: error.response?.data?.detail || 'Unable to delete category.' })
    },
  })

  const categories = Array.isArray(categoriesData) ? categoriesData : categoriesData?.results || []

  const handleSubmit = (event) => {
    event.preventDefault()
    createCategory.mutate({
      name: form.name.trim(),
      slug: form.slug.trim(),
      parent_id: form.parent_id ? Number(form.parent_id) : null,
      is_active: form.is_active,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold neon-title">Product Categories</h1>
        <p className="text-[color:var(--muted)]">Organize your catalog for future product lines.</p>
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
          <label className="field-label">Slug</label>
          <input
            className="neon-input"
            value={form.slug}
            onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
            required
          />
        </div>
        <div>
          <label className="field-label">Parent</label>
          <select
            className="neon-input"
            value={form.parent_id}
            onChange={(event) => setForm((prev) => ({ ...prev, parent_id: event.target.value }))}
          >
            <option value="">None</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
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
          <button className="neon-btn" type="submit" disabled={createCategory.isLoading}>
            {createCategory.isLoading ? 'Saving...' : 'Add'}
          </button>
        </div>
      </form>

      <div className="panel-card p-6">
        <div className="mt-2 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Parent</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(isLoading ? [] : categories).map((category) => (
                <tr key={category.id}>
                  <td>{category.name}</td>
                  <td>{category.slug}</td>
                  <td>{category.parent ? category.parent : '-'}</td>
                  <td><span className="tag">{category.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <button
                      className="neon-btn-ghost"
                      type="button"
                      onClick={() => deleteCategory.mutate(category.id)}
                      disabled={deleteCategory.isLoading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isLoading ? <p className="mt-3 text-sm text-[color:var(--muted)]">Loading categories...</p> : null}
          {!isLoading && categories.length === 0 ? (
            <p className="mt-3 text-sm text-[color:var(--muted)]">No categories created.</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
