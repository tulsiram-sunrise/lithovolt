import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { warrantyAPI } from '../../services/api'

export default function CustomerDashboard() {
  const { data: warrantiesData, isLoading: warrantiesLoading } = useQuery({
    queryKey: ['customer-warranties'],
    queryFn: () => warrantyAPI.getWarranties({ ordering: '-created_at' }),
    select: (response) => response.data,
  })

  const { data: claimsData, isLoading: claimsLoading } = useQuery({
    queryKey: ['customer-claims'],
    queryFn: () => warrantyAPI.getWarrantyClaims({ ordering: '-created_at' }),
    select: (response) => response.data,
  })

  const warranties = useMemo(() => {
    const list = Array.isArray(warrantiesData) ? warrantiesData : warrantiesData?.results || []
    return list.slice(0, 5)
  }, [warrantiesData])

  const claims = useMemo(() => {
    const list = Array.isArray(claimsData) ? claimsData : claimsData?.results || []
    return list.slice(0, 5)
  }, [claimsData])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold neon-title">Customer Dashboard</h1>
        <p className="text-[color:var(--muted)]">Track your warranties and claims.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="stat-card">
          <p className="stat-label">Total Warranties</p>
          <p className="stat-value mt-3">{warrantiesLoading ? '...' : (warrantiesData?.count ?? warranties.length)}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Total Claims</p>
          <p className="stat-value mt-3">{claimsLoading ? '...' : (claimsData?.count ?? claims.length)}</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[2fr,1fr]">
        <div className="panel-card p-6">
          <h2 className="text-lg font-semibold">Recent Warranties</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Warranty #</th>
                  <th>Serial</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {warranties.map((item) => (
                  <tr key={item.id}>
                    <td>{item.warranty_number || `WAR-${item.id}`}</td>
                    <td>{item.serial}</td>
                    <td><span className="tag">{item.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel-card panel-card-strong p-6">
          <h2 className="text-lg font-semibold">Recent Claims</h2>
          <div className="mt-4 space-y-3 text-sm text-[color:var(--muted)]">
            {claims.map((claim) => (
              <div key={claim.id}>
                <p className="text-[color:var(--text)]">{claim.warranty_number || `Claim #${claim.id}`}</p>
                <p>Status: {claim.status}</p>
              </div>
            ))}
            {!claims.length ? <p>No claims yet.</p> : null}
          </div>
        </div>
      </div>
    </div>
  )
}
