import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { useAuth } from './context/AuthContext';
import { Login, Register, VerifyEmail, ForgotPassword, ResetPassword } from './pages/AuthPages';
import { Catalog, ProductDetails, CartPage, CheckoutPage, CustomerProfile } from './pages/CustomerPortal';
import { AdminDashboard } from './pages/AdminDashboard';
import { WarehouseDashboard } from './pages/WarehouseDashboard';
import { SupplierDashboard } from './pages/SupplierDashboard';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <div className="text-center p-20 text-slate-450">Verifying session context...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && user) {
    const hasRole = user.roles.some((role) => allowedRoles.includes(role));
    if (!hasRole) return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      root.style.backgroundColor = '#0b0f19';
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '#f8fafc';
    }
  }, [darkMode]);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} transition-colors duration-200`}>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <main className="container mx-auto py-6">
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetails />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/cart" element={<ProtectedRoute allowedRoles={['ROLE_CUSTOMER']}><CartPage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute allowedRoles={['ROLE_CUSTOMER']}><CheckoutPage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute allowedRoles={['ROLE_CUSTOMER']}><CustomerProfile /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute allowedRoles={['ROLE_CUSTOMER']}><Catalog /></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/warehouse" element={<ProtectedRoute allowedRoles={['ROLE_WAREHOUSE_MANAGER', 'ROLE_ADMIN']}><WarehouseDashboard /></ProtectedRoute>} />
          <Route path="/supplier" element={<ProtectedRoute allowedRoles={['ROLE_SUPPLIER', 'ROLE_ADMIN']}><SupplierDashboard /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
