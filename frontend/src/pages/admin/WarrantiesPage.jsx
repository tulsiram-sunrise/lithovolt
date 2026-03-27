import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { warrantyAPI } from '../../services/api'
import ShimmerTableRows from '../../components/common/ShimmerTableRows'

export default function WarrantiesPage() {
  const [downloading, setDownloading] = useState(null)
  const { data, isLoading } = useQuery({
    queryKey: ['admin-warranties'],
    queryFn: () => warrantyAPI.getWarranties({ ordering: '-created_at' }),
    select: (response) => response.data,
  })

  const warranties = useMemo(() => {
    const list = Array.isArray(data) ? data : data?.results || data?.data || []
    return list
  }, [data])

  const handleDownload = async (id, warrantyNumber) => {
    try {
      setDownloading(id)
      const response = await warrantyAPI.getCertificate(id)
      const url = window.URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = `warranty_${warrantyNumber}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold neon-title">Warranties</h1>
        <p className="text-[color:var(--muted)]">Audit warranty issuance and status.</p>
      </div>

      <div className="panel-card p-6">
        <div className="mt-2 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Warranty #</th>
                <th>Consumer</th>
                <th>Status</th>
                <th>Model</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? <ShimmerTableRows rows={6} columns={5} /> : null}
              {warranties.map((item) => (
                <tr key={item.id}>
                  <td>{item.warranty_number}</td>
                  <td>{item.consumer_name}</td>
                  <td><span className="tag">{item.status}</span></td>
                  <td>{item.product_name || item.battery_model_name || 'Unknown item'}</td>
                  <td>
                    <button
                      className="neon-btn-ghost"
                      onClick={() => handleDownload(item.id, item.warranty_number)}
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
      </div>
    </div>
  )
}
