import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { warrantyAPI } from '../../services/api'

export default function CustomerWarrantiesPage() {
  const [downloading, setDownloading] = useState(null)
  const { data, isLoading, error } = useQuery({
    queryKey: ['customer-warranties-full'],
    queryFn: () => warrantyAPI.getWarranties({ ordering: '-created_at' }),
    select: (response) => response.data,
  })

  const warranties = useMemo(() => {
    const list = Array.isArray(data) ? data : data?.results || []
    return list
  }, [data])

  const handleDownload = async (id) => {
    try {
      setDownloading(id)
      const response = await warrantyAPI.getCertificate(id)
      const url = window.URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = `warranty_${id}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold neon-title">My Warranties</h1>
        <p className="text-[color:var(--muted)]">Download certificates and track status.</p>
      </div>

      <div className="panel-card p-6">
        {error ? <p className="text-[color:var(--danger)]">Unable to load warranties.</p> : null}
        <div className="mt-4 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Warranty #</th>
                <th>Serial</th>
                <th>Model</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(isLoading ? [] : warranties).map((item) => (
                <tr key={item.id}>
                  <td>{item.warranty_number || `WAR-${item.id}`}</td>
                  <td>{item.serial}</td>
                  <td>{item.battery_model_name}</td>
                  <td><span className="tag">{item.status}</span></td>
                  <td>
                    <button
                      className="neon-btn-ghost"
                      onClick={() => handleDownload(item.id)}
                      disabled={downloading === item.id}
                    >
                      {downloading === item.id ? 'Downloading...' : 'Certificate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isLoading && warranties.length === 0 ? (
          <p className="mt-4 text-[color:var(--muted)]">No warranties found.</p>
        ) : null}
      </div>
    </div>
  )
}
