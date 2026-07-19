import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import API from '../services/api';
import { 
  Search, Filter, ShoppingBag, Eye, Heart, Star, Award, 
  CheckCircle, Tag, Clock, ArrowRight, ShieldCheck, 
  Camera, MessageCircle, HelpCircle, Zap, Sparkles 
} from 'lucide-react';

export const Catalog: React.FC = () => {
  const { user } = useAuth();
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [frequentlyViewed, setFrequentlyViewed] = useState<any[]>([]);

  // Search & Filters state
  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Active tabs
  const [searchTab, setSearchTab] = useState<'products' | 'manufacturers' | 'worldwide' | 'ai'>('products');

  // Wishlist state
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);

  // Image search modal states
  const [showImageSearchModal, setShowImageSearchModal] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState(false);

  // AI Search states
  const [aiQuery, setAiQuery] = useState('');
  const [aiSearching, setAiSearching] = useState(false);

  // AI Chat Bot states
  const [showAIChat, setShowAIChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([
    { sender: 'bot', text: 'Hello! I am your RB Cart AI Assistant. Ask me anything about tracking your packages, warehouse stock details, or product discounts!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleAISearch = (promptText: string) => {
    if (!promptText.trim()) return;
    setAiQuery(promptText);
    setAiSearching(true);
    setTimeout(() => {
      const text = promptText.toLowerCase();
      let matchedKeyword = '';
      if (text.includes('keyboard') || text.includes('keyboards')) {
        matchedKeyword = 'Keyboard';
      } else if (text.includes('earbud') || text.includes('earbuds') || text.includes('buds') || text.includes('headphones')) {
        matchedKeyword = 'Buds';
      } else if (text.includes('shoe') || text.includes('shoes') || text.includes('sneaker') || text.includes('sneakers')) {
        matchedKeyword = 'Sneakers';
      } else if (text.includes('blender') || text.includes('juicer')) {
        matchedKeyword = 'Blender';
      } else if (text.includes('kettle')) {
        matchedKeyword = 'Kettle';
      } else if (text.includes('hoodie') || text.includes('hoodies')) {
        matchedKeyword = 'Hoodie';
      } else if (text.includes('jacket') || text.includes('jackets')) {
        matchedKeyword = 'Jacket';
      } else if (text.includes('mat') || text.includes('yoga')) {
        matchedKeyword = 'Mat';
      } else {
        matchedKeyword = promptText.split(' ').slice(0, 2).join(' ');
      }
      setQuery(matchedKeyword);
      setAiSearching(false);
    }, 1200);
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const text = userMsg.toLowerCase();
      let botResponse = "That sounds interesting! You can search our 1,020 high-quality products or ask me to check active warehouse inventories.";

      if (text.includes('track') || text.includes('order')) {
        botResponse = "You can view all order progress on your Profile page. We track order states dynamically from CONFIRMED -> PROCESSED -> SHIPPED -> DELIVERED!";
      } else if (text.includes('coupon') || text.includes('discount') || text.includes('promo')) {
        botResponse = "Try applying coupon codes 'WELCOME10' or 'BIGDISCOUNT' during checkout for up to 20% off!";
      } else if (text.includes('warehouse') || text.includes('stock') || text.includes('inventory')) {
        botResponse = "We have fully stocked distribution centers in New York (East Coast) and Los Angeles (West Coast) for overnight shipping!";
      } else if (text.includes('hello') || text.includes('hi') || text.includes('hey')) {
        botResponse = "Hello there! How can I assist you with your shopping experience today?";
      }

      setChatMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
    }, 1000);
  };

  const fetchFilters = async () => {
    try {
      const catRes = await API.get('/products/categories');
      setCategories(catRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      let url = `/products?page=${page}&size=8&sortBy=${sortBy}&direction=DESC`;
      if (query) url += `&query=${encodeURIComponent(query)}`;
      if (selectedCat) url += `&categoryId=${selectedCat}`;
      if (minPrice) url += `&minPrice=${minPrice}`;
      if (maxPrice) url += `&maxPrice=${maxPrice}`;

      const res = await API.get(url);
      setProducts(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFrequentlyViewed = async () => {
    try {
      const res = await API.get('/products/frequently-viewed?limit=4');
      setFrequentlyViewed(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchWishlist = async () => {
    if (!user || !user.customerId) return;
    try {
      const res = await API.get(`/wishlist/${user.customerId}`);
      const list = res.data.map((w: any) => w.product.id);
      setWishlistIds(list);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFilters();
    fetchFrequentlyViewed();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [query, selectedCat, minPrice, maxPrice, sortBy, page]);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const toggleWishlist = async (productId: number) => {
    if (!user || !user.customerId) {
      alert('Please log in as customer to use wishlist');
      return;
    }
    try {
      if (wishlistIds.includes(productId)) {
        await API.delete(`/wishlist/${user.customerId}/remove?productId=${productId}`);
        setWishlistIds(wishlistIds.filter(id => id !== productId));
      } else {
        await API.post(`/wishlist/${user.customerId}/add?productId=${productId}`);
        setWishlistIds([...wishlistIds, productId]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 px-4 py-6 relative text-slate-800 dark:text-slate-200 transition-colors duration-200">
      {/* 1. Hero Header Search Banner */}
      <div className="bg-slate-100 dark:bg-slate-900/40 p-8 rounded-3xl text-center space-y-6 relative overflow-hidden border border-slate-200 dark:border-slate-850 transition-colors duration-200">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 blur-xl pointer-events-none" />
        
        {/* Search Mode Tabs */}
        <div className="flex justify-center space-x-8 text-sm font-bold border-b border-slate-200 dark:border-slate-800 pb-3 max-w-md mx-auto">
          <button 
            onClick={() => setSearchTab('ai')}
            className={`flex items-center gap-1 transition ${searchTab === 'ai' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> AI Mode
          </button>
          <button 
            onClick={() => setSearchTab('products')}
            className={`transition ${searchTab === 'products' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 pb-2.5 -mb-3' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Products
          </button>
          <button 
            onClick={() => setSearchTab('manufacturers')}
            className={`transition ${searchTab === 'manufacturers' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Manufacturers
          </button>
          <button 
            onClick={() => setSearchTab('worldwide')}
            className={`transition ${searchTab === 'worldwide' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Worldwide
          </button>
        </div>

        {/* Render Search bar or custom AI NLP box depending on tab selection */}
        {searchTab === 'ai' ? (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="relative border-2 border-indigo-650 dark:border-indigo-500 rounded-2xl bg-white dark:bg-slate-950 p-4 shadow-md transition-colors duration-200">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>AI NATURAL LANGUAGE PARSING SEARCH ACTIVE</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAISearch(aiQuery);
                  }}
                  className="w-full bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-450 dark:placeholder-slate-500 focus:outline-none text-sm px-2 py-1.5"
                  placeholder="Ask our AI Agent: e.g. 'Find high quality earbuds under 100 dollars' or 'recommend warm hoodies'..."
                />
                <button 
                  onClick={() => handleAISearch(aiQuery)}
                  className="bg-indigo-650 hover:bg-indigo-750 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {aiSearching ? 'Analyzing...' : 'Parse Search'}
                </button>
              </div>
              {aiSearching && (
                <div className="text-[11px] text-slate-450 dark:text-slate-500 block text-left mt-2 animate-pulse">
                  🔮 AI Agent: Resolving semantic intents and matching warehouse stocks...
                </div>
              )}
            </div>

            {/* Quick AI Prompts */}
            <div className="flex flex-wrap gap-2 justify-center text-xs">
              <button 
                onClick={() => handleAISearch('List top-rated mechanical keyboards')}
                className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 rounded-full text-slate-700 dark:text-slate-350 font-semibold transition cursor-pointer"
              >
                ✨ "List top-rated mechanical keyboards"
              </button>
              <button 
                onClick={() => handleAISearch('Find athletic sports shoes under 50')}
                className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 rounded-full text-slate-700 dark:text-slate-350 font-semibold transition cursor-pointer"
              >
                ✨ "Find athletic sports shoes under $50"
              </button>
              <button 
                onClick={() => handleAISearch('Recommend kitchen blenders')}
                className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 rounded-full text-slate-700 dark:text-slate-350 font-semibold transition cursor-pointer"
              >
                ✨ "Recommend kitchen blenders"
              </button>
            </div>
          </div>
        ) : (
          /* Rounded Indigo Search Bar */
          <div className="max-w-3xl mx-auto relative mt-4 border-2 border-indigo-600 dark:border-indigo-500 rounded-full bg-white dark:bg-slate-950 p-1 flex items-center shadow-md dark:shadow-indigo-500/5 transition-colors duration-200">
            <div className="flex items-center space-x-2 pl-4 text-slate-450 dark:text-slate-500">
              <Search className="w-5 h-5" />
              <span className="text-xs text-slate-300 dark:text-slate-700">|</span>
            </div>
            
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent border-none pl-2 pr-12 py-2.5 text-slate-900 dark:text-white placeholder-slate-450 dark:placeholder-slate-500 focus:outline-none text-sm"
              placeholder="Search thousands of buyable products, SKU serials..."
            />

            {/* Camera Mock Icon */}
            <button 
              onClick={() => setShowImageSearchModal(true)}
              className="absolute right-36 cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition flex items-center gap-1.5 text-xs font-semibold pr-3 border-r border-slate-200 dark:border-slate-800 focus:outline-none"
            >
              <Camera className="w-4.5 h-4.5 text-indigo-500 dark:text-indigo-400" />
              <span className="hidden sm:inline">Image Search</span>
            </button>

            <button className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold px-7 py-2.5 rounded-full text-sm transition flex items-center gap-1 ml-auto cursor-pointer">
              <Search className="w-4 h-4" /> Search
            </button>
          </div>
        )}

        <p className="text-slate-500 dark:text-slate-400 text-xs mt-2">Welcome to rb cart. Browse thousands of buyable products across our worldwide logistics warehouses.</p>
      </div>

      {/* 2. Three Column Layout: Sidebar Category + Products + Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side Category Navigation */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl h-fit space-y-6 shadow-sm transition-colors duration-200">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <Filter className="w-4 h-4 text-indigo-500 dark:text-indigo-400" /> Categories
          </h3>
          <div className="space-y-3.5 text-xs text-slate-550 dark:text-slate-400 font-semibold">
            {categories.map((c) => (
              <div 
                key={c.id}
                onClick={() => setSelectedCat(selectedCat === c.id.toString() ? '' : c.id.toString())}
                className={`flex justify-between items-center p-2.5 rounded-lg cursor-pointer transition ${
                  selectedCat === c.id.toString() ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                <span>{c.name}</span>
                <span className="text-slate-400 dark:text-slate-600 font-bold">&rarr;</span>
              </div>
            ))}
          </div>

          {/* Price Bounds Filter */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-5 space-y-4">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Filter Price Bounds</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-350 dark:border-slate-800 rounded p-2 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-350 dark:border-slate-800 rounded p-2 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Center Main Catalog Grid */}
        <div className="lg:col-span-6 space-y-8">
          <div className="flex justify-between items-center border-b border-slate-205 dark:border-slate-800 pb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Found {products.length} Products</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded text-xs text-slate-800 dark:text-white p-1"
            >
              <option value="id">Sort: Relevance</option>
              <option value="price">Sort: Price</option>
              <option value="name">Sort: Name</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map((p) => (
              <div key={p.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden hover:border-indigo-500/30 hover:shadow-indigo-500/5 transition flex flex-col justify-between shadow-sm">
                <div className="relative">
                  <img
                    src={p.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'}
                    alt={p.name}
                    className="w-full h-44 object-cover border-b border-slate-200 dark:border-slate-800"
                  />
                  <button
                    onClick={() => toggleWishlist(p.id)}
                    className={`absolute top-3 right-3 p-2 rounded-full bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 transition ${
                      wishlistIds.includes(p.id) ? 'text-rose-500' : 'text-slate-400'
                    }`}
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                </div>
                <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-650 dark:text-indigo-400 uppercase tracking-wide">{p.categoryName}</span>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white hover:text-indigo-650 dark:hover:text-indigo-400 transition cursor-pointer mt-1">
                      <Link to={`/product/${p.id}`}>{p.name}</Link>
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 mt-1">{p.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-lg font-black text-slate-900 dark:text-white">{formatPrice(p.price)}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider ${
                      p.stockLevel > 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}>
                      {p.stockLevel > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
                {p.stockLevel > 0 && user?.customerId ? (
                  <button
                    onClick={() => addItem(p.id, 1)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold transition flex items-center justify-center gap-1.5 text-xs"
                  >
                    <ShoppingBag className="w-4 h-4" /> Add to Cart
                  </button>
                ) : (
                  <Link
                    to={`/product/${p.id}`}
                    className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold transition text-center text-xs"
                  >
                    View Details
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-250 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold disabled:opacity-50 transition"
              >
                Prev
              </button>
              <span className="text-slate-500 text-xs">Page {page + 1} of {totalPages}</span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-250 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold disabled:opacity-50 transition"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Right Side Widgets: Frequently Searched / Banners */}
        <div className="lg:col-span-3 space-y-6">
          {/* Frequently searched widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl space-y-4 shadow-sm transition-colors duration-200">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wide border-b border-slate-200 dark:border-slate-800 pb-2">Frequently Searched</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold"><Zap className="w-5 h-5" /></div>
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-white block">Smart Watches</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-500">12k+ daily requests</span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold"><Award className="w-5 h-5" /></div>
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-white block">Acoustic Earbuds</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-500">8k+ daily requests</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hot Picks Banner widget */}
          <div className="relative rounded-2xl overflow-hidden h-64 border border-slate-200 dark:border-slate-800 flex flex-col justify-end p-5 shadow-sm">
            <img 
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600" 
              alt="Promo Banner" 
              className="absolute inset-0 w-full h-full object-cover brightness-50 dark:brightness-40"
            />
            <div className="relative z-10 space-y-2">
              <span className="text-[10px] bg-indigo-600 dark:bg-indigo-500 text-white font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">Hot Picks</span>
              <h4 className="font-extrabold text-lg text-white">Classic Apparel Fashion</h4>
              <p className="text-xs text-slate-200 dark:text-slate-300">Up to 20% off with promo coupon codes.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Viewed Row */}
      {frequentlyViewed.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl space-y-4 shadow-sm transition-colors duration-200">
          <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
            <Eye className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Frequently Viewed Items
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {frequentlyViewed.map((fv) => (
              <div key={fv.id} className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-850 hover:border-indigo-550/20 transition flex items-center space-x-3">
                <img
                  src={fv.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'}
                  alt={fv.name}
                  className="w-14 h-14 object-cover rounded-lg border border-slate-200 dark:border-slate-800"
                />
                <div className="min-w-0 flex-grow">
                  <Link to={`/product/${fv.id}`} className="block text-xs font-bold text-slate-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 truncate">{fv.name}</Link>
                  <span className="text-[10px] text-slate-500 dark:text-slate-500 block truncate">{fv.brandName}</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold text-xs block mt-0.5">{formatPrice(fv.price)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Assistance Side panel */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-50">
        <button 
          onClick={() => setShowAIChat(!showAIChat)}
          className="p-3.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-full shadow-xl transition hover:scale-105 cursor-pointer focus:outline-none"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
        <button className="p-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white rounded-full shadow-xl border border-slate-200 dark:border-slate-700 transition focus:outline-none">
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Floating AI Chatbot overlay */}
      {showAIChat && (
        <div className="fixed bottom-24 right-6 w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-55 flex flex-col overflow-hidden transition-all duration-300 text-slate-800 dark:text-slate-205">
          {/* Header */}
          <div className="p-4 bg-indigo-600 dark:bg-indigo-500 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <div>
                <span className="font-extrabold block text-xs">RB Cart AI Chatbot</span>
                <span className="text-[10px] text-indigo-100 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-pulse" /> Online &middot; Instant Help
                </span>
              </div>
            </div>
            <button 
              onClick={() => setShowAIChat(false)}
              className="text-white hover:text-slate-200 text-xs font-bold focus:outline-none cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div className="p-4 flex-grow h-72 overflow-y-auto space-y-3.5 bg-slate-50 dark:bg-slate-950/40">
            {chatMessages.map((m, idx) => (
              <div 
                key={idx} 
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-2xl p-3 text-xs shadow-sm ${
                    m.sender === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-900 text-slate-500 rounded-2xl rounded-tl-none p-3 text-[11px] border border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          {/* Input area */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChat();
            }}
            className="p-3 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about coupons, warehouse, orders..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
            <button 
              type="submit"
              className="bg-indigo-650 hover:bg-indigo-755 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition focus:outline-none cursor-pointer"
            >
              Send
            </button>
          </form>

        </div>
      )}

      {/* Interactive Mock Image Search Modal */}
      {showImageSearchModal && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl text-slate-800 dark:text-slate-200 relative overflow-hidden transition-colors duration-200">
            
            {analyzingImage ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-600 animate-spin" />
                <span className="text-sm font-bold text-slate-900 dark:text-white animate-pulse">AI Computer Vision Classifier</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">Extracting feature vectors & matching against 1,000+ catalog SKUs...</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <Camera className="w-6 h-6 text-indigo-550 dark:text-indigo-400" />
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">AI Image Classification Search</h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Drag & drop your product photo or select a quick sample below to scan the catalog using computer vision:</p>
                
                {/* Drag and drop mock zone */}
                <div 
                  onClick={() => {
                    setAnalyzingImage(true);
                    setTimeout(() => {
                      setQuery('Keyboard');
                      setAnalyzingImage(false);
                      setShowImageSearchModal(false);
                      alert("AI Vision Classifier: Uploaded file detected as 'Mechanical Keyboard'. Applied search filter!");
                    }, 1500);
                  }}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-2xl p-8 text-center cursor-pointer transition bg-slate-50 dark:bg-slate-950/60"
                >
                  <Sparkles className="w-8 h-8 text-indigo-550 dark:text-indigo-400 mx-auto mb-2 animate-bounce" />
                  <span className="text-xs font-bold block text-slate-700 dark:text-slate-300">Drag photo here or browse files</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">Supports PNG, JPG up to 5MB</span>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-450 dark:text-slate-500 block">Select Mock Sample Photo:</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        setAnalyzingImage(true);
                        setTimeout(() => {
                          setQuery('Keyboard');
                          setAnalyzingImage(false);
                          setShowImageSearchModal(false);
                        }, 1500);
                      }}
                      className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-500 text-[10px] font-bold bg-slate-50 dark:bg-slate-950 transition-all text-slate-800 dark:text-slate-200"
                    >
                      ⌨️ Keyboard
                    </button>
                    <button
                      onClick={() => {
                        setAnalyzingImage(true);
                        setTimeout(() => {
                          setQuery('Sneakers');
                          setAnalyzingImage(false);
                          setShowImageSearchModal(false);
                        }, 1500);
                      }}
                      className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-500 text-[10px] font-bold bg-slate-50 dark:bg-slate-950 transition-all text-slate-800 dark:text-slate-200"
                    >
                      👟 Sneakers
                    </button>
                    <button
                      onClick={() => {
                        setAnalyzingImage(true);
                        setTimeout(() => {
                          setQuery('Blender');
                          setAnalyzingImage(false);
                          setShowImageSearchModal(false);
                        }, 1500);
                      }}
                      className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-500 text-[10px] font-bold bg-slate-50 dark:bg-slate-950 transition-all text-slate-800 dark:text-slate-200"
                    >
                      🍹 Blender
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => setShowImageSearchModal(false)}
                  className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-750 dark:text-slate-200 font-bold rounded-xl text-xs transition border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export const ProductDetails: React.FC = () => {
  const { user } = useAuth();
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const [product, setProduct] = useState<any>(null);
  const [barcodeImg, setBarcodeImg] = useState('');
  const [qrcodeImg, setQrcodeImg] = useState('');
  
  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [avgRating, setAvgRating] = useState(0.0);

  const [id, setId] = useState<number>(0);

  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const prodId = Number(pathParts[pathParts.length - 1]);
    if (prodId) {
      setId(prodId);
    }
  }, []);

  const fetchProduct = async () => {
    if (!id) return;
    try {
      const res = await API.get(`/products/${id}`);
      setProduct(res.data);
      
      // Load Barcode & QR Code Base64
      const barcodeRes = await API.get(`/util/barcode?text=${res.data.sku}`);
      setBarcodeImg(barcodeRes.data.image);
      const qrcodeRes = await API.get(`/util/qrcode?text=${res.data.sku}`);
      setQrcodeImg(qrcodeRes.data.image);

      // Load Reviews
      const revRes = await API.get(`/reviews/product/${id}`);
      setReviews(revRes.data);

      const avgRes = await API.get(`/reviews/product/${id}/average`);
      setAvgRating(avgRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.customerId) {
      alert('Please log in as customer to submit reviews');
      return;
    }
    try {
      await API.post(`/reviews?productId=${id}&customerId=${user.customerId}&rating=${rating}&reviewText=${encodeURIComponent(reviewText)}`);
      alert('Review submitted! It will appear after admin moderation.');
      setReviewText('');
    } catch (err) {
      console.error(err);
    }
  };

  if (!product) return <div className="text-center p-20 text-slate-500 dark:text-slate-400">Loading Product details...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10 text-slate-800 dark:text-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm transition-colors duration-200">
        {/* Product Image */}
        <div>
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'}
            alt={product.name}
            className="w-full h-96 object-cover rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full">{product.categoryName}</span>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{product.name}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs">{product.brandName} &bull; SKU: <code className="text-indigo-600 dark:text-indigo-400 font-bold">{product.sku}</code></p>
          </div>

          <div className="flex items-center gap-2 text-yellow-500 dark:text-yellow-400">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{avgRating ? avgRating.toFixed(1) : 'No Rating'}</span>
            <span className="text-slate-500 text-xs">({reviews.length} reviews)</span>
          </div>

          <p className="text-slate-650 dark:text-slate-300 leading-relaxed text-sm">{product.description}</p>

          <div className="flex items-center justify-between border-y border-slate-200 dark:border-slate-800 py-4">
            <div>
              <span className="text-slate-500 text-[10px] block font-bold uppercase tracking-wider">Converted Price</span>
              <span className="text-3xl font-black text-slate-900 dark:text-white">{formatPrice(product.price)}</span>
            </div>
            {product.stockLevel > 0 ? (
              <button
                onClick={() => addItem(product.id, 1)}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold rounded-xl transition flex items-center gap-2 text-sm shadow-md"
              >
                <ShoppingBag className="w-4 h-4" /> Add to Cart
              </button>
            ) : (
              <span className="px-6 py-2.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg font-bold border border-rose-500/20 text-xs">Sold Out</span>
            )}
          </div>

          {/* Barcode details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-4 rounded-xl text-center space-y-2">
              <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">1D SKU Barcode</span>
              {barcodeImg ? <img src={barcodeImg} alt="Barcode" className="mx-auto h-12" /> : <div className="text-xs text-slate-650">Generating...</div>}
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-4 rounded-xl text-center space-y-2">
              <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">QR Code Locator</span>
              {qrcodeImg ? <img src={qrcodeImg} alt="QR Code" className="mx-auto h-16" /> : <div className="text-xs text-slate-650">Generating...</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Review Submission & Ratings List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Write Review Form */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl h-fit space-y-4 col-span-1 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-650 dark:text-indigo-400" /> Share Feedback
          </h3>
          <form onSubmit={submitReview} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-550 dark:text-slate-400 mb-1">Rating Stars</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-350 dark:border-slate-800 rounded p-2 text-slate-805 dark:text-white text-xs focus:outline-none"
              >
                <option value="5">5 Stars (Excellent)</option>
                <option value="4">4 Stars (Very Good)</option>
                <option value="3">3 Stars (Average)</option>
                <option value="2">2 Stars (Poor)</option>
                <option value="1">1 Star (Unacceptable)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-550 dark:text-slate-400 mb-1">Review Message</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-350 dark:border-slate-800 rounded p-2 text-slate-805 dark:text-white text-xs h-24 focus:outline-none"
                placeholder="Share your experience with this product..."
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold rounded-lg text-xs transition"
            >
              Post Review
            </button>
          </form>
        </div>

        {/* Reviews List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl col-span-2 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">Approved Customer Reviews ({reviews.length})</h3>
          {reviews.length === 0 ? (
            <p className="text-slate-500 text-xs">No reviewed entries found for this SKU.</p>
          ) : (
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
              {reviews.map((r) => (
                <div key={r.id} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-850 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {r.customer.firstName} {r.customer.lastName.substring(0, 1)}.
                    </span>
                    <div className="flex text-yellow-500 dark:text-yellow-400">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-650 dark:text-slate-400 text-xs italic">"{r.reviewText}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const CartPage: React.FC = () => {
  const { user } = useAuth();
  const { cartItems, savedItems, totalAmount, updateQuantity, removeItem, toggleSaveForLater } = useCart();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  if (!user || !user.customerId) {
    return <div className="text-center p-20 text-slate-550 dark:text-slate-400">Please log in as Customer to access your shopping cart.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 text-slate-800 dark:text-slate-200">
      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Your Shopping Cart</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-indigo-650 dark:text-indigo-400 uppercase tracking-wider border-b border-slate-202 dark:border-slate-800 pb-2">Active Items ({cartItems.length})</h3>
            {cartItems.length === 0 ? (
              <p className="text-slate-500 text-xs">Your shopping cart is currently empty.</p>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-850 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded-lg border border-slate-200 dark:border-slate-800"
                      />
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white text-sm"><Link to={`/product/${item.productId}`} className="hover:underline">{item.productName}</Link></h4>
                        <span className="text-indigo-600 dark:text-indigo-400 text-xs font-bold">{formatPrice(item.price)}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="px-2.5 py-1 text-slate-500 hover:text-slate-800 dark:hover:text-white transition"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-slate-800 dark:text-white text-xs font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="px-2.5 py-1 text-slate-500 hover:text-slate-800 dark:hover:text-white transition"
                        >
                          +
                        </button>
                      </div>
                      <button onClick={() => toggleSaveForLater(item.productId)} className="text-xs text-indigo-650 dark:text-indigo-400 hover:underline">Save Later</button>
                      <button onClick={() => removeItem(item.productId)} className="text-xs text-rose-500 hover:underline">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Items */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">Saved For Later ({savedItems.length})</h3>
            {savedItems.length === 0 ? (
              <p className="text-slate-500 text-xs">No items saved for later.</p>
            ) : (
              <div className="space-y-4">
                {savedItems.map((item) => (
                  <div key={item.id} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-850 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'}
                        alt={item.productName}
                        className="w-12 h-12 object-cover rounded-lg border border-slate-200 dark:border-slate-800"
                      />
                      <div>
                        <h4 className="font-bold text-slate-850 dark:text-white text-sm">{item.productName}</h4>
                        <span className="text-indigo-650 dark:text-indigo-400 text-xs font-bold">{formatPrice(item.price)}</span>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button onClick={() => toggleSaveForLater(item.productId)} className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">Move to Cart</button>
                      <button onClick={() => removeItem(item.productId)} className="text-xs text-rose-500 hover:underline">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl h-fit space-y-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-850 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">Subtotal Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-slate-500 dark:text-slate-400 text-xs">
              <span>Items Total</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400 text-xs">
              <span>Standard Shipping</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">FREE</span>
            </div>
            <div className="flex justify-between text-slate-900 dark:text-white font-extrabold text-base border-t border-slate-200 dark:border-slate-800 pt-3">
              <span>Final Total</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
          </div>

          <button
            disabled={cartItems.length === 0}
            onClick={() => navigate('/checkout')}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm"
          >
            Proceed to Secure Checkout <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const CheckoutPage: React.FC = () => {
  const { user } = useAuth();
  const { cartItems, totalAmount, clearCart } = useCart();
  const { formatPrice } = useCurrency();

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [couponError, setCouponError] = useState('');

  // Payment State
  const [stripeToken, setStripeToken] = useState('pm_card_visa');
  const [loading, setLoading] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'success'>('details');
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  const applyCoupon = async () => {
    setCouponError('');
    try {
      const res = await API.get(`/coupons/validate?code=${couponCode}`);
      setAppliedDiscount(res.data);
    } catch (err: any) {
      setCouponError(err.response?.data?.message || 'Invalid coupon');
    }
  };

  const getDiscountedTotal = () => {
    if (!appliedDiscount) return totalAmount;
    if (appliedDiscount.discountType === 'PERCENTAGE') {
      const disc = totalAmount * (appliedDiscount.discountValue / 100);
      return Math.max(0, totalAmount - disc);
    }
    return Math.max(0, totalAmount - appliedDiscount.discountValue);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.customerId) return;
    setLoading(true);
    try {
      // 1. Trigger Order Checkout creation
      const checkoutRes = await API.post('/orders/checkout', {
        customerId: user.customerId,
        couponCode: appliedDiscount ? appliedDiscount.code : undefined,
      });

      const orderId = checkoutRes.data.id;

      // 2. Pay using Stripe token simulation
      const payRes = await API.post(`/orders/${orderId}/pay?stripeToken=${stripeToken}`);
      setCreatedOrder(payRes.data);
      clearCart();
      setCheckoutStep('success');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Checkout failed.');
    } finally {
      setLoading(false);
    }
  };

  if (checkoutStep === 'success' && createdOrder) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6 text-slate-800 dark:text-slate-200">
        <div className="inline-flex p-4 bg-emerald-500/10 rounded-full text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <CheckCircle className="w-16 h-16" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Invoice Settlement Successful</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs">Your payment was processed successfully via Stripe Sandbox.</p>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl text-left space-y-3 text-xs shadow-sm">
          <div className="flex justify-between text-slate-500 dark:text-slate-400"><span>Order ID</span><span className="text-slate-900 dark:text-white font-bold">#{createdOrder.id}</span></div>
          <div className="flex justify-between text-slate-500 dark:text-slate-400"><span>Paid Sum</span><span className="text-indigo-650 dark:text-indigo-400 font-bold">{formatPrice(createdOrder.totalAmount)}</span></div>
          <div className="flex justify-between text-slate-500 dark:text-slate-400"><span>Status</span><span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider text-[10px]">{createdOrder.status}</span></div>
        </div>
        <div className="flex space-x-3">
          <Link to="/" className="w-1/2 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-lg transition text-center text-xs border border-slate-200 dark:border-slate-700">Continue Shopping</Link>
          <Link to="/orders" className="w-1/2 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold rounded-lg transition text-center text-xs">Order History</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 text-slate-800 dark:text-slate-200">
      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Secure Checkout</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Billing and Stripe details */}
        <form onSubmit={handleCheckout} className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-850 dark:text-white border-b border-slate-202 dark:border-slate-800 pb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-550 dark:text-indigo-400" /> Stripe Sandbox Payment
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-650 dark:text-slate-350 font-semibold mb-1">Credit Card Number</label>
              <input
                type="text"
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-850 rounded p-2 text-slate-900 dark:text-white text-xs focus:outline-none"
                placeholder="4242 4242 4242 4242 (Stripe Sandbox)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-655 dark:text-slate-350 font-semibold mb-1">Expiration</label>
                <input
                  type="text"
                  required
                  placeholder="12/28"
                  className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-850 rounded p-2 text-slate-900 dark:text-white text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-655 dark:text-slate-350 font-semibold mb-1">CVC Code</label>
                <input
                  type="text"
                  required
                  placeholder="123"
                  className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-850 rounded p-2 text-slate-900 dark:text-white text-xs focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-655 dark:text-slate-350 font-semibold mb-1">Stripe Sandbox Card Token</label>
              <select
                value={stripeToken}
                onChange={(e) => setStripeToken(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-850 rounded p-2 text-slate-850 dark:text-white text-xs focus:outline-none"
              >
                <option value="pm_card_visa">Visa Standard Sandbox (Succeeds)</option>
                <option value="pm_card_chargeDeclined">Visa Declined Sandbox (Fails)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || cartItems.length === 0}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold rounded-lg text-xs shadow-md transition flex items-center justify-center gap-2"
          >
            {loading ? 'Settling Payment Intent...' : `Pay ${formatPrice(getDiscountedTotal())}`}
          </button>
        </form>

        {/* Invoice Summary with Coupon block */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl h-fit space-y-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">Invoice Summary</h3>
          
          {/* Coupon inputs */}
          <div className="space-y-2">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">Apply Promo Coupon</span>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="E.g. SUMMER20"
                className="bg-slate-50 dark:bg-slate-955 border border-slate-300 dark:border-slate-850 rounded px-3 py-1.5 text-slate-850 dark:text-white text-xs w-2/3 focus:outline-none"
              />
              <button
                type="button"
                onClick={applyCoupon}
                className="w-1/3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-white font-bold rounded text-xs py-1.5 transition border border-slate-200 dark:border-slate-700"
              >
                Apply
              </button>
            </div>
            {couponError && <span className="text-rose-500 text-[10px]">{couponError}</span>}
            {appliedDiscount && (
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Tag className="w-3 h-3" /> Coupon '{appliedDiscount.code}' applied: {appliedDiscount.discountValue}% off
              </div>
            )}
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex justify-between text-slate-500 dark:text-slate-400"><span>Cart Subtotal</span><span>{formatPrice(totalAmount)}</span></div>
            {appliedDiscount && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                <span>Discount</span>
                <span>
                  -{appliedDiscount.discountType === 'PERCENTAGE' 
                    ? `${appliedDiscount.discountValue}%` 
                    : `${formatPrice(appliedDiscount.discountValue)}`}
                </span>
              </div>
            )}
            <div className="flex justify-between text-slate-900 dark:text-white font-extrabold text-sm border-t border-slate-200 dark:border-slate-800 pt-3">
              <span>Grand Total</span>
              <span>{formatPrice(getDiscountedTotal())}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CustomerProfile: React.FC = () => {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState<any[]>([]);

  const fetchOrders = async () => {
    if (!user || !user.customerId) return;
    try {
      const res = await API.get(`/orders/customer/${user.customerId}`);
      setOrders(res.data.content || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const requestCancel = async (orderId: number) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await API.post(`/orders/${orderId}/cancel`);
      alert('Order cancelled!');
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const requestReturn = async (orderId: number) => {
    if (!window.confirm('Are you sure you want to return this order?')) return;
    try {
      await API.post(`/orders/${orderId}/return`);
      alert('Order return processed! Funds will be refunded to your Stripe account.');
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  if (!user || !user.customerId) {
    return <div className="text-center p-20 text-slate-550 dark:text-slate-400">Please log in as Customer to view your order history.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 text-slate-850 dark:text-slate-200">
      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Your Order History</h2>

      <div className="space-y-6">
        {orders.length === 0 ? (
          <p className="text-slate-500 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl text-center shadow-sm">You haven't placed any orders yet.</p>
        ) : (
          orders.map((o) => (
            <div key={o.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm transition-colors duration-200">
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-3 gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Order ID</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">#{o.id}</span>
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Date</span>
                    <span className="text-slate-650 dark:text-slate-300 font-medium text-xs">{o.createdAt.substring(0, 10)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-505 font-bold block uppercase tracking-wider text-left sm:text-right">Total Paid</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-black text-xs">{formatPrice(o.totalAmount)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-505 font-bold block uppercase tracking-wider text-left sm:text-right">Status</span>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                      o.status === 'CANCELLED' || o.status === 'REFUNDED' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' :
                      o.status === 'DELIVERED' || o.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-650 dark:text-emerald-400' :
                      'bg-yellow-500/10 text-yellow-600 dark:text-yellow-450'
                    }`}>
                      {o.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items in Order */}
              <div className="space-y-2">
                {o.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                    <span>{item.productName} <span className="text-slate-450 dark:text-slate-500 font-semibold">x{item.quantity}</span></span>
                    <span className="font-bold text-slate-700 dark:text-slate-400">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Timeline Status */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl space-y-4 border border-slate-200 dark:border-slate-850">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block flex items-center gap-1"><Clock className="w-4 h-4 text-indigo-500 dark:text-indigo-400" /> Tracking Status Timeline</span>
                <div className="flex items-center justify-between overflow-x-auto py-2 pr-4 space-x-4 min-w-max">
                  {['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'COMPLETED'].map((step, idx) => {
                    const steps = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'COMPLETED'];
                    const currentIdx = steps.indexOf(o.status);
                    const isDone = currentIdx >= idx;
                    const isCurrent = o.status === step;
                    
                    return (
                      <div key={step} className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full border-2 ${
                          isCurrent ? 'bg-indigo-600 dark:bg-indigo-500 border-indigo-400 scale-125' :
                          isDone ? 'bg-emerald-500 border-emerald-400' : 'bg-slate-200 dark:bg-slate-800 border-slate-350 dark:border-slate-700'
                        }`} />
                        <span className={`text-[9px] font-bold tracking-wide uppercase ${
                          isCurrent ? 'text-indigo-600 dark:text-indigo-500 font-black' : isDone ? 'text-emerald-600 dark:text-emerald-450' : 'text-slate-400 dark:text-slate-500'
                        }`}>{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-3 pt-2">
                {o.trackingNumber && (
                  <span className="text-[10px] text-slate-500 font-medium self-center">Tracking: <code className="text-indigo-600 dark:text-indigo-400">{o.trackingNumber}</code></span>
                )}
                
                {(o.status === 'PENDING' || o.status === 'CONFIRMED') && (
                  <button
                    onClick={() => requestCancel(o.id)}
                    className="px-4 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-450 border border-rose-500/20 rounded-lg text-xs font-bold transition"
                  >
                    Request Cancel
                  </button>
                )}

                {(o.status === 'DELIVERED' || o.status === 'COMPLETED') && (
                  <button
                    onClick={() => requestReturn(o.id)}
                    className="px-4 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-600 dark:text-yellow-450 border border-yellow-500/20 rounded-lg text-xs font-bold transition"
                  >
                    File Return
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
