import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { inventoryAPI } from '../../services/api'
import { useToastStore } from '../../store/toastStore'
import ShimmerTableRows from '../../components/common/ShimmerTableRows'

const SERVER_PAGE_SIZE = 15

export default function BatteryModelsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const addToast = useToastStore((state) => state.addToast)
  const searchInputRef = useRef(null)
  const [draftQuery, setDraftQuery] = useState('')
  const [appliedQuery, setAppliedQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['battery-models', currentPage, appliedQuery],
    queryFn: () =>
      inventoryAPI.getBatteryModels({
        ordering: '-created_at',
        page: currentPage,
        per_page: SERVER_PAGE_SIZE,
        q: appliedQuery || undefined,
      }),
    select: (response) => response.data,
  })

  const deleteModel = useMutation({
    mutationFn: (id) => inventoryAPI.deleteBatteryModel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['battery-models'] })
      addToast({ type: 'success', title: 'Model deleted', message: 'Battery model deleted successfully.' })
    },
    onError: (error) => {
      addToast({ type: 'error', title: 'Error', message: error.response?.data?.message || 'Unable to delete model.' })
    },
  })

  const serverModels = Array.isArray(data) ? data : data?.results || data?.data || []

  // Live-local filter over currently loaded rows while user is typing.
  const filteredModels = useMemo(() => {
    const query = draftQuery.trim().toLowerCase()
    if (!query) {
      return serverModels
    }
    return serverModels.filter(
      (model) =>
        String(model.name || '').toLowerCase().includes(query) ||
        String(model.sku || '').toLowerCase().includes(query) ||
        String(model.brand || '').toLowerCase().includes(query)
    )
  }, [serverModels, draftQuery])

  const totalServerItems = Number(data?.total ?? filteredModels.length)
  const totalPages = Math.max(1, Number(data?.last_page ?? 1))
  const fromItem = Number(data?.from ?? (filteredModels.length > 0 ? 1 : 0))
  const toItem = Number(data?.to ?? filteredModels.length)

  useEffect(() => {
    const handleSlashShortcut = (event) => {
      if (!(event.ctrlKey && event.key === '/')) {
        return
      }
      const target = event.target
      const tagName = target?.tagName?.toLowerCase?.()
      if (tagName === 'input' || tagName === 'textarea' || tagName === 'select' || target?.isContentEditable) {
        return
      }
      event.preventDefault()
      searchInputRef.current?.focus()
    }

    window.addEventListener('keydown', handleSlashShortcut)
    return () => window.removeEventListener('keydown', handleSlashShortcut)
  }, [])

  const handleSearchChange = (event) => {
    setDraftQuery(event.target.value)
  }

  const handleSearchSubmit = (event) => {
    if (event.key !== 'Enter') {
      return
    }
    event.preventDefault()
    setCurrentPage(1)
    setAppliedQuery(draftQuery.trim())
  }

  const clearSearch = () => {
    setDraftQuery('')
    setAppliedQuery('')
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold neon-title">Battery Models</h1>
          <p className="text-[color:var(--muted)]">Maintain the master catalog.</p>
        </div>
        <Link className="neon-btn" to="/admin/battery-models/new">Add New Model</Link>
      </div>

      <div className="panel-card p-6">
        {/* Search and Filter */}
        <div className="mb-6">
          <div className="relative w-full md:max-w-md">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by name, SKU, or brand... (Ctrl + /)"
              value={draftQuery}
              onChange={handleSearchChange}
              onKeyDown={handleSearchSubmit}
              className="neon-input w-full pr-10"
            />
            {(draftQuery || appliedQuery) && (
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[color:var(--muted)] hover:text-[color:var(--text-primary)]"
                onClick={clearSearch}
                aria-label="Clear search"
                title="Clear search"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                  <path d="M4.22 4.22a.75.75 0 0 1 1.06 0L10 8.94l4.72-4.72a.75.75 0 1 1 1.06 1.06L11.06 10l4.72 4.72a.75.75 0 1 1-1.06 1.06L10 11.06l-4.72 4.72a.75.75 0 1 1-1.06-1.06L8.94 10 4.22 5.28a.75.75 0 0 1 0-1.06Z" />
                </svg>
              </button>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[color:var(--muted)]">
            <span>
              Live local filter on current page: <span className="font-semibold">{filteredModels.length}</span> result{filteredModels.length !== 1 ? 's' : ''}
            </span>
            <span>Press Enter to search all pages on server.</span>
          </div>
          {appliedQuery && (
            <p className="mt-1 text-xs text-[color:var(--muted)]">
              Server filter active for: "{appliedQuery}"
            </p>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Model</th>
                <th>SKU</th>
                <th>Available</th>
                <th>Warranty</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? <ShimmerTableRows rows={6} columns={5} /> : null}
              {filteredModels.length > 0 ? (
                filteredModels.map((model) => (
                  <tr key={model.id}>
                    <td>{model.name}</td>
                    <td>{model.sku}</td>
                    <td>{model.available_quantity ?? model.available_stock ?? 0}</td>
                    <td>{model.warranty_months} mo</td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="neon-btn-ghost text-xs"
                          onClick={() => navigate(`/admin/battery-models/${model.id}`)}
                        >
                          View
                        </button>
                        <button
                          className="neon-btn-ghost text-xs"
                          onClick={() => navigate(`/admin/battery-models/${model.id}/edit`)}
                        >
                          Edit
                        </button>
                        <button
                          className="neon-btn-ghost text-xs text-[color:var(--danger)]"
                          onClick={() => {
                            if (window.confirm(`Delete "${model.name}"?`)) {
                              deleteModel.mutate(model.id)
                            }
                          }}
                          disabled={deleteModel.isPending}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-[color:var(--muted)]">
                    {draftQuery ? 'No models match current page filter.' : 'No battery models found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalServerItems > 0 && (
          <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-[color:var(--muted)]">
              Showing <span className="font-semibold">{fromItem}</span> to{' '}
              <span className="font-semibold">{toItem}</span> of{' '}
              <span className="font-semibold">{totalServerItems}</span> models
            </div>
            <div className="flex gap-2">
              <button
                className="neon-btn-secondary text-xs disabled:opacity-50"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => Math.abs(page - currentPage) <= 2)
                  .map((page) => (
                  <button
                    key={page}
                    className={`px-3 py-1 rounded text-xs ${
                      currentPage === page
                        ? 'bg-[color:var(--primary)] text-white'
                        : 'neon-btn-ghost'
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                className="neon-btn-secondary text-xs disabled:opacity-50"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
