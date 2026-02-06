import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

// Layouts
import AuthLayout from './components/layout/AuthLayout'
import AdminLayout from './components/layout/AdminLayout'
import WholesalerLayout from './components/layout/WholesalerLayout'

// Auth Pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import UsersPage from './pages/admin/UsersPage'
import BatteryModelsPage from './pages/admin/BatteryModelsPage'
import InventoryPage from './pages/admin/InventoryPage'
import OrdersPage from './pages/admin/OrdersPage'
import WarrantiesPage from './pages/admin/WarrantiesPage'

// Wholesaler Pages
import WholesalerDashboard from './pages/wholesaler/Dashboard'
import WholesalerInventory from './pages/wholesaler/InventoryPage'
import WholesalerOrders from './pages/wholesaler/OrdersPage'
import WholesalerSales from './pages/wholesaler/SalesPage'

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="battery-models" element={<BatteryModelsPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="warranties" element={<WarrantiesPage />} />
      </Route>

      {/* Wholesaler Routes */}
      <Route
        path="/wholesaler/*"
        element={
          <ProtectedRoute roles={['WHOLESALER']}>
            <WholesalerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<WholesalerDashboard />} />
        <Route path="inventory" element={<WholesalerInventory />} />
        <Route path="orders" element={<WholesalerOrders />} />
        <Route path="sales" element={<WholesalerSales />} />
      </Route>

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

// Protected Route Component
function ProtectedRoute({ children, roles }) {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default App
