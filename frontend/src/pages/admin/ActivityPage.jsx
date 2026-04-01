import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminAPI } from '../../services/api'
import ShimmerTableRows from '../../components/common/ShimmerTableRows'
import PaginationControls from '../../components/common/PaginationControls'
import SearchableSelect from '../../components/common/SearchableSelect'

const EVENT_SCOPE_OPTIONS = ['ALL', 'USER', 'STAFF', 'ROLE', 'PERMISSION']

function formatLabel(value) {
  return String(value || '')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function renderValue(value) {
  if (value === null || typeof value === 'undefined') {
    return '-'
  }

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  return String(value)
}

function buildChangeRows(metadata = {}) {
  const before = metadata?.before || metadata?.old || metadata?.previous || {}
  const after = metadata?.after || metadata?.new || metadata?.current || {}

  if (before && after && (Object.keys(before).length > 0 || Object.keys(after).length > 0)) {
    const keys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]))
    return keys.map((key) => ({
      field: key,
      before: before[key],
      after: after[key],
      changed: JSON.stringify(before[key]) !== JSON.stringify(after[key]),
    }))
  }

  return Object.entries(metadata || {}).map(([key, value]) => ({
    field: key,
    before: null,
    after: value,
    changed: true,
  }))
}

function getChangedFieldCount(metadata = {}) {
  return buildChangeRows(metadata).filter((row) => row.changed).length
}

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
  const [selectedEvent, setSelectedEvent] = useState(null)

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
                <th>Details</th>
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
                    <div className="flex items-center gap-2">
                      <button
                        className="neon-btn-ghost"
                        onClick={() => setSelectedEvent(item)}
                        type="button"
                      >
                        View Details
                      </button>
                      <span className="tag">
                        {getChangedFieldCount(item.metadata || {})} fields
                      </span>
                    </div>
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

      {selectedEvent ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="panel-card max-h-[85vh] w-full max-w-4xl overflow-hidden p-0">
            <div className="flex items-start justify-between border-b border-white/10 px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold">Activity Details</h2>
                <p className="text-sm text-[color:var(--muted)]">
                  {formatDate(selectedEvent.occurred_at)} • {formatLabel(selectedEvent.scope)} • {String(selectedEvent.event_type || '').toUpperCase()}
                </p>
              </div>
              <button className="neon-btn-ghost" onClick={() => setSelectedEvent(null)} type="button">
                Close
              </button>
            </div>

            <div className="space-y-4 overflow-auto px-6 py-4">
              <div className="rounded-lg border border-white/10 p-4">
                <p className="text-xs uppercase tracking-wide text-[color:var(--muted)]">Summary</p>
                <p className="mt-1 text-sm">{selectedEvent.summary || '-'}</p>
              </div>

              <div className="overflow-x-auto rounded-lg border border-white/10">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Field</th>
                      <th>Before</th>
                      <th>After</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buildChangeRows(selectedEvent.metadata || {}).map((row) => (
                      <tr key={row.field}>
                        <td className="font-semibold">{formatLabel(row.field)}</td>
                        <td className="text-xs text-[color:var(--muted)]">{renderValue(row.before)}</td>
                        <td className={row.changed ? 'text-xs text-[color:var(--success)]' : 'text-xs text-[color:var(--muted)]'}>{renderValue(row.after)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
