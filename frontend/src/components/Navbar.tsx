import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCurrency, CURRENCY_MAP } from '../context/CurrencyContext';
import type { CurrencyCode } from '../context/CurrencyContext';
import { ShoppingCart, Heart, LogOut, LayoutDashboard, Store, Moon, Sun, ChevronDown, HelpCircle, ShieldCheck, CheckCircle2, UserCheck, Layers } from 'lucide-react';

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
  const [showSellModal, setShowSellModal] = useState(false);

  // Nav bar modals
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showManufacturersModal, setShowManufacturersModal] = useState(false);
  const [showOrderProtectionModal, setShowOrderProtectionModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  const activeItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.location.pathname === '/') {
      window.location.reload();
    } else {
      navigate('/');
    }
  };

  const countries = [
    { code: 'US', label: 'United States', flag: '🇺🇸', currency: 'USD' as CurrencyCode },
    { code: 'IN', label: 'India', flag: '🇮🇳', currency: 'INR' as CurrencyCode },
    { code: 'DE', label: 'Germany', flag: '🇪🇺', currency: 'EUR' as CurrencyCode },
    { code: 'GB', label: 'United Kingdom', flag: '🇬🇧', currency: 'GBP' as CurrencyCode }
  ];

  return (
    <header className="w-full border-b border-slate-200 dark:border-slate-850 shadow-sm bg-white dark:bg-slate-950 transition-colors duration-200 relative z-30">
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
            <span className="text-[10px] uppercase font-bold text-slate-440 dark:text-slate-500">Currency:</span>
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
          <button onClick={() => setShowSellModal(true)} className="hover:text-slate-950 dark:hover:text-white transition focus:outline-none">Sell on Platform</button>
        </div>
      </div>

      {/* 2. Main Logo & Search Bar Row */}
      <nav className="px-6 py-4 flex items-center justify-between bg-white dark:bg-slate-950 transition-colors duration-200">
        <div className="flex items-center space-x-8">
          <Link to="/" onClick={handleLogoClick} className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-1.5 tracking-tighter">
            <Store className="w-7 h-7 text-indigo-650 dark:text-indigo-400" />
            rb<span className="text-indigo-650 dark:text-indigo-400 font-extrabold">cart</span>
          </Link>
          
          {/* Navigation Bar links - now fully interactive */}
          <div className="hidden lg:flex items-center space-x-5 text-sm font-bold">
            <button 
              onClick={() => setShowCategoriesModal(true)}
              className="text-slate-600 dark:text-slate-300 hover:text-indigo-650 dark:hover:text-indigo-400 transition focus:outline-none cursor-pointer"
            >
              All categories
            </button>
            <button 
              onClick={() => setShowManufacturersModal(true)}
              className="text-slate-500 dark:text-slate-400 hover:text-indigo-650 dark:hover:text-indigo-400 transition focus:outline-none cursor-pointer"
            >
              Verified manufacturers
            </button>
            <button 
              onClick={() => setShowOrderProtectionModal(true)}
              className="text-slate-500 dark:text-slate-400 hover:text-indigo-650 dark:hover:text-indigo-400 transition focus:outline-none cursor-pointer"
            >
              Order protection
            </button>
            <button 
              onClick={() => setShowAboutModal(true)}
              className="text-slate-500 dark:text-slate-400 hover:text-indigo-650 dark:hover:text-indigo-400 transition focus:outline-none cursor-pointer"
            >
              About E-Comm
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
          >
            {darkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-slate-800" />}
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
              <Link to="/register" className="bg-indigo-655 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold px-4 py-2 rounded-full shadow-md transition text-sm">
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
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl text-slate-855 dark:text-slate-200 transition-colors duration-200">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-850 pb-3">
              <HelpCircle className="w-6 h-6 text-indigo-550" />
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Help Center</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Welcome to RB Cart Customer Support. Choose an option below to learn more about warehouse orders and Sandbox payments:</p>
            
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-850">
                <span className="font-bold block text-slate-850 dark:text-slate-100">📦 Order Tracking Statuses</span>
                <span className="text-slate-500 dark:text-slate-400 block mt-1">Navigate to your customer profile dashboard to view the active order logistics state from CONFIRMED to DELIVERED.</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-855">
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

      {/* Category List Modal */}
      {showCategoriesModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl text-slate-800 dark:text-slate-200 transition-colors duration-200">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-850 pb-3">
              <Layers className="w-6 h-6 text-indigo-500" />
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Active Product Categories</h3>
            </div>
            <p className="text-xs text-slate-550 dark:text-slate-400">Select a category below to explore our logistics catalog. Click on an option to filter:</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <button onClick={() => { setShowCategoriesModal(false); navigate('/'); }} className="p-3 bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50 dark:hover:bg-slate-850 rounded-xl border border-slate-205 dark:border-slate-800 font-bold text-left transition">💻 Electronics</button>
              <button onClick={() => { setShowCategoriesModal(false); navigate('/'); }} className="p-3 bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50 dark:hover:bg-slate-850 rounded-xl border border-slate-205 dark:border-slate-800 font-bold text-left transition">👕 Apparel</button>
              <button onClick={() => { setShowCategoriesModal(false); navigate('/'); }} className="p-3 bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50 dark:hover:bg-slate-850 rounded-xl border border-slate-205 dark:border-slate-800 font-bold text-left transition">🏃 Sports & Outdoors</button>
              <button onClick={() => { setShowCategoriesModal(false); navigate('/'); }} className="p-3 bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50 dark:hover:bg-slate-850 rounded-xl border border-slate-205 dark:border-slate-800 font-bold text-left transition">🍳 Home & Kitchen</button>
            </div>
            <button onClick={() => setShowCategoriesModal(false)} className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition border border-slate-200 dark:border-slate-700">Close</button>
          </div>
        </div>
      )}

      {/* Verified Manufacturers Modal */}
      {showManufacturersModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl text-slate-800 dark:text-slate-200 transition-colors duration-200">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-850 pb-3">
              <UserCheck className="w-6 h-6 text-indigo-500" />
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Verified Manufacturers</h3>
            </div>
            <p className="text-xs text-slate-550 dark:text-slate-400">All registered supplier accounts have passed strict corporate business license audits:</p>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-850 flex justify-between items-center">
                <div>
                  <span className="font-bold block text-slate-850 dark:text-slate-200">TechCorp Industry Inc.</span>
                  <span className="text-[10px] text-slate-500">License verified &middot; East Warehouse hub</span>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-extrabold">Active</span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-850 flex justify-between items-center">
                <div>
                  <span className="font-bold block text-slate-850 dark:text-slate-200">FitWear Apparel Ltd.</span>
                  <span className="text-[10px] text-slate-500">License verified &middot; West Warehouse hub</span>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-extrabold">Active</span>
              </div>
            </div>
            <button onClick={() => setShowManufacturersModal(false)} className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition border border-slate-200 dark:border-slate-700">Close</button>
          </div>
        </div>
      )}

      {/* Order Protection Modal */}
      {showOrderProtectionModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl text-slate-800 dark:text-slate-200 transition-colors duration-200">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-850 pb-3">
              <Store className="w-6 h-6 text-indigo-500" />
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Order Protection Guarantee</h3>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                <div>
                  <span className="font-bold block">100% Escrow Payments</span>
                  <span className="text-slate-500">Payments are safely secured in Sandbox Stripe escrow and only settled once warehouse orders reach CONFIRMED logistics states.</span>
                </div>
              </div>
              <div className="flex gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                <div>
                  <span className="font-bold block">Tracking & Transit Inspection</span>
                  <span className="text-slate-500">Each shipment is assigned a distinct tracking number, letting you monitor real-world states transparently.</span>
                </div>
              </div>
            </div>
            <button onClick={() => setShowOrderProtectionModal(false)} className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition border border-slate-200 dark:border-slate-700">Close</button>
          </div>
        </div>
      )}

      {/* About Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl text-slate-800 dark:text-slate-200 transition-colors duration-200">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-850 pb-3">
              <Store className="w-6 h-6 text-indigo-550" />
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">About rb cart E-Comm</h3>
            </div>
            <p className="text-xs text-slate-550 dark:text-slate-400">
              rb cart is an enterprise-scale supply chain simulation demonstrating full role-based permissions, multi-warehouse stock reservation rules, and advanced UI design parameters.
            </p>
            <div className="space-y-1.5 text-[11px] bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-850">
              <span className="block">🚀 **Seeded Items**: 1,020 buyable products</span>
              <span className="block">📦 **Logistics hubs**: East Coast (NYC) & West Coast (LA)</span>
              <span className="block">💸 **Multi-Currency**: Automatic time-zone geo detection</span>
            </div>
            <button onClick={() => setShowAboutModal(false)} className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition border border-slate-200 dark:border-slate-700">Close</button>
          </div>
        </div>
      )}

      {/* Sell on Platform Modal */}
      {showSellModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl text-slate-800 dark:text-slate-200 transition-colors duration-200">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-850 pb-3">
              <ShieldCheck className="w-6 h-6 text-indigo-500" />
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Supplier Onboarding</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Apply to list your manufacturing inventory on the RB Cart network. Submit details for administrative warehouse verification:</p>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-450 dark:text-slate-500 mb-1">Company Name</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-350 dark:border-slate-880 rounded-lg p-2 text-xs text-slate-900 dark:text-white focus:outline-none" 
                  placeholder="Acme Electronics Corp" 
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-450 dark:text-slate-500 mb-1">Business License Code</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-350 dark:border-slate-880 rounded-lg p-2 text-xs text-slate-900 dark:text-white focus:outline-none" 
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
