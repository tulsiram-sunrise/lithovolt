import { useEffect, useMemo, useRef, useState } from 'react'

const CHUNK = 40

export default function SearchableSelect({
  id,
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select option',
  disabled = false,
  searchPlaceholder = 'Search...',
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(CHUNK)
  const rootRef = useRef(null)

  useEffect(() => {
    const onDocClick = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const normalizedOptions = useMemo(
    () => options.map((item) => ({ value: String(item.value), label: item.label, searchText: String(item.searchText || item.label).toLowerCase() })),
    [options]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return normalizedOptions
    return normalizedOptions.filter((item) => item.searchText.includes(q))
  }, [normalizedOptions, query])

  const visible = filtered.slice(0, visibleCount)
  const selected = normalizedOptions.find((item) => item.value === String(value))

  useEffect(() => {
    if (!open) {
      setQuery('')
      setVisibleCount(CHUNK)
    }
  }, [open])

  return (
    <div className="searchable-select" ref={rootRef}>
      {label ? <label htmlFor={id} className="field-label">{label}</label> : null}
      <button
        id={id}
        type="button"
        className="searchable-select-trigger"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{selected?.label || placeholder}</span>
        <span className="text-[color:var(--muted)]">{open ? '▲' : '▼'}</span>
      </button>

      {open ? (
        <div className="searchable-select-menu">
          <input
            className="neon-input"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setVisibleCount(CHUNK)
            }}
            placeholder={searchPlaceholder}
            autoFocus
          />
          <div className="searchable-select-list">
            {visible.map((item) => (
              <button
                key={item.value}
                type="button"
                className={`searchable-select-item ${item.value === String(value) ? 'is-active' : ''}`}
                onClick={() => {
                  onChange?.(item.value)
                  setOpen(false)
                }}
              >
                {item.label}
              </button>
            ))}
            {visible.length === 0 ? <p className="px-3 py-2 text-sm text-[color:var(--muted)]">No results</p> : null}
          </div>
          {filtered.length > visibleCount ? (
            <button
              type="button"
              className="neon-btn-ghost mt-2"
              onClick={() => setVisibleCount((count) => count + CHUNK)}
            >
              Load more
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
