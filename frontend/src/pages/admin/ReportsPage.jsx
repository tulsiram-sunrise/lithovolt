import { Link } from 'react-router-dom'
import { adminAPI } from '../../services/api'
import { useToastStore } from '../../store/toastStore'

function toLabel(value) {
  return String(value || '')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const reportDetailLinks = [
  { label: 'Order Operations Report', path: '/admin/orders', description: 'Detailed order lifecycle, status and fulfillment operations.' },
  { label: 'Warranty Register Report', path: '/admin/warranties', description: 'All warranties with activation and expiry context.' },
  { label: 'Claims Review Report', path: '/admin/warranty-claims', description: 'Claim pipeline and resolution outcomes.' },
  { label: 'Users & Access Report', path: '/admin/users', description: 'Users, staff, roles and permissions coverage.' },
  { label: 'Wholesaler Performance Report', path: '/admin/wholesalers', description: 'Wholesaler management and onboarding progress.' },
  { label: 'Consumer Coverage Report', path: '/admin/consumers', description: 'Consumer records and service footprint.' },
  { label: 'Inventory Position Report', path: '/admin/inventory', description: 'Current stock and allocation visibility.' },
  { label: 'Product Catalog Report', path: '/admin/products', description: 'Catalog health and product availability.' },
  { label: 'Activity Audit Report', path: '/admin/activity', description: 'System-wide audit trail and governance events.' },
]

export default function ReportsPage() {
  const addToast = useToastStore((state) => state.addToast)

  const handleExport = async (model) => {
    try {
      const response = await adminAPI.exportData(model)
      const payload = JSON.stringify(response.data, null, 2)
      const blob = new Blob([payload], { type: 'application/json' })
      const objectUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = `admin-${model}-report-${new Date().toISOString().slice(0, 10)}.json`
      link.click()
      window.URL.revokeObjectURL(objectUrl)

      addToast({
        type: 'success',
        title: 'Report ready',
        message: `${toLabel(model)} report downloaded.`,
      })
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Export failed',
        message: error?.response?.data?.message || 'Unable to generate report at the moment.',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold neon-title">Admin Reports</h1>
          <p className="text-[color:var(--muted)]">Dedicated reports hub with direct links and export actions.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="neon-btn" onClick={() => handleExport('orders')}>Export Orders</button>
          <button className="neon-btn-secondary" onClick={() => handleExport('users')}>Export Users</button>
          <button className="neon-btn-secondary" onClick={() => handleExport('warranties')}>Export Warranties</button>
          <button className="neon-btn-secondary" onClick={() => handleExport('claims')}>Export Claims</button>
        </div>
      </div>

      <div className="panel-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Report Directory</h2>
          <span className="tag">{reportDetailLinks.length} linked reports</span>
        </div>
        <p className="mt-2 text-sm text-[color:var(--muted)]">Use this dedicated section to open every major report area from one place.</p>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {reportDetailLinks.map((report) => (
            <Link
              key={report.path}
              to={report.path}
              className="rounded-xl border border-[color:var(--border)]/40 bg-[color:var(--panel)]/55 p-4 transition hover:border-[color:var(--accent)]/60 hover:shadow-[0_0_0_1px_rgba(50,247,155,0.25)]"
            >
              <p className="font-semibold text-[color:var(--text)]">{report.label}</p>
              <p className="mt-1 text-xs text-[color:var(--muted)]">{report.description}</p>
              <p className="mt-3 text-xs text-[color:var(--accent)]">Open report</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
