import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { SettingsProvider } from './contexts/SettingsContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminLayout from './components/AdminLayout';

// Public & Customer Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderTracking from './pages/OrderTracking';
import Login from './pages/Login';
import Register from './pages/Register';
import Account, { AccountProfile } from './pages/Account';
import AccountOrders from './pages/AccountOrders';
import AccountOrderDetail from './pages/AccountOrderDetail';
import AccountAddresses from './pages/AccountAddresses';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Policies from './pages/Policies';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminProductForm from './pages/admin/ProductForm';
import AdminCategories from './pages/admin/Categories';
import AdminOrders from './pages/admin/Orders';
import AdminOrderDetail from './pages/admin/OrderDetail';
import AdminInventory from './pages/admin/Inventory';
import AdminSettings from './pages/admin/Settings';
import AdminCoupons from './pages/admin/Coupons';
import AdminCustomers from './pages/admin/Customers';

// Route Guards
const CustomerProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const AdminProtectedRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export const App = () => {
  return (
    <AuthProvider>
      <SettingsProvider>
        <CartProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#0f172a',
                color: '#f8fafc',
                borderRadius: '16px',
                fontSize: '13px',
                padding: '12px 18px',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#0f172a',
                },
              },
            }}
          />

          <Routes>
            {/* Admin Portal Routes (Wrapped in AdminLayout) */}
            <Route
              path="/admin/*"
              element={
                <AdminProtectedRoute>
                  <AdminLayout>
                    <Routes>
                      <Route path="/" element={<AdminDashboard />} />
                      <Route path="/products" element={<AdminProducts />} />
                      <Route path="/products/new" element={<AdminProductForm />} />
                      <Route path="/products/:id/edit" element={<AdminProductForm />} />
                      <Route path="/categories" element={<AdminCategories />} />
                      <Route path="/orders" element={<AdminOrders />} />
                      <Route path="/orders/:id" element={<AdminOrderDetail />} />
                      <Route path="/inventory" element={<AdminInventory />} />
                      <Route path="/settings" element={<AdminSettings />} />
                      <Route path="/coupons" element={<AdminCoupons />} />
                      <Route path="/customers" element={<AdminCustomers />} />
                      <Route path="*" element={<Navigate to="/admin" replace />} />
                    </Routes>
                  </AdminLayout>
                </AdminProtectedRoute>
              }
            />

            {/* Public Storefront Routes (Wrapped in Navbar & Footer) */}
            <Route
              path="/*"
              element={
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/shop" element={<Shop />} />
                      <Route path="/shop/:slug" element={<ProductDetail />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmation />} />
                      <Route path="/track-order" element={<OrderTracking />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />

                      {/* Customer Account Subroutes */}
                      <Route
                        path="/account"
                        element={
                          <CustomerProtectedRoute>
                            <Account />
                          </CustomerProtectedRoute>
                        }
                      >
                        <Route index element={<AccountProfile />} />
                        <Route path="orders" element={<AccountOrders />} />
                        <Route path="orders/:orderNumber" element={<AccountOrderDetail />} />
                        <Route path="addresses" element={<AccountAddresses />} />
                      </Route>

                      {/* Informational Pages */}
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/faq" element={<FAQ />} />
                      <Route path="/shipping-policy" element={<Policies />} />
                      <Route path="/return-policy" element={<Policies />} />
                      <Route path="/privacy-policy" element={<Policies />} />
                      <Route path="/terms" element={<Policies />} />

                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              }
            />
          </Routes>
        </CartProvider>
      </SettingsProvider>
    </AuthProvider>
  );
};

export default App;
