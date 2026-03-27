import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

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
import BatteryModelsPage from './pages/admin/BatteryModelsPage'
import BatteryModelCreatePage from './pages/admin/BatteryModelCreatePage'
import BatteryModelDetailPage from './pages/admin/BatteryModelDetailPage'
import BatteryModelEditPage from './pages/admin/BatteryModelEditPage'
import InventoryPage from './pages/admin/InventoryPage'
import ProductsPage from './pages/admin/ProductsPage'
import CategoriesPage from './pages/admin/CategoriesPage'
import OrdersPage from './pages/admin/OrdersPage'
import WarrantiesPage from './pages/admin/WarrantiesPage'
import WholesalerApplicationsPage from './pages/admin/WholesalerApplicationsPage'

// Wholesaler Pages
import WholesalerDashboard from './pages/wholesaler/Dashboard'
import WholesalerInventory from './pages/wholesaler/InventoryPage'
import WholesalerOrders from './pages/wholesaler/OrdersPage'
import WholesalerSales from './pages/wholesaler/SalesPage'
import WholesalerProducts from './pages/wholesaler/ProductsPage'

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard'
import CustomerWarrantiesPage from './pages/customer/WarrantiesPage'
import CustomerClaimPage from './pages/customer/ClaimWarrantyPage'
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

function App() {
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
          <ProtectedRoute roles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="profile" element={<CustomerProfilePage />} />
        <Route path="profile/edit" element={<CustomerEditProfilePage />} />
        <Route path="profile/change-password" element={<CustomerChangePasswordPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="battery-models" element={<BatteryModelsPage />} />
        <Route path="battery-models/new" element={<BatteryModelCreatePage />} />
        <Route path="battery-models/:id" element={<BatteryModelDetailPage />} />
        <Route path="battery-models/:id/edit" element={<BatteryModelEditPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="warranties" element={<WarrantiesPage />} />
        <Route path="wholesaler-applications" element={<WholesalerApplicationsPage />} />
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
        <Route path="profile" element={<CustomerProfilePage />} />
        <Route path="profile/edit" element={<CustomerEditProfilePage />} />
        <Route path="profile/change-password" element={<CustomerChangePasswordPage />} />
        <Route path="inventory" element={<WholesalerInventory />} />
        <Route path="products" element={<WholesalerProducts />} />
        <Route path="orders" element={<WholesalerOrders />} />
        <Route path="sales" element={<WholesalerSales />} />
      </Route>

      {/* Customer Routes */}
      <Route
        path="/customer/*"
        element={
          <ProtectedRoute roles={['CONSUMER', 'RETAILER']}>
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
        <Route path="products" element={<CustomerProducts />} />
        <Route path="wholesaler-register" element={<CustomerWholesalerRegister />} />
      </Route>

      {/* Default Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
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
