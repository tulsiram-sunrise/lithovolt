import { Link, useLocation } from 'react-router-dom'

const adminMenu = [
  { name: 'Dashboard', path: '/admin' },
  { name: 'Users', path: '/admin/users' },
  { name: 'Battery Models', path: '/admin/battery-models' },
  { name: 'Inventory', path: '/admin/inventory' },
  { name: 'Products', path: '/admin/products' },
  { name: 'Categories', path: '/admin/categories' },
  { name: 'Orders', path: '/admin/orders' },
  { name: 'Warranties', path: '/admin/warranties' },
]

const wholesalerMenu = [
  { name: 'Dashboard', path: '/wholesaler' },
  { name: 'Inventory', path: '/wholesaler/inventory' },
  { name: 'Products', path: '/wholesaler/products' },
  { name: 'Orders', path: '/wholesaler/orders' },
  { name: 'Sales', path: '/wholesaler/sales' },
]

const customerMenu = [
  { name: 'Dashboard', path: '/customer' },
  { name: 'My Warranties', path: '/customer/warranties' },
  { name: 'Claim Warranty', path: '/customer/claim' },
  { name: 'Products', path: '/customer/products' },
  { name: 'Wholesaler Signup', path: '/customer/wholesaler-register' },
]

export default function Sidebar({ role }) {
  const location = useLocation()
  const menu = role === 'admin' ? adminMenu : role === 'wholesaler' ? wholesalerMenu : customerMenu

  return (
    <div className="sidebar">
      <div className="p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-[color:var(--muted)]">Command Center</p>
        <h1 className="text-2xl font-bold neon-title text-[color:var(--accent)]">Lithovolt</h1>
        <p className="text-sm text-[color:var(--muted)] capitalize">{role} Panel</p>
      </div>
      <nav className="mt-6">
        {menu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="h-2 w-2 rounded-full bg-[color:var(--accent)]/70" />
            <span className="text-sm font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
