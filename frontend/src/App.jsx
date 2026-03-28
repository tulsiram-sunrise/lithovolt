import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { authAPI } from './services/api'

// Layouts
import AuthLayout from './components/layout/AuthLayout'
import AdminLayout from './components/layout/AdminLayout'
import WholesalerLayout from './components/layout/WholesalerLayout'
import CustomerLayout from './components/layout/CustomerLayout'
import GuestLayout from './components/layout/GuestLayout'

// Auth Pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import VerifyEmailPage from './pages/auth/VerifyEmailPage'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import UsersPage from './pages/admin/UsersPage'
import RolesPage from './pages/admin/RolesPage'
import PermissionsPage from './pages/admin/PermissionsPage'
import ActivityPage from './pages/admin/ActivityPage'
import BatteryModelsPage from './pages/admin/BatteryModelsPage'
import BatteryModelCreatePage from './pages/admin/BatteryModelCreatePage'
import BatteryModelDetailPage from './pages/admin/BatteryModelDetailPage'
import BatteryModelEditPage from './pages/admin/BatteryModelEditPage'
import InventoryPage from './pages/admin/InventoryPage'
import ProductsPage from './pages/admin/ProductsPage'
import CategoriesPage from './pages/admin/CategoriesPage'
import OrdersPage from './pages/admin/OrdersPage'
import WarrantiesPage from './pages/admin/WarrantiesPage'
import WarrantyClaimsPage from './pages/admin/WarrantyClaimsPage'
import WholesalerManagementPage from './pages/admin/WholesalerManagementPage'
import ConsumersPage from './pages/admin/ConsumersPage'

// Wholesaler Pages
import WholesalerDashboard from './pages/wholesaler/Dashboard'
import WholesalerInventory from './pages/wholesaler/InventoryPage'
import WholesalerOrders from './pages/wholesaler/OrdersPage'
import WholesalerPlaceOrder from './pages/wholesaler/PlaceOrderPage'
import WholesalerSales from './pages/wholesaler/SalesPage'
import WholesalerProducts from './pages/wholesaler/ProductsPage'

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard'
import CustomerWarrantiesPage from './pages/customer/WarrantiesPage'
import CustomerClaimPage from './pages/customer/ClaimWarrantyPage'
import CustomerClaimsPage from './pages/customer/ClaimsPage'
import CustomerWholesalerRegister from './pages/customer/WholesalerRegisterPage'
import CustomerProducts from './pages/customer/ProductsPage'
import CustomerModelCatalogPage from './pages/customer/ModelCatalogPage'
import CustomerModelDetailPage from './pages/customer/ModelDetailPage'
import CustomerBatteryFinderPage from './pages/customer/BatteryFinderPage'
import CustomerProfilePage from './pages/customer/ProfilePage'
import CustomerEditProfilePage from './pages/customer/EditProfilePage'
import CustomerChangePasswordPage from './pages/customer/ChangePasswordPage'

// Guest Pages
import GuestLandingPage from './pages/guest/GuestLandingPage'
import GuestModelCatalogPage from './pages/guest/GuestModelCatalogPage'
import GuestModelDetailPage from './pages/guest/GuestModelDetailPage'
import GuestBatteryFinderPage from './pages/guest/GuestBatteryFinderPage'
import GuestAboutPage from './pages/guest/GuestAboutPage'
import GuestContactPage from './pages/guest/GuestContactPage'
import GuestSupportPage from './pages/guest/GuestSupportPage'
import UnauthorizedPage from './pages/common/UnauthorizedPage'

function App() {
  const { isAuthenticated, token, updateUser, logout } = useAuthStore()
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    let isMounted = true

    // Keep tests deterministic while preserving runtime bootstrap validation.
    if (import.meta.env.MODE === 'test') {
      setAuthReady(true)
      return () => {
        isMounted = false
      }
    }

    const bootstrapAuth = async () => {
      if (!isAuthenticated || !token) {
        if (isMounted) {
          setAuthReady(true)
        }
        return
      }

      try {
        const response = await authAPI.profile()
        if (isMounted && response?.data) {
          updateUser(response.data)
        }
      } catch {
        if (isMounted) {
          logout()
        }
      } finally {
        if (isMounted) {
          setAuthReady(true)
        }
      }
    }

    bootstrapAuth()

    return () => {
      isMounted = false
    }
  }, [isAuthenticated, token, updateUser, logout])

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center text-[color:var(--muted)]">
        Checking your session...
      </div>
    )
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="verify-email" element={<VerifyEmailPage />} />
      </Route>

      {/* Public Browsing Routes (No /guest prefix) */}
      <Route element={<GuestLayout />}>
        <Route path="/" element={<GuestLandingPage />} />
        <Route path="/about" element={<GuestAboutPage />} />
        <Route path="/contact" element={<GuestContactPage />} />
        <Route path="/support" element={<GuestSupportPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/models" element={<GuestModelCatalogPage />} />
        <Route path="/models/:id" element={<GuestModelDetailPage />} />
        <Route path="/find-battery" element={<GuestBatteryFinderPage />} />
      </Route>

      {/* Legacy /guest redirects */}
      <Route path="/guest" element={<Navigate to="/" replace />} />
      <Route path="/guest/models" element={<Navigate to="/models" replace />} />
      <Route path="/guest/find-battery" element={<Navigate to="/find-battery" replace />} />

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute roles={['ADMIN']} authReady={authReady}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="profile" element={<CustomerProfilePage />} />
        <Route path="profile/edit" element={<CustomerEditProfilePage />} />
        <Route path="profile/change-password" element={<CustomerChangePasswordPage />} />
        <Route path="users" element={<UsersPage defaultTab="users" />} />
        <Route path="consumers" element={<ConsumersPage />} />
        <Route path="wholesalers" element={<WholesalerManagementPage />} />
        <Route path="roles" element={<RolesPage />} />
        <Route path="permissions" element={<PermissionsPage />} />
        <Route path="staff" element={<UsersPage defaultTab="staff" />} />
        <Route path="activity" element={<ActivityPage />} />
        <Route path="battery-models" element={<BatteryModelsPage />} />
        <Route path="battery-models/new" element={<BatteryModelCreatePage />} />
        <Route path="battery-models/:id" element={<BatteryModelDetailPage />} />
        <Route path="battery-models/:id/edit" element={<BatteryModelEditPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="warranties" element={<WarrantiesPage />} />
        <Route path="warranty-claims" element={<WarrantyClaimsPage />} />
      </Route>

      {/* Wholesaler Routes */}
      <Route
        path="/wholesaler/*"
        element={
          <ProtectedRoute roles={['WHOLESALER']} authReady={authReady}>
            <WholesalerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<WholesalerDashboard />} />
        <Route path="profile" element={<CustomerProfilePage />} />
        <Route path="profile/edit" element={<CustomerEditProfilePage />} />
        <Route path="profile/change-password" element={<CustomerChangePasswordPage />} />
        <Route path="inventory" element={<WholesalerInventory />} />
        <Route path="products" element={<WholesalerProducts />} />
        <Route path="orders" element={<WholesalerOrders />} />
        <Route path="orders/new" element={<WholesalerPlaceOrder />} />
        <Route path="sales" element={<WholesalerSales />} />
      </Route>

      {/* Customer Routes */}
      <Route
        path="/customer/*"
        element={
          <ProtectedRoute roles={['CONSUMER', 'RETAILER']} authReady={authReady}>
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CustomerDashboard />} />
        <Route path="profile" element={<CustomerProfilePage />} />
        <Route path="profile/edit" element={<CustomerEditProfilePage />} />
        <Route path="profile/change-password" element={<CustomerChangePasswordPage />} />
        <Route path="models" element={<CustomerModelCatalogPage />} />
        <Route path="models/:id" element={<CustomerModelDetailPage />} />
        <Route path="find-battery" element={<CustomerBatteryFinderPage />} />
        <Route path="warranties" element={<CustomerWarrantiesPage />} />
        <Route path="claim" element={<CustomerClaimPage />} />
        <Route path="claims" element={<CustomerClaimsPage />} />
        <Route path="products" element={<CustomerProducts />} />
        <Route path="wholesaler-register" element={<CustomerWholesalerRegister />} />
      </Route>

      {/* Default Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// Protected Route Component
function ProtectedRoute({ children, roles, authReady }) {
  const { user, isAuthenticated } = useAuthStore()

  if (!authReady) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const roleName = String(user?.role?.name || user?.role || '').toUpperCase()

  if (roles && !roles.includes(roleName)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export default App
