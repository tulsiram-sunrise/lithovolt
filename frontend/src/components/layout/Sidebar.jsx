import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  HomeIcon,
  CubeIcon,
  Squares2X2Icon,
  ClipboardDocumentListIcon,
  ShieldCheckIcon,
  UsersIcon,
  KeyIcon,
  IdentificationIcon,
  ClockIcon,
  DocumentCheckIcon,
  CircleStackIcon,
  ShoppingBagIcon,
  RectangleGroupIcon,
  WrenchScrewdriverIcon,
  BoltIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'

const adminMenuGroups = [
  {
    id: 'overview',
    name: 'Overview',
    items: [
      { name: 'Dashboard', path: '/admin', icon: HomeIcon },
      { name: 'Activity Audit', path: '/admin/activity', icon: ClockIcon },
    ],
  },
  {
    id: 'catalog',
    name: 'Catalog & Stock',
    items: [
      { name: 'Battery Models', path: '/admin/battery-models', icon: BoltIcon },
      { name: 'Inventory', path: '/admin/inventory', icon: CircleStackIcon },
      { name: 'Products', path: '/admin/products', icon: ShoppingBagIcon },
      { name: 'Categories', path: '/admin/categories', icon: Squares2X2Icon },
    ],
  },
  {
    id: 'operations',
    name: 'Operations',
    items: [
      { name: 'Orders', path: '/admin/orders', icon: ClipboardDocumentListIcon },
      { name: 'Warranties', path: '/admin/warranties', icon: ShieldCheckIcon },
      { name: 'Claims', path: '/admin/warranty-claims', icon: DocumentCheckIcon },
      { name: 'Consumers', path: '/admin/consumers', icon: UsersIcon },
      { name: 'Wholesalers', path: '/admin/wholesalers', icon: UsersIcon },
    ],
  },
  {
    id: 'governance',
    name: 'Access Governance',
    items: [
      { name: 'People & Access', path: '/admin/users', icon: UsersIcon },
      { name: 'Role Groups', path: '/admin/roles', icon: KeyIcon },
      { name: 'Permissions', path: '/admin/permissions', icon: IdentificationIcon },
    ],
  },
]

const wholesalerMenuGroups = [
  {
    id: 'overview',
    name: 'Overview',
    items: [{ name: 'Dashboard', path: '/wholesaler', icon: HomeIcon }],
  },
  {
    id: 'operations',
    name: 'Operations',
    items: [
      { name: 'My Stock', path: '/wholesaler/inventory', icon: CircleStackIcon },
      { name: 'Products', path: '/wholesaler/products', icon: ShoppingBagIcon },
      { name: 'Place Order', path: '/wholesaler/orders/new', icon: DocumentCheckIcon },
      { name: 'Orders', path: '/wholesaler/orders', icon: ClipboardDocumentListIcon },
      { name: 'Sales', path: '/wholesaler/sales', icon: RectangleGroupIcon },
    ],
  },
]

const customerMenuGroups = [
  {
    id: 'overview',
    name: 'Overview',
    items: [{ name: 'Dashboard', path: '/customer', icon: HomeIcon }],
  },
  {
    id: 'browse',
    name: 'Explore',
    items: [
      { name: 'Model Catalog', path: '/customer/models', icon: CubeIcon },
      { name: 'Find Battery', path: '/customer/find-battery', icon: WrenchScrewdriverIcon },
      { name: 'Products', path: '/customer/products', icon: ShoppingBagIcon },
    ],
  },
  {
    id: 'support',
    name: 'Warranty Support',
    items: [
      { name: 'My Warranties', path: '/customer/warranties', icon: ShieldCheckIcon },
      { name: 'Claim Warranty', path: '/customer/claim', icon: DocumentCheckIcon },
      { name: 'My Claims', path: '/customer/claims', icon: ClipboardDocumentListIcon },
    ],
  },
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
  const menuGroups = role === 'admin' ? adminMenuGroups : role === 'wholesaler' ? wholesalerMenuGroups : customerMenuGroups
  const [openGroups, setOpenGroups] = useState({})

  const activeGroupIds = useMemo(() => {
    return menuGroups
      .filter((group) => group.items.some((item) => isItemActive(location.pathname, item.path)))
      .map((group) => group.id)
  }, [location.pathname, menuGroups])

  useEffect(() => {
    setOpenGroups((previous) => {
      const nextState = { ...previous }
      activeGroupIds.forEach((groupId) => {
        if (typeof nextState[groupId] === 'undefined') {
          nextState[groupId] = true
        }
      })

      menuGroups.forEach((group) => {
        if (typeof nextState[group.id] === 'undefined') {
          nextState[group.id] = !collapsed
        }
      })

      return nextState
    })
  }, [activeGroupIds, collapsed, menuGroups])

  const handleToggleGroup = (groupId) => {
    setOpenGroups((previous) => ({
      ...previous,
      [groupId]: !previous[groupId],
    }))
  }

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
        {menuGroups.map((group) => {
          const groupIsOpen = collapsed ? true : !!openGroups[group.id]
          const groupHasActiveChild = group.items.some((item) => isItemActive(location.pathname, item.path))

          return (
            <div key={group.id} className={`sidebar-group ${groupHasActiveChild ? 'active' : ''}`}>
              {!collapsed ? (
                <button
                  type="button"
                  className={`sidebar-group-trigger ${groupHasActiveChild ? 'active' : ''}`}
                  onClick={() => handleToggleGroup(group.id)}
                >
                  <span>{group.name}</span>
                  <ChevronDownIcon className={`h-4 w-4 transition-transform ${groupIsOpen ? 'rotate-180' : ''}`} />
                </button>
              ) : null}

              {groupIsOpen ? (
                <div className={`sidebar-submenu ${collapsed ? 'collapsed' : ''}`}>
                  {group.items.map((item) => (
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
                </div>
              ) : null}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
