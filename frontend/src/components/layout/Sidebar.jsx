import { Link, useLocation } from 'react-router-dom'

const adminMenu = [
  { name: 'Dashboard', path: '/admin', icon: '📊' },
  { name: 'Users', path: '/admin/users', icon: '👥' },
  { name: 'Battery Models', path: '/admin/battery-models', icon: '🔋' },
  { name: 'Inventory', path: '/admin/inventory', icon: '📦' },
  { name: 'Orders', path: '/admin/orders', icon: '🛒' },
  { name: 'Warranties', path: '/admin/warranties', icon: '📜' },
]

const wholesalerMenu = [
  { name: 'Dashboard', path: '/wholesaler', icon: '📊' },
  { name: 'Inventory', path: '/wholesaler/inventory', icon: '📦' },
  { name: 'Orders', path: '/wholesaler/orders', icon: '🛒' },
  { name: 'Sales', path: '/wholesaler/sales', icon: '💰' },
]

export default function Sidebar({ role }) {
  const location = useLocation()
  const menu = role === 'admin' ? adminMenu : wholesalerMenu

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary-600">Lithovolt</h1>
        <p className="text-sm text-gray-500 capitalize">{role} Panel</p>
      </div>
      <nav className="mt-6">
        {menu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-6 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors ${
              location.pathname === item.path ? 'bg-primary-50 text-primary-600 border-r-4 border-primary-600' : ''
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
