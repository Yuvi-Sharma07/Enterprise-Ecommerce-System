import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Heart, LogOut, LayoutDashboard, Store, Moon, Sun } from 'lucide-react';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ darkMode, setDarkMode }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const activeItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass sticky top-0 z-50 w-full px-6 py-4 flex items-center justify-between border-b border-slate-800 shadow-lg">
      <div className="flex items-center space-x-8">
        <Link to="/" className="text-2xl font-extrabold bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent flex items-center gap-2">
          <Store className="w-6 h-6 text-purple-400" />
          Enterprise E-Comm
        </Link>
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/" className="text-slate-300 hover:text-white transition font-medium">Browse Catalog</Link>
          {isAuthenticated && user?.roles.includes('ROLE_ADMIN') && (
            <Link to="/admin" className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium">
              <LayoutDashboard className="w-4 h-4" /> Admin
            </Link>
          )}
          {isAuthenticated && user?.roles.includes('ROLE_WAREHOUSE_MANAGER') && (
            <Link to="/warehouse" className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium">
              <LayoutDashboard className="w-4 h-4" /> Warehouse
            </Link>
          )}
          {isAuthenticated && user?.roles.includes('ROLE_SUPPLIER') && (
            <Link to="/supplier" className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium">
              <LayoutDashboard className="w-4 h-4" /> Supplier
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="text-slate-400 hover:text-white transition p-2 rounded-lg bg-slate-800"
        >
          {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}
        </button>

        {isAuthenticated ? (
          <>
            {user?.customerId && (
              <>
                <Link to="/wishlist" className="relative text-slate-300 hover:text-rose-500 transition p-2">
                  <Heart className="w-6 h-6" />
                </Link>
                <Link to="/cart" className="relative text-slate-300 hover:text-purple-400 transition p-2">
                  <ShoppingCart className="w-6 h-6" />
                  {activeItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-purple-500 text-white font-bold text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                      {activeItemsCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            <div className="flex items-center space-x-4 border-l border-slate-700 pl-6">
              <span className="hidden sm:inline text-sm text-slate-400 font-medium">
                {user?.email} ({user?.roles?.[0]?.replace('ROLE_', '')})
              </span>
              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-rose-400 transition flex items-center gap-1 p-2 bg-slate-800 rounded-lg"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-slate-300 hover:text-white transition font-medium">Log In</Link>
            <Link to="/register" className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
