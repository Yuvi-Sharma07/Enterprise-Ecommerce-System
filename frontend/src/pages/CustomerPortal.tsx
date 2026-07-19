import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import API from '../services/api';
import { Search, Filter, ShoppingBag, Eye, Heart, Star, Award, CheckCircle, Tag, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

export const Catalog: React.FC = () => {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [frequentlyViewed, setFrequentlyViewed] = useState<any[]>([]);

  // Search & Filters state
  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Wishlist state
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);

  const fetchFilters = async () => {
    try {
      const catRes = await API.get('/products/categories');
      setCategories(catRes.data);
      const brandRes = await API.get('/products/brands');
      setBrands(brandRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      let url = `/products?page=${page}&size=8&sortBy=${sortBy}&direction=DESC`;
      if (query) url += `&query=${encodeURIComponent(query)}`;
      if (selectedCat) url += `&categoryId=${selectedCat}`;
      if (selectedBrand) url += `&brandId=${selectedBrand}`;
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
  }, [query, selectedCat, selectedBrand, minPrice, maxPrice, sortBy, page]);

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
    <div className="space-y-10 px-4 py-8">
      {/* Search Header Banner */}
      <div className="glass p-8 rounded-3xl text-center space-y-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 blur-xl pointer-events-none" />
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Enterprise Retail Hub</h1>
        <p className="text-slate-400 max-w-xl mx-auto">Explore high-quality products sourced directly from manufacturers, managed by smart warehouses</p>
        <div className="max-w-xl mx-auto relative mt-6">
          <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-full pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 shadow-md"
            placeholder="Search products, brands, barcodes..."
          />
        </div>
      </div>

      {/* Catalog Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="glass p-6 rounded-2xl h-fit space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-4 text-purple-400 font-bold uppercase tracking-wider text-sm">
            <Filter className="w-4 h-4" /> Filters Engine
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Brand</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm"
            >
              <option value="">All Brands</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Price Bounds</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sorting</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm"
            >
              <option value="id">Relevance</option>
              <option value="price">Price</option>
              <option value="name">Product Name</option>
            </select>
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="lg:col-span-3 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((p) => (
              <div key={p.id} className="glass rounded-xl overflow-hidden shadow-lg hover:shadow-purple-500/5 hover:-translate-y-1 transition duration-200 flex flex-col justify-between">
                <div className="relative">
                  <img
                    src={p.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'}
                    alt={p.name}
                    className="w-full h-48 object-cover border-b border-slate-800"
                  />
                  <button
                    onClick={() => toggleWishlist(p.id)}
                    className={`absolute top-3 right-3 p-2 rounded-full glass hover:bg-slate-800 transition ${
                      wishlistIds.includes(p.id) ? 'text-rose-500' : 'text-slate-400'
                    }`}
                  >
                    <Heart className="w-5 h-5 fill-current" />
                  </button>
                </div>
                <div className="p-5 flex-grow flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wide">{p.categoryName}</span>
                    <h3 className="font-bold text-lg text-white hover:text-purple-400 transition cursor-pointer mt-1">
                      <Link to={`/product/${p.id}`}>{p.name}</Link>
                    </h3>
                    <p className="text-slate-400 text-xs line-clamp-2 mt-1">{p.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <span className="text-xl font-black text-white">${p.price.toFixed(2)}</span>
                    <span className={`text-xs px-2 py-1 rounded font-semibold ${
                      p.stockLevel > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {p.stockLevel > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
                {p.stockLevel > 0 && user?.customerId ? (
                  <button
                    onClick={() => addItem(p.id, 1)}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold transition flex items-center justify-center gap-2 text-sm"
                  >
                    <ShoppingBag className="w-4 h-4" /> Add To Shopping Cart
                  </button>
                ) : (
                  <Link
                    to={`/product/${p.id}`}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold transition text-center text-sm"
                  >
                    View Product Details
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
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white text-sm font-semibold disabled:opacity-50 transition"
              >
                Previous
              </button>
              <span className="text-slate-400 text-sm">Page {page + 1} of {totalPages}</span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white text-sm font-semibold disabled:opacity-50 transition"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Frequently Viewed Row */}
      {frequentlyViewed.length > 0 && (
        <div className="glass p-6 rounded-2xl space-y-4">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Eye className="w-5 h-5 text-indigo-400" /> Frequently Viewed Items
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {frequentlyViewed.map((fv) => (
              <div key={fv.id} className="glass-light p-4 rounded-xl flex items-center space-x-4">
                <img
                  src={fv.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'}
                  alt={fv.name}
                  className="w-16 h-16 object-cover rounded-lg border border-slate-700"
                />
                <div className="min-w-0 flex-grow">
                  <Link to={`/product/${fv.id}`} className="block text-sm font-bold text-white hover:text-indigo-400 truncate">{fv.name}</Link>
                  <span className="text-xs text-slate-400">{fv.brandName}</span>
                  <span className="block text-indigo-400 font-bold text-sm mt-0.5">${fv.price.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const ProductDetails: React.FC = () => {
  const { user } = useAuth();
  const { addItem } = useCart();
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
    // Resolve ID from path parameter
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

  if (!product) return <div className="text-center p-20 text-slate-400">Loading Product File...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 glass p-8 rounded-3xl">
        {/* Product Image */}
        <div>
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'}
            alt={product.name}
            className="w-full h-96 object-cover rounded-2xl border border-slate-700 shadow-md"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest bg-purple-500/10 px-3 py-1 rounded-full">{product.categoryName}</span>
            <h1 className="text-3xl font-extrabold text-white mt-2">{product.name}</h1>
            <p className="text-slate-400 text-sm">{product.brandName} &bull; SKU: <code className="text-purple-400 font-bold">{product.sku}</code></p>
          </div>

          <div className="flex items-center gap-2 text-yellow-400">
            <Star className="w-5 h-5 fill-current" />
            <span className="font-bold">{avgRating ? avgRating.toFixed(1) : 'No Rating'}</span>
            <span className="text-slate-500 text-sm">({reviews.length} reviews)</span>
          </div>

          <p className="text-slate-300 leading-relaxed text-sm">{product.description}</p>

          <div className="flex items-center justify-between border-y border-slate-800 py-4">
            <div>
              <span className="text-slate-400 text-xs block">MSRP PRICE</span>
              <span className="text-3xl font-black text-white">${product.price.toFixed(2)}</span>
            </div>
            {product.stockLevel > 0 ? (
              <button
                onClick={() => addItem(product.id, 1)}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition flex items-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" /> Add to Cart
              </button>
            ) : (
              <span className="px-6 py-2.5 bg-rose-500/10 text-rose-400 rounded-lg font-bold border border-rose-500/20">Sold Out</span>
            )}
          </div>

          {/* Barcode details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-light p-4 rounded-xl text-center space-y-2">
              <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider">1D SKU Barcode</span>
              {barcodeImg ? <img src={barcodeImg} alt="Barcode" className="mx-auto h-12" /> : <div className="text-xs text-slate-600">Generating...</div>}
            </div>
            <div className="glass-light p-4 rounded-xl text-center space-y-2">
              <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider">QR Code Locator</span>
              {qrcodeImg ? <img src={qrcodeImg} alt="QR Code" className="mx-auto h-16" /> : <div className="text-xs text-slate-600">Generating...</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Review Submission & Ratings List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Write Review Form */}
        <div className="glass p-6 rounded-2xl h-fit space-y-4 col-span-1">
          <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-400" /> Share Feedback
          </h3>
          <form onSubmit={submitReview} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Rating</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm"
              >
                <option value="5">5 Stars (Excellent)</option>
                <option value="4">4 Stars (Very Good)</option>
                <option value="3">3 Stars (Average)</option>
                <option value="2">2 Stars (Poor)</option>
                <option value="1">1 Star (Unacceptable)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Review text</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm h-24 focus:outline-none"
                placeholder="Share your experience with this product..."
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition"
            >
              Post Review
            </button>
          </form>
        </div>

        {/* Reviews List */}
        <div className="glass p-6 rounded-2xl col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Approved Customer Reviews ({reviews.length})</h3>
          {reviews.length === 0 ? (
            <p className="text-slate-500 text-sm">No reviewed entries found for this SKU.</p>
          ) : (
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
              {reviews.map((r) => (
                <div key={r.id} className="glass-light p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-300">
                      {r.customer.firstName} {r.customer.lastName.substring(0, 1)}.
                    </span>
                    <div className="flex text-yellow-400">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-400 text-xs italic">"{r.reviewText}"</p>
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
  const navigate = useNavigate();

  if (!user || !user.customerId) {
    return <div className="text-center p-20 text-slate-400">Please log in as Customer to access your shopping cart.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      <h2 className="text-3xl font-extrabold text-white">Your Shopping Cart</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-bold text-purple-400 uppercase tracking-wide border-b border-slate-800 pb-2">Active Items ({cartItems.length})</h3>
            {cartItems.length === 0 ? (
              <p className="text-slate-500 text-sm">Your shopping cart is currently empty.</p>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="glass-light p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded-lg border border-slate-700"
                      />
                      <div>
                        <h4 className="font-bold text-white text-sm"><Link to={`/product/${item.productId}`} className="hover:underline">{item.productName}</Link></h4>
                        <span className="text-indigo-400 text-sm font-bold">${item.price.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="px-2.5 py-1 text-slate-400 hover:text-white transition"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-white text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="px-2.5 py-1 text-slate-400 hover:text-white transition"
                        >
                          +
                        </button>
                      </div>
                      <button onClick={() => toggleSaveForLater(item.productId)} className="text-xs text-indigo-400 hover:underline">Save Later</button>
                      <button onClick={() => removeItem(item.productId)} className="text-xs text-rose-400 hover:underline">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Items */}
          <div className="glass p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-400 uppercase tracking-wide border-b border-slate-800 pb-2">Saved For Later ({savedItems.length})</h3>
            {savedItems.length === 0 ? (
              <p className="text-slate-500 text-xs">No items saved for later.</p>
            ) : (
              <div className="space-y-4">
                {savedItems.map((item) => (
                  <div key={item.id} className="glass-light p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'}
                        alt={item.productName}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div>
                        <h4 className="font-bold text-white text-sm">{item.productName}</h4>
                        <span className="text-indigo-400 text-xs font-bold">${item.price.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button onClick={() => toggleSaveForLater(item.productId)} className="text-xs text-emerald-400 hover:underline">Move to Cart</button>
                      <button onClick={() => removeItem(item.productId)} className="text-xs text-rose-400 hover:underline">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Order Summary Checkout Card */}
        <div className="glass p-6 rounded-2xl h-fit space-y-6">
          <h3 className="text-xl font-extrabold text-white border-b border-slate-800 pb-3">Subtotal Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-slate-400 text-sm">
              <span>Items Total</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400 text-sm">
              <span>Standard Shipping</span>
              <span className="text-emerald-400 font-bold">FREE</span>
            </div>
            <div className="flex justify-between text-white font-extrabold text-lg border-t border-slate-800 pt-3">
              <span>Final Total</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <button
            disabled={cartItems.length === 0}
            onClick={() => navigate('/checkout')}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            Proceed to Checkout <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const CheckoutPage: React.FC = () => {
  const { user } = useAuth();
  const { cartItems, totalAmount, clearCart } = useCart();

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
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="inline-flex p-4 bg-emerald-500/10 rounded-full text-emerald-400 border border-emerald-500/20">
          <CheckCircle className="w-16 h-16 animate-pulse" />
        </div>
        <h2 className="text-3xl font-black text-white">Invoice Settlement Successful</h2>
        <p className="text-slate-400 text-sm">Thank you for your order! Your payment was processed successfully via Stripe Sandbox.</p>
        <div className="glass p-5 rounded-2xl text-left space-y-3 text-sm">
          <div className="flex justify-between text-slate-400"><span>Order ID</span><span className="text-white font-bold">#{createdOrder.id}</span></div>
          <div className="flex justify-between text-slate-400"><span>Paid Sum</span><span className="text-indigo-400 font-bold">${createdOrder.totalAmount.toFixed(2)}</span></div>
          <div className="flex justify-between text-slate-400"><span>Status</span><span className="text-emerald-400 font-bold uppercase tracking-wider text-xs">{createdOrder.status}</span></div>
        </div>
        <div className="flex space-x-3">
          <Link to="/" className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg transition text-center text-sm">Continue Shopping</Link>
          <Link to="/orders" className="w-1/2 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition text-center text-sm">Order History</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <h2 className="text-3xl font-extrabold text-white">Secure Checkout</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Billing and Stripe details */}
        <form onSubmit={handleCheckout} className="md:col-span-2 glass p-6 rounded-2xl space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-400" /> Stripe Sandbox Payment
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 font-semibold mb-1">Credit Card Number</label>
              <input
                type="text"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none"
                placeholder="4242 4242 4242 4242 (Stripe Sandbox)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 font-semibold mb-1">Expiration Date</label>
                <input
                  type="text"
                  required
                  placeholder="12/28"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 font-semibold mb-1">CVC Code</label>
                <input
                  type="text"
                  required
                  placeholder="123"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-300 font-semibold mb-1">Select Payment Token</label>
              <select
                value={stripeToken}
                onChange={(e) => setStripeToken(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm"
              >
                <option value="pm_card_visa">Visa Standard Sandbox (Succeeds)</option>
                <option value="pm_card_chargeDeclined">Visa Declined Sandbox (Fails)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || cartItems.length === 0}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 font-bold rounded-lg shadow-lg transition flex items-center justify-center gap-2"
          >
            {loading ? 'Settling Payment Intent...' : `Pay $${getDiscountedTotal().toFixed(2)}`}
          </button>
        </form>

        {/* Invoice Summary with Coupon block */}
        <div className="glass p-6 rounded-2xl h-fit space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">Invoice Summary</h3>
          
          {/* Coupon inputs */}
          <div className="space-y-2">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Apply Promo Coupon</span>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="E.g. SUMMER20"
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs w-2/3"
              />
              <button
                type="button"
                onClick={applyCoupon}
                className="w-1/3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs py-1.5 transition"
              >
                Apply
              </button>
            </div>
            {couponError && <span className="text-rose-500 text-xs">{couponError}</span>}
            {appliedDiscount && (
              <div className="text-xs text-emerald-400 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> Coupon '{appliedDiscount.code}' applied: {appliedDiscount.discountValue}% off
              </div>
            )}
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-800 text-sm">
            <div className="flex justify-between text-slate-400"><span>Cart Subtotal</span><span>${totalAmount.toFixed(2)}</span></div>
            {appliedDiscount && (
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Discount</span>
                <span>
                  -{appliedDiscount.discountType === 'PERCENTAGE' 
                    ? `${appliedDiscount.discountValue}%` 
                    : `$${appliedDiscount.discountValue}`}
                </span>
              </div>
            )}
            <div className="flex justify-between text-white font-extrabold text-base border-t border-slate-800 pt-3">
              <span>Grand Total</span>
              <span>${getDiscountedTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CustomerProfile: React.FC = () => {
  const { user } = useAuth();
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
    return <div className="text-center p-20 text-slate-400">Please log in as Customer to view your order history.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      <h2 className="text-3xl font-extrabold text-white">Your Order History</h2>

      <div className="space-y-6">
        {orders.length === 0 ? (
          <p className="text-slate-500 text-sm glass p-8 rounded-2xl text-center">You haven't placed any orders yet.</p>
        ) : (
          orders.map((o) => (
            <div key={o.id} className="glass p-6 rounded-2xl space-y-4">
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-3 gap-3">
                <div>
                  <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Order Placement ID</span>
                  <span className="font-extrabold text-white">#{o.id}</span>
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Placement Date</span>
                    <span className="text-slate-300 font-medium text-sm">{o.createdAt.substring(0, 10)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider text-left sm:text-right">Total Settled</span>
                    <span className="text-indigo-400 font-black text-sm">${o.totalAmount.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider text-left sm:text-right">Status State</span>
                    <span className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded ${
                      o.status === 'CANCELLED' || o.status === 'REFUNDED' ? 'bg-rose-500/10 text-rose-400' :
                      o.status === 'DELIVERED' || o.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                      'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {o.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items in Order */}
              <div className="space-y-2">
                {o.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-xs text-slate-300">
                    <span>{item.productName} <span className="text-slate-500 font-semibold">x{item.quantity}</span></span>
                    <span className="font-bold text-slate-400">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Timeline Status */}
              <div className="bg-slate-900/50 p-4 rounded-xl space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1"><Clock className="w-4 h-4 text-purple-400" /> Tracking Status Timeline</span>
                <div className="flex items-center justify-between overflow-x-auto py-2 pr-4 space-x-4 min-w-max">
                  {['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'COMPLETED'].map((step, idx) => {
                    const steps = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'COMPLETED'];
                    const currentIdx = steps.indexOf(o.status);
                    const isDone = currentIdx >= idx;
                    const isCurrent = o.status === step;
                    
                    return (
                      <div key={step} className="flex items-center space-x-2">
                        <div className={`w-3.5 h-3.5 rounded-full border-2 ${
                          isCurrent ? 'bg-purple-500 border-purple-400 scale-125' :
                          isDone ? 'bg-emerald-500 border-emerald-400' : 'bg-slate-800 border-slate-700'
                        }`} />
                        <span className={`text-[10px] font-bold tracking-wide uppercase ${
                          isCurrent ? 'text-purple-400 font-black' : isDone ? 'text-emerald-400' : 'text-slate-500'
                        }`}>{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-3 pt-2">
                {o.trackingNumber && (
                  <span className="text-xs text-slate-400 font-medium self-center">Tracking: <code className="text-indigo-400">{o.trackingNumber}</code></span>
                )}
                
                {(o.status === 'PENDING' || o.status === 'CONFIRMED') && (
                  <button
                    onClick={() => requestCancel(o.id)}
                    className="px-4 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-bold transition"
                  >
                    Request Cancellation
                  </button>
                )}

                {(o.status === 'DELIVERED' || o.status === 'COMPLETED') && (
                  <button
                    onClick={() => requestReturn(o.id)}
                    className="px-4 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 rounded-lg text-xs font-bold transition"
                  >
                    File Return & Refund
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
