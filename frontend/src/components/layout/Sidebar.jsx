import { Link, useLocation } from 'react-router-dom'
import {
  HomeIcon,
  CubeIcon,
  Squares2X2Icon,
  ClipboardDocumentListIcon,
  ShieldCheckIcon,
  UsersIcon,
  DocumentCheckIcon,
  CircleStackIcon,
  ShoppingBagIcon,
  RectangleGroupIcon,
  WrenchScrewdriverIcon,
  BoltIcon,
} from '@heroicons/react/24/outline'

const adminMenu = [
  { name: 'Dashboard', path: '/admin', icon: HomeIcon },
  { name: 'Battery Models', path: '/admin/battery-models', icon: BoltIcon },
  { name: 'Inventory', path: '/admin/inventory', icon: CircleStackIcon },
  { name: 'Products', path: '/admin/products', icon: ShoppingBagIcon },
  { name: 'Categories', path: '/admin/categories', icon: Squares2X2Icon },
  { name: 'Orders', path: '/admin/orders', icon: ClipboardDocumentListIcon },
  { name: 'Warranties', path: '/admin/warranties', icon: ShieldCheckIcon },
  { name: 'Users', path: '/admin/users', icon: UsersIcon },
  { name: 'Wholesaler Applications', path: '/admin/wholesaler-applications', icon: DocumentCheckIcon },
]

const wholesalerMenu = [
  { name: 'Dashboard', path: '/wholesaler', icon: HomeIcon },
  { name: 'Inventory', path: '/wholesaler/inventory', icon: CircleStackIcon },
  { name: 'Products', path: '/wholesaler/products', icon: ShoppingBagIcon },
  { name: 'Orders', path: '/wholesaler/orders', icon: ClipboardDocumentListIcon },
  { name: 'Sales', path: '/wholesaler/sales', icon: RectangleGroupIcon },
]

const customerMenu = [
  { name: 'Dashboard', path: '/customer', icon: HomeIcon },
  { name: 'Model Catalog', path: '/customer/models', icon: CubeIcon },
  { name: 'Find Battery', path: '/customer/find-battery', icon: WrenchScrewdriverIcon },
  { name: 'My Warranties', path: '/customer/warranties', icon: ShieldCheckIcon },
  { name: 'Claim Warranty', path: '/customer/claim', icon: DocumentCheckIcon },
  { name: 'Products', path: '/customer/products', icon: ShoppingBagIcon },
]

const panelLabel = {
  admin: 'Admin',
  wholesaler: 'Wholesaler',
  customer: 'Customer',
}

function isItemActive(pathname, itemPath) {
  if (itemPath === '/admin' || itemPath === '/wholesaler' || itemPath === '/customer') {
    return pathname === itemPath
  }

  return pathname === itemPath || pathname.startsWith(`${itemPath}/`)
}

export default function Sidebar({ role, collapsed = false }) {
  const location = useLocation()
  const menu = role === 'admin' ? adminMenu : role === 'wholesaler' ? wholesalerMenu : customerMenu

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="p-5 md:p-6">
        <p className={`text-xs uppercase tracking-[0.35em] text-[color:var(--muted)] ${collapsed ? 'hidden' : ''}`}>Command Center</p>
        <h1 className="text-2xl font-bold neon-title text-[color:var(--accent)]">
          {collapsed ? 'LV' : 'Lithovolt'}
        </h1>
        <p className={`text-sm text-[color:var(--muted)] ${collapsed ? 'hidden' : ''}`}>{panelLabel[role] || 'User'} Panel</p>
      </div>
      <nav className="sidebar-nav mt-2 md:mt-6">
        {menu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-item ${isItemActive(location.pathname, item.path) ? 'active' : ''}`}
            data-label={item.name}
            aria-label={item.name}
          >
            {item.icon ? <item.icon className="sidebar-item-icon h-4 w-4" strokeWidth={2.25} /> : null}
            <span className={`text-sm font-medium ${collapsed ? 'hidden' : ''}`}>{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}
