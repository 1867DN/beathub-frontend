import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Layout from './components/Layout'
import Home from './pages/Ecom/Home'
import ProductDetail from './pages/Ecom/ProductDetail'
import Cart from './pages/Ecom/Cart'
import BrandPage from './pages/Ecom/BrandPage'
import ProductsPage from './pages/Ecom/ProductsPage'
import BrandsPage from './pages/Ecom/BrandsPage'
import DiscountsPage from './pages/Ecom/DiscountsPage'
import NewArrivalsPage from './pages/Ecom/NewArrivalsPage'
import AboutPage from './pages/Ecom/AboutPage'
import ContactPage from './pages/Ecom/ContactPage'
import Checkout from './pages/Ecom/Checkout'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Profile from './pages/Auth/Profile'
import ForgotPassword from './pages/Auth/ForgotPassword'
import ResetPassword from './pages/Auth/ResetPassword'
import Relax from './pages/Relax/Relax'
import AdminDashboard from './pages/Admin/Dashboard'
import AdminProducts from './pages/Admin/Products'
import AdminCategories from './pages/Admin/Categories'
import AdminOrders from './pages/Admin/Orders'
import AdminUsers from './pages/Admin/Users'

function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" />
  if (!isAdmin) return <Navigate to="/" />
  return children
}

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" />
  return children
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Layout wrapper */}
        <Route element={<Layout />}>
          {/* Public ecom routes */}
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/brand/:id" element={<BrandPage />} />
          <Route path="/productos" element={<ProductsPage />} />
          <Route path="/marcas" element={<BrandsPage />} />
          <Route path="/descuentos" element={<DiscountsPage />} />
          <Route path="/nuevo" element={<NewArrivalsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Auth-required routes */}
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/relax" element={<ProtectedRoute><Relax /></ProtectedRoute>} />
          <Route path="/seguimiento" element={<Navigate to="/profile" />} />

          {/* Admin-only routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
          <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
          <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App
