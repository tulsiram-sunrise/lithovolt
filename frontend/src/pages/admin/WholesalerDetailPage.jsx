import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { userAPI, orderAPI, warrantyAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'

const TABS = {
  PROFILE: 'profile',
  ORDERS: 'orders',
  SALES: 'sales',
  INVENTORY: 'inventory',
  APPLICATIONS: 'applications',
}

export default function WholesalerDetailPage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(TABS.PROFILE)
  const [orderPage, setOrderPage] = useState(1)
  const [salesPage, setSalesPage] = useState(1)

  // Fetch user details directly to avoid scope-related list failures
  const { data: userData, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['wholesaler-user', userId],
    queryFn: () => userAPI.getUser(userId),
    select: (response) => response.data,
  })

  const user = useMemo(() => {
    if (!userData) return null
    if (Array.isArray(userData)) return userData.find((u) => u.id == userId)
    if (Array.isArray(userData?.results)) return userData.results.find((u) => u.id == userId)
    return userData
  }, [userData, userId])

  // Fetch orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['wholesaler-orders', userId, orderPage],
    queryFn: () =>
      orderAPI.getOrdersByUser(userId, {
        page: orderPage,
        page_size: 10,
      }),
    select: (response) => response.data,
    enabled: activeTab === TABS.ORDERS,
  })

  // Fetch sales records
  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['wholesaler-sales', userId, salesPage],
    queryFn: () =>
      orderAPI.getOrdersByUser(userId, {
        page: salesPage,
        page_size: 10,
      }),
    select: (response) => response.data,
    enabled: activeTab === TABS.SALES,
  })

  // Fetch wholesaler applications
  const { data: applicationsData, isLoading: applicationsLoading } = useQuery({
    queryKey: ['wholesaler-applications', userId],
    queryFn: () => userAPI.getWholesalerApplications({ page_size: 100 }),
    select: (response) => response.data,
    enabled: activeTab === TABS.APPLICATIONS,
  })

  const orders = useMemo(() => {
    const list = Array.isArray(ordersData) ? ordersData : ordersData?.results || []
    return list
  }, [ordersData])

  const sales = useMemo(() => {
    const list = Array.isArray(salesData) ? salesData : salesData?.results || []
    return list
  }, [salesData])

  const applications = useMemo(() => {
    const list = Array.isArray(applicationsData) ? applicationsData : applicationsData?.results || []
    return list.filter((app) => app.user_id == userId)
  }, [applicationsData, userId])

  if (userLoading) return <LoadingSpinner message="Loading wholesaler details..." />
  if (userError) return <ErrorMessage error={userError} />
  if (!user) return <ErrorMessage error={{ response: { data: { message: 'Wholesaler not found' } } }} />

  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-sm text-[color:var(--accent)] hover:underline"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-semibold neon-title">{fullName}</h1>
          <p className="mt-1 text-[color:var(--muted)]">Wholesaler Account</p>
        </div>
        <span className={`inline-block px-4 py-2 rounded-lg text-sm font-medium ${
          user.is_active
            ? 'bg-green-900/30 text-green-400'
            : 'bg-red-900/30 text-red-400'
        }`}>
          {user.is_active ? '● Active' : '● Inactive'}
        </span>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="stat-card">
          <p className="stat-label">Total Orders</p>
          <p className="stat-value mt-3">{ordersData?.count || 0}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Total Sales</p>
          <p className="stat-value mt-3">${orders.reduce((sum, o) => sum + (o.total_amount || 0), 0).toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Pending Orders</p>
          <p className="stat-value mt-3">{orders.filter((o) => o.status === 'PENDING').length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Verified</p>
          <p className="stat-value mt-3">{user.is_verified ? 'Yes' : 'No'}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="panel-card p-4 border-b border-[color:var(--border)]">
        <div className="flex gap-4 overflow-x-auto">
          {Object.entries(TABS).map(([key, value]) => (
            <button
              key={key}
              onClick={() => {
                setActiveTab(value)
                if (value === TABS.ORDERS) setOrderPage(1)
                if (value === TABS.SALES) setSalesPage(1)
              }}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === value
                  ? 'text-[color:var(--accent)] border-b-2 border-[color:var(--accent)]'
                  : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'
              }`}
            >
              {key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="panel-card p-6">
        {/* Profile Tab */}
        {activeTab === TABS.PROFILE && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold uppercase text-[color:var(--muted)]">Email</label>
                <p className="mt-2 text-sm">{user.email || '-'}</p>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-[color:var(--muted)]">Phone</label>
                <p className="mt-2 text-sm">{user.phone || '-'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-[color:var(--border)]">
              <div>
                <label className="text-xs font-semibold uppercase text-[color:var(--muted)]">Address</label>
                <p className="mt-2 text-sm">{user.address || '-'}</p>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-[color:var(--muted)]">City</label>
                <p className="mt-2 text-sm">{user.city || '-'}</p>
              </div>
            </div>

            {(user.state || user.postal_code) && (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold uppercase text-[color:var(--muted)]">State</label>
                  <p className="mt-2 text-sm">{user.state || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-[color:var(--muted)]">Postal Code</label>
                  <p className="mt-2 text-sm">{user.postal_code || '-'}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-[color:var(--border)]">
              <div>
                <label className="text-xs font-semibold uppercase text-[color:var(--muted)]">Account Status</label>
                <p className="mt-2 text-sm">{user.is_verified ? 'Verified' : 'Pending Verification'}</p>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-[color:var(--muted)]">Active Status</label>
                <p className="mt-2 text-sm">{user.is_active ? 'Active' : 'Inactive'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === TABS.ORDERS && (
          <div className="space-y-4">
            {ordersLoading ? (
              <div className="py-8 text-center text-[color:var(--muted)]">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="py-8 text-center text-[color:var(--muted)]">No orders found</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="data-table w-full">
                    <thead>
                      <tr>
                        <th>Order Number</th>
                        <th>Date</th>
                        <th>Total Amount</th>
                        <th>Status</th>
                        <th>Payment Status</th>
                        <th>Payment Method</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td className="font-medium">{order.order_number || `ORD-${order.id}`}</td>
                          <td>{order.created_at?.split('T')[0] || '-'}</td>
                          <td className="font-semibold">${order.total_amount?.toFixed(2) || '0.00'}</td>
                          <td>
                            <span className="tag">{order.status || 'UNKNOWN'}</span>
                          </td>
                          <td>
                            <span className="tag">{order.payment_status || 'PENDING'}</span>
                          </td>
                          <td>{order.payment_method || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* Sales Tab */}
        {activeTab === TABS.SALES && (
          <div className="space-y-4">
            {salesLoading ? (
              <div className="py-8 text-center text-[color:var(--muted)]">Loading sales records...</div>
            ) : sales.length === 0 ? (
              <div className="py-8 text-center text-[color:var(--muted)]">No sales records found</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="data-table w-full">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer Email</th>
                        <th>Amount</th>
                        <th>Fulfillment Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.map((order) => (
                        <tr key={order.id}>
                          <td className="font-medium">{order.order_number || `ORD-${order.id}`}</td>
                          <td>{order.user_email || 'Unknown'}</td>
                          <td className="font-semibold">${order.total_amount?.toFixed(2) || '0.00'}</td>
                          <td>
                            <span className="tag">{order.status || 'PROCESSING'}</span>
                          </td>
                          <td>{order.created_at?.split('T')[0] || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === TABS.INVENTORY && (
          <div className="space-y-4">
            <div className="py-8 text-center text-[color:var(--muted)]">
              <p>Wholesaler inventory management coming soon</p>
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === TABS.APPLICATIONS && (
          <div className="space-y-4">
            {applicationsLoading ? (
              <div className="py-8 text-center text-[color:var(--muted)]">Loading applications...</div>
            ) : applications.length === 0 ? (
              <div className="py-8 text-center text-[color:var(--muted)]">No applications found</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="data-table w-full">
                    <thead>
                      <tr>
                        <th>Application ID</th>
                        <th>Company Name</th>
                        <th>Status</th>
                        <th>Submitted Date</th>
                        <th>Documents</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr key={app.id}>
                          <td className="font-medium">{`APP-${app.id}`}</td>
                          <td>{app.company_name || '-'}</td>
                          <td>
                            <span className="tag">{app.status || 'PENDING'}</span>
                          </td>
                          <td>{app.created_at?.split('T')[0] || '-'}</td>
                          <td>
                            {app.supporting_documents ? (
                              <a
                                href={app.supporting_documents}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[color:var(--accent)] hover:underline"
                              >
                                View
                              </a>
                            ) : (
                              '-'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
