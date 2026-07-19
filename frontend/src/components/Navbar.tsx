import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCurrency, CURRENCY_MAP } from '../context/CurrencyContext';
import type { CurrencyCode } from '../context/CurrencyContext';
import { ShoppingCart, Heart, LogOut, LayoutDashboard, Store, Moon, Sun, Award } from 'lucide-react';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ darkMode, setDarkMode }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { cartItems } = useCart();
  const { currency, setCurrency } = useCurrency();
  const navigate = useNavigate();

  const activeItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="w-full border-b border-slate-800 shadow-md">
      {/* 1. Alibaba Top Utility Strip */}
      <div className="bg-slate-950 px-6 py-2 flex items-center justify-between text-xs text-slate-400 border-b border-slate-900">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-1.5 cursor-pointer hover:text-white transition">
            <span>Deliver to:</span>
            <span className="font-extrabold text-white flex items-center gap-1">
              {CURRENCY_MAP[currency].flag} {currency === 'INR' ? 'IN' : currency === 'EUR' ? 'EU' : currency === 'GBP' ? 'GB' : 'US'}
            </span>
          </div>
          <span className="hidden md:inline">English-{currency}</span>
          
          {/* Currency dropdown selector */}
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-bold text-slate-500">Currency:</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="bg-slate-900 border border-slate-700 rounded text-slate-200 p-0.5 px-1 cursor-pointer focus:outline-none hover:text-white"
            >
              <option value="USD">🇺🇸 USD ($)</option>
              <option value="INR">🇮🇳 INR (₹)</option>
              <option value="EUR">🇪🇺 EUR (€)</option>
              <option value="GBP">🇬🇧 GBP (£)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <Link to="/help" className="hover:text-white transition">Help Center</Link>
          <Link to="/rfq" className="hover:text-white transition flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-orange-400" /> Accio Work
          </Link>
          <span className="hover:text-white transition cursor-pointer">Sell on Platform</span>
        </div>
      </div>

      {/* 2. Main Logo & Search Bar Row */}
      <nav className="glass px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/" className="text-2xl font-black bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent flex items-center gap-1.5 tracking-tighter">
            <Store className="w-7 h-7 text-orange-500" />
            Alibaba<span className="text-white text-base font-medium">.clone</span>
          </Link>
          
          <div className="hidden lg:flex items-center space-x-5 text-sm font-semibold">
            <Link to="/" className="text-slate-300 hover:text-orange-500 transition">All categories</Link>
            <span className="text-slate-400 cursor-pointer hover:text-orange-500 transition">Verified manufacturers</span>
            <span className="text-slate-400 cursor-pointer hover:text-orange-500 transition">Order protection</span>
            <span className="text-slate-400 cursor-pointer hover:text-orange-500 transition">About E-Comm</span>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="text-slate-400 hover:text-white transition p-2 rounded-lg bg-slate-800"
          >
            {darkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {isAuthenticated ? (
            <>
              {/* Role Specific Actions */}
              {user?.roles.includes('ROLE_ADMIN') && (
                <Link to="/admin" className="text-orange-400 hover:text-orange-300 flex items-center gap-1 font-bold text-xs uppercase tracking-wider bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/20">
                  <LayoutDashboard className="w-3.5 h-3.5" /> Admin
                </Link>
              )}
              {user?.roles.includes('ROLE_WAREHOUSE_MANAGER') && (
                <Link to="/warehouse" className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold text-xs uppercase tracking-wider bg-cyan-500/10 px-3 py-1.5 rounded-full border border-cyan-500/20">
                  <LayoutDashboard className="w-3.5 h-3.5" /> Warehouse
                </Link>
              )}
              {user?.roles.includes('ROLE_SUPPLIER') && (
                <Link to="/supplier" className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold text-xs uppercase tracking-wider bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                  <LayoutDashboard className="w-3.5 h-3.5" /> Supplier
                </Link>
              )}

              {user?.customerId && (
                <>
                  <Link to="/wishlist" className="relative text-slate-300 hover:text-rose-500 transition p-2">
                    <Heart className="w-5 h-5" />
                  </Link>
                  <Link to="/cart" className="relative text-slate-300 hover:text-orange-400 transition p-2">
                    <ShoppingCart className="w-5 h-5" />
                    {activeItemsCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-orange-500 text-white font-bold text-[10px] rounded-full w-4.5 h-4.5 flex items-center justify-center animate-bounce">
                        {activeItemsCount}
                      </span>
                    )}
                  </Link>
                </>
              )}

              <div className="flex items-center space-x-4 border-l border-slate-800 pl-4">
                <span className="hidden sm:inline text-xs text-slate-400 font-medium">
                  {user?.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-rose-400 transition flex items-center gap-1 p-2 bg-slate-900 rounded-lg border border-slate-800"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-slate-300 hover:text-white transition font-medium text-sm">Sign in</Link>
              <Link to="/register" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-full shadow-md transition text-sm">
                Create account
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};
