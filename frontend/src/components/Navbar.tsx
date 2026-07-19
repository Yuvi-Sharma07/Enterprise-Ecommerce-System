import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCurrency, CURRENCY_MAP } from '../context/CurrencyContext';
import type { CurrencyCode } from '../context/CurrencyContext';
import { ShoppingCart, Heart, LogOut, LayoutDashboard, Store, Moon, Sun, Award, ChevronDown, HelpCircle, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ darkMode, setDarkMode }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { cartItems } = useCart();
  const { currency, setCurrency } = useCurrency();
  const navigate = useNavigate();

  // Overlay states
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAccioModal, setShowAccioModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);

  const activeItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const countries = [
    { code: 'US', label: 'United States', flag: '🇺🇸', currency: 'USD' as CurrencyCode },
    { code: 'IN', label: 'India', flag: '🇮🇳', currency: 'INR' as CurrencyCode },
    { code: 'DE', label: 'Germany', flag: '🇪🇺', currency: 'EUR' as CurrencyCode },
    { code: 'GB', label: 'United Kingdom', flag: '🇬🇧', currency: 'GBP' as CurrencyCode }
  ];

  return (
    <header className="w-full border-b border-slate-200 dark:border-slate-850 shadow-sm bg-white dark:bg-slate-950 transition-colors duration-200 relative">
      {/* 1. Top Utility Strip */}
      <div className="bg-slate-50 dark:bg-slate-950 px-6 py-2 flex items-center justify-between text-xs text-slate-550 dark:text-slate-400 border-b border-slate-200 dark:border-slate-900 transition-colors duration-200 relative z-30">
        <div className="flex items-center space-x-6">
          
          {/* Interactive Country Selection Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
              className="flex items-center space-x-1.5 cursor-pointer hover:text-slate-900 dark:hover:text-white transition focus:outline-none"
            >
              <span>Deliver to:</span>
              <span className="font-extrabold text-slate-800 dark:text-white flex items-center gap-1">
                {CURRENCY_MAP[currency].flag} {currency === 'INR' ? 'IN' : currency === 'EUR' ? 'EU' : currency === 'GBP' ? 'GB' : 'US'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {showCountryDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowCountryDropdown(false)} />
                <div className="absolute top-full left-0 mt-1.5 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg z-50 py-1 transition-colors duration-200">
                  {countries.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => {
                        setCurrency(c.currency);
                        setShowCountryDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
                    >
                      <span>{c.flag}</span>
                      <span>{c.label} ({c.currency})</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <span className="hidden md:inline">English-{currency}</span>
          
          {/* Currency dropdown selector */}
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Currency:</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="bg-white dark:bg-slate-900 border border-slate-350 dark:border-slate-850 rounded text-slate-700 dark:text-slate-200 p-0.5 px-1.5 cursor-pointer focus:outline-none hover:text-slate-900 dark:hover:text-white text-[11px]"
            >
              <option value="USD">🇺🇸 USD ($)</option>
              <option value="INR">🇮🇳 INR (₹)</option>
              <option value="EUR">🇪🇺 EUR (€)</option>
              <option value="GBP">🇬🇧 GBP (£)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <button onClick={() => setShowHelpModal(true)} className="hover:text-slate-950 dark:hover:text-white transition focus:outline-none">Help Center</button>
          <button onClick={() => setShowAccioModal(true)} className="hover:text-slate-950 dark:hover:text-white transition flex items-center gap-1 focus:outline-none">
            <Award className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> Accio Work
          </button>
          <button onClick={() => setShowSellModal(true)} className="hover:text-slate-950 dark:hover:text-white transition focus:outline-none">Sell on Platform</button>
        </div>
      </div>

      {/* 2. Main Logo & Search Bar Row */}
      <nav className="px-6 py-4 flex items-center justify-between bg-white dark:bg-slate-950 transition-colors duration-200">
        <div className="flex items-center space-x-8">
          <Link to="/" className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-1.5 tracking-tighter">
            <Store className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            rb<span className="text-indigo-600 dark:text-indigo-400 font-extrabold">cart</span>
          </Link>
          
          <div className="hidden lg:flex items-center space-x-5 text-sm font-semibold">
            <Link to="/" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">All categories</Link>
            <span className="text-slate-500 dark:text-slate-400 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition">Verified manufacturers</span>
            <span className="text-slate-500 dark:text-slate-400 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition">Order protection</span>
            <span className="text-slate-500 dark:text-slate-400 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition">About E-Comm</span>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
          >
            {darkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {isAuthenticated ? (
            <>
              {/* Role Specific Actions */}
              {user?.roles.includes('ROLE_ADMIN') && (
                <Link to="/admin" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 flex items-center gap-1 font-bold text-xs uppercase tracking-wider bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">
                  <LayoutDashboard className="w-3.5 h-3.5" /> Admin
                </Link>
              )}
              {user?.roles.includes('ROLE_WAREHOUSE_MANAGER') && (
                <Link to="/warehouse" className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 flex items-center gap-1 font-bold text-xs uppercase tracking-wider bg-cyan-500/10 px-3 py-1.5 rounded-full border border-cyan-500/20">
                  <LayoutDashboard className="w-3.5 h-3.5" /> Warehouse
                </Link>
              )}
              {user?.roles.includes('ROLE_SUPPLIER') && (
                <Link to="/supplier" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 flex items-center gap-1 font-bold text-xs uppercase tracking-wider bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                  <LayoutDashboard className="w-3.5 h-3.5" /> Supplier
                </Link>
              )}

              {user?.customerId && (
                <>
                  <Link to="/wishlist" className="relative text-slate-500 dark:text-slate-300 hover:text-rose-500 transition p-2">
                    <Heart className="w-5 h-5" />
                  </Link>
                  <Link to="/cart" className="relative text-slate-500 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition p-2">
                    <ShoppingCart className="w-5 h-5" />
                    {activeItemsCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-indigo-600 dark:bg-indigo-500 text-white font-bold text-[10px] rounded-full w-4.5 h-4.5 flex items-center justify-center animate-bounce">
                        {activeItemsCount}
                      </span>
                    )}
                  </Link>
                </>
              )}

              <div className="flex items-center space-x-4 border-l border-slate-200 dark:border-slate-800 pl-4">
                <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {user?.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-slate-500 dark:text-slate-400 hover:text-rose-550 dark:hover:text-rose-400 transition flex items-center gap-1 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition font-medium text-sm">Sign in</Link>
              <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-650 text-white font-bold px-4 py-2 rounded-full shadow-md transition text-sm">
                Create account
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* 3. Interactive Modals */}
      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl text-slate-800 dark:text-slate-200 transition-colors duration-200">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <HelpCircle className="w-6 h-6 text-indigo-500" />
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Help Center</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Welcome to RB Cart Customer Support. Choose an option below to learn more about warehouse orders and Sandbox payments:</p>
            
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-850">
                <span className="font-bold block text-slate-850 dark:text-slate-100">📦 Order Tracking Statuses</span>
                <span className="text-slate-500 dark:text-slate-400 block mt-1">Navigate to your customer profile dashboard to view the active order logistics state from CONFIRMED to DELIVERED.</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-850">
                <span className="font-bold block text-slate-850 dark:text-slate-100">💳 Card Payment Mockups</span>
                <span className="text-slate-500 dark:text-slate-400 block mt-1">Use the Stripe testing sandbox inputs. Choose Visa Standard to settle the transaction immediately, or visa declining options to check validation failures.</span>
              </div>
            </div>
            
            <button 
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-750 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold rounded-xl text-xs transition"
            >
              Close Support Panel
            </button>
          </div>
        </div>
      )}

      {/* Accio Work Project Details Modal */}
      {showAccioModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-xl text-slate-800 dark:text-slate-200 transition-colors duration-200">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <Award className="w-6 h-6 text-indigo-500" />
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Accio Work Project Details</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">This platform showcases a robust enterprise-ready supply chain schema suitable for a Senior Software Engineer portfolio:</p>
            
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-850">
                <span className="font-bold block">Backend Stack</span>
                <span className="text-slate-500">Java Spring Boot 3.3, JPA Hibernate, JWT Sec, PostgreSQL.</span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-850">
                <span className="font-bold block">Frontend Stack</span>
                <span className="text-slate-500">React v19, TypeScript, Tailwind CSS, Axios interceptors.</span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-850">
                <span className="font-bold block">Caching & Performance</span>
                <span className="text-slate-500">Spring Redis sorted sets tracking frequently viewed SKUs.</span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-850">
                <span className="font-bold block">Payment Gateway</span>
                <span className="text-slate-500">Stripe charge settlement with programmatic stock hold reservation.</span>
              </div>
            </div>
            
            <button 
              onClick={() => setShowAccioModal(false)}
              className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-750 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold rounded-xl text-xs transition"
            >
              Close Information
            </button>
          </div>
        </div>
      )}

      {/* Sell on Platform Modal */}
      {showSellModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl text-slate-800 dark:text-slate-200 transition-colors duration-200">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <ShieldCheck className="w-6 h-6 text-indigo-500" />
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Supplier Onboarding</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Apply to list your manufacturing inventory on the RB Cart network. Submit details for administrative warehouse verification:</p>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-450 dark:text-slate-500 mb-1">Company Name</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-350 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-900 dark:text-white focus:outline-none" 
                  placeholder="Acme Electronics Corp" 
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-450 dark:text-slate-500 mb-1">Business License Code</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-350 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-900 dark:text-white focus:outline-none" 
                  placeholder="LIC-US-998827" 
                />
              </div>
            </div>
            
            <button 
              onClick={() => {
                alert("Supplier Onboarding Application Submitted!");
                setShowSellModal(false);
              }}
              className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-750 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold rounded-xl text-xs transition"
            >
              Submit Application
            </button>
            <button 
              onClick={() => setShowSellModal(false)}
              className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-750 dark:text-slate-200 font-bold rounded-xl text-xs transition border border-slate-200 dark:border-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
