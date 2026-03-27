import React from 'react'

/**
 * Advanced Pagination Component
 * Supports first, previous, next, last navigation
 */
export default function PaginationControls({
  currentPage = 1,
  lastPage = 1,
  total = 0,
  pageSize = 10,
  onPageChange = () => {},
  disabled = false,
}) {
  const totalPages = Math.max(1, lastPage)
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, total)

  const handleFirstPage = () => onPageChange(1)
  const handlePrevious = () => onPageChange(Math.max(1, currentPage - 1))
  const handleNext = () => onPageChange(Math.min(totalPages, currentPage + 1))
  const handleLastPage = () => onPageChange(totalPages)

  // Generate page numbers to display (current page + 2 around it)
  const getVisiblePages = () => {
    const pages = []
    const start = Math.max(1, currentPage - 2)
    const end = Math.min(totalPages, currentPage + 2)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  }

  const visiblePages = getVisiblePages()
  const showFirstEllipsis = visiblePages[0] > 1
  const showLastEllipsis = visiblePages[visiblePages.length - 1] < totalPages

  return (
    <div className="flex flex-col gap-4 mt-6">
      {/* Summary info */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-[color:var(--muted)]">
          {total > 0 ? `Showing ${startItem}-${endItem} of ${total}` : 'No results'}
        </span>
        <span className="text-sm font-medium text-[color:var(--text)]">
          Page {currentPage} of {totalPages}
        </span>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-center gap-1 flex-wrap">
        {/* First Button */}
        <button
          onClick={handleFirstPage}
          disabled={disabled || currentPage <= 1}
          className="neon-btn-ghost px-3 py-2 text-sm"
          title="First page"
        >
          ⤚ First
        </button>

        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          disabled={disabled || currentPage <= 1}
          className="neon-btn-ghost px-3 py-2 text-sm"
          title="Previous page"
        >
          ← Prev
        </button>

        {/* First ellipsis */}
        {showFirstEllipsis && (
          <>
            <button
              onClick={() => onPageChange(1)}
              disabled={disabled}
              className="neon-btn-ghost px-3 py-2 text-sm"
            >
              1
            </button>
            <span className="px-2 text-[color:var(--muted)]">...</span>
          </>
        )}

        {/* Page numbers */}
        {visiblePages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            disabled={disabled}
            className={`px-3 py-2 text-sm rounded-md transition-colors ${
              page === currentPage
                ? 'bg-[var(--neon-primary)] text-[var(--bg)] font-medium'
                : 'neon-btn-ghost'
            }`}
          >
            {page}
          </button>
        ))}

        {/* Last ellipsis */}
        {showLastEllipsis && (
          <>
            <span className="px-2 text-[color:var(--muted)]">...</span>
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={disabled}
              className="neon-btn-ghost px-3 py-2 text-sm"
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={disabled || currentPage >= totalPages}
          className="neon-btn-ghost px-3 py-2 text-sm"
          title="Next page"
        >
          Next →
        </button>

        {/* Last Button */}
        <button
          onClick={handleLastPage}
          disabled={disabled || currentPage >= totalPages}
          className="neon-btn-ghost px-3 py-2 text-sm"
          title="Last page"
        >
          Last ⤘
        </button>
      </div>
    </div>
  )
}
