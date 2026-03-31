import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminAPI } from '../../services/api'
import ShimmerTableRows from '../../components/common/ShimmerTableRows'
import PaginationControls from '../../components/common/PaginationControls'
import SearchableSelect from '../../components/common/SearchableSelect'

const EVENT_SCOPE_OPTIONS = ['ALL', 'USER', 'STAFF', 'ROLE', 'PERMISSION']

function formatDate(value) {
  if (!value) {
    return '-'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
}

export default function ActivityPage() {
  const [scopeFilter, setScopeFilter] = useState('ALL')
  const [eventFilter, setEventFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-activity', scopeFilter, eventFilter, search, page],
    queryFn: () => adminAPI.getActivity({
      page,
      page_size: 20,
      scope: scopeFilter === 'ALL' ? undefined : scopeFilter,
      event_type: eventFilter === 'ALL' ? undefined : eventFilter,
      search: search || undefined,
    }),
    select: (response) => response.data,
  })

  const events = useMemo(() => {
    const list = Array.isArray(data?.items) ? data.items : []
    return list
  }, [data])

  const pagination = useMemo(() => {
    return {
      current_page: data?.current_page || 1,
      last_page: data?.last_page || 1,
      total: data?.total || events.length,
    }
  }, [data, events.length])

  const eventTypes = useMemo(() => {
    const values = new Set()
    ;(Array.isArray(data?.items) ? data.items : []).forEach((item) => {
      values.add(String(item.event_type || '').toUpperCase())
    })
    return ['ALL', ...Array.from(values).filter(Boolean)]
  }, [data])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold neon-title">Admin Activity & Audit</h1>
          <p className="text-[color:var(--muted)]">Track role, permission, user, and staff governance changes.</p>
        </div>
      </div>

      <div className="panel-card p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            className="neon-input md:max-w-xs"
            placeholder="Search activity"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
          />
          <div className="flex flex-wrap gap-2">
            {EVENT_SCOPE_OPTIONS.map((option) => (
              <button
                key={option}
                className="neon-btn-ghost"
                onClick={() => {
                  setScopeFilter(option)
                  setPage(1)
                }}
              >
                {option}
              </button>
            ))}
            <div className="min-w-44">
              <SearchableSelect
                id="activity-event-filter"
                value={eventFilter}
                onChange={(next) => {
                  setEventFilter(next)
                  setPage(1)
                }}
                placeholder="Event type"
                searchPlaceholder="Search event type..."
                options={eventTypes.map((option) => ({ value: option, label: option }))}
              />
            </div>
          </div>
        </div>

        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Events</h2>
          <span className="tag">{pagination.total} total</span>
        </div>

        {data?.scope_counts ? (
          <div className="mb-4 flex flex-wrap gap-2">
            {Object.entries(data.scope_counts).map(([scope, count]) => (
              <span key={scope} className="tag">{scope}: {count}</span>
            ))}
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Scope</th>
                <th>Event</th>
                <th>Summary</th>
                <th>Metadata</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? <ShimmerTableRows rows={8} columns={5} /> : null}
              {!isLoading && events.map((item) => (
                <tr key={`${item.scope}-${item.entity_id}-${item.occurred_at}`}>
                  <td>{formatDate(item.occurred_at)}</td>
                  <td><span className="tag">{item.scope}</span></td>
                  <td>{String(item.event_type || '').toUpperCase()}</td>
                  <td>{item.summary || '-'}</td>
                  <td>
                    <pre className="m-0 max-w-sm overflow-auto whitespace-pre-wrap break-all text-xs text-[color:var(--muted)]">
                      {JSON.stringify(item.metadata || {}, null, 2)}
                    </pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && events.length === 0 ? (
            <p className="mt-4 text-sm text-[color:var(--muted)]">No activity events match current filters.</p>
          ) : null}
        </div>

        <PaginationControls
          currentPage={pagination.current_page}
          lastPage={pagination.last_page}
          total={pagination.total}
          pageSize={20}
          onPageChange={setPage}
        />
      </div>
    </div>
  )
}
