import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingCart, Users, AlertTriangle, CheckCircle, RefreshCw, BarChart2, ShieldAlert } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [kpis, setKpis] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  
  // Product CRUD state
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [sku, setSku] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [active, setActive] = useState(true);

  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'reviews' | 'logs'>('analytics');
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const kpiRes = await API.get('/dashboard/kpis');
      setKpis(kpiRes.data);
      
      const forecastRes = await API.get('/dashboard/forecast');
      setForecast(forecastRes.data);

      const reviewRes = await API.get('/reviews/pending');
      setPendingReviews(reviewRes.data);

      const logRes = await API.get('/audit-logs');
      setAuditLogs(logRes.data);

      const prodRes = await API.get('/products?size=50');
      setProducts(prodRes.data.content || []);

      const catRes = await API.get('/products/categories');
      setCategories(catRes.data);

      const brandRes = await API.get('/products/brands');
      setBrands(brandRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveReview = async (id: number) => {
    try {
      await API.put(`/reviews/${id}/approve`);
      setPendingReviews(pendingReviews.filter(r => r.id !== id));
      alert('Review approved!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      description,
      price: Number(price),
      sku,
      imageUrl,
      categoryId: Number(selectedCat),
      brandId: Number(selectedBrand),
      active,
    };

    try {
      if (editingProduct) {
        await API.put(`/products/${editingProduct.id}`, payload);
        alert('Product updated!');
      } else {
        await API.post('/products', payload);
        alert('Product created!');
      }
      resetForm();
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error occurred.');
    }
  };

  const handleEditProduct = (p: any) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description);
    setPrice(p.price.toString());
    setSku(p.sku);
    setImageUrl(p.imageUrl || '');
    setSelectedCat(p.categoryId.toString());
    setSelectedBrand(p.brandId.toString());
    setActive(p.active);
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Mark this product as inactive?')) return;
    try {
      await API.delete(`/products/${id}`);
      alert('Product inactivated!');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setSku('');
    setImageUrl('');
    setSelectedCat('');
    setSelectedBrand('');
    setActive(true);
    setShowProductForm(false);
  };

  // Convert monthly data for Recharts
  const chartData = kpis?.monthlySales?.map((m: any) => ({
    name: m.month,
    sales: m.sales,
  })).reverse() || [];

  return (
    <div className="space-y-8 px-6 py-8">
      {/* Dashboard Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white">Administrative Control Panel</h2>
          <p className="text-slate-400 text-sm">Real-time supply chain analytics and authorization configurations</p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-semibold flex items-center gap-2 border border-slate-700 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync Metrics
        </button>
      </div>

      {/* KPI Cards Grid */}
      {kpis && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass p-5 rounded-2xl flex items-center space-x-4">
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400"><DollarSign className="w-6 h-6" /></div>
            <div>
              <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Gross Revenue</span>
              <span className="text-2xl font-black text-white">${kpis.revenue.toFixed(2)}</span>
            </div>
          </div>
          <div className="glass p-5 rounded-2xl flex items-center space-x-4">
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400"><ShoppingCart className="w-6 h-6" /></div>
            <div>
              <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Total Orders</span>
              <span className="text-2xl font-black text-white">{kpis.totalOrders}</span>
            </div>
          </div>
          <div className="glass p-5 rounded-2xl flex items-center space-x-4">
            <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400"><Users className="w-6 h-6" /></div>
            <div>
              <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">System Users</span>
              <span className="text-2xl font-black text-white">{kpis.activeUsers}</span>
            </div>
          </div>
          <div className="glass p-5 rounded-2xl flex items-center space-x-4">
            <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400"><AlertTriangle className="w-6 h-6" /></div>
            <div>
              <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Low Stock SKUs</span>
              <span className="text-2xl font-black text-rose-400">{kpis.lowStockCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Selector */}
      <div className="flex border-b border-slate-800 space-x-6 text-sm font-semibold">
        <button onClick={() => setActiveTab('analytics')} className={`pb-3 transition ${activeTab === 'analytics' ? 'border-b-2 border-purple-500 text-purple-400' : 'text-slate-400 hover:text-white'}`}>Sales & Projections</button>
        <button onClick={() => setActiveTab('products')} className={`pb-3 transition ${activeTab === 'products' ? 'border-b-2 border-purple-500 text-purple-400' : 'text-slate-400 hover:text-white'}`}>Products Catalog</button>
        <button onClick={() => setActiveTab('reviews')} className={`pb-3 transition ${activeTab === 'reviews' ? 'border-b-2 border-purple-500 text-purple-400' : 'text-slate-400 hover:text-white'}`}>Review Moderation</button>
        <button onClick={() => setActiveTab('logs')} className={`pb-3 transition ${activeTab === 'logs' ? 'border-b-2 border-purple-500 text-purple-400' : 'text-slate-400 hover:text-white'}`}>Audit Logs</button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sales chart */}
          <div className="lg:col-span-2 glass p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">Monthly Sales Ledger</h3>
            <div className="h-72">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                    <Area type="monotone" dataKey="sales" stroke="#a78bfa" fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-600 text-sm">No transaction history compiled yet.</div>
              )}
            </div>
          </div>

          {/* Forecasting */}
          <div className="glass p-6 rounded-2xl space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-400" /> Sales Trend Forecasts
            </h3>
            <p className="text-slate-400 text-xs">Dynamic linear regression slope projection matching historical volume</p>
            <div className="space-y-4">
              {forecast.map((f, i) => (
                <div key={i} className="glass-light p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">Predicted Period</span>
                    <span className="text-slate-300 font-semibold">{f.month}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-bold block">FORECAST VOLUME</span>
                    <span className="text-lg font-black text-white">${f.forecastedSales.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="glass p-6 rounded-2xl space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Manage Catalog Items</h3>
            <button
              onClick={() => { resetForm(); setShowProductForm(true); }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-sm shadow-md transition"
            >
              Add New Product
            </button>
          </div>

          {showProductForm && (
            <form onSubmit={handleProductSubmit} className="glass-light p-6 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
              <h4 className="md:col-span-2 text-md font-bold text-purple-400">{editingProduct ? 'Edit Product SKU' : 'New Product SKU'}</h4>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Product Name</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">SKU Code</label>
                <input type="text" required value={sku} onChange={(e) => setSku(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">MSRP Price</label>
                <input type="number" required step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Image URL</label>
                <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Category</label>
                <select required value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white">
                  <option value="">Select Category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Brand</label>
                <select required value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white">
                  <option value="">Select Brand</option>
                  {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="flex items-center space-x-3 mt-4 md:col-span-2">
                <input type="checkbox" id="activeChk" checked={active} onChange={(e) => setActive(e.target.checked)} className="rounded text-purple-600 focus:ring-0" />
                <label htmlFor="activeChk" className="text-xs text-slate-300 font-bold">Mark product as active and searchable</label>
              </div>
              <div className="flex gap-3 md:col-span-2 mt-4">
                <button type="submit" className="px-5 py-2 bg-purple-600 hover:bg-purple-500 font-bold rounded text-sm text-white">Save Product</button>
                <button type="button" onClick={resetForm} className="px-5 py-2 bg-slate-800 hover:bg-slate-700 font-bold rounded text-sm text-slate-300">Cancel</button>
              </div>
            </form>
          )}

          {/* Product list */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-400">
              <thead className="text-xs uppercase bg-slate-900 text-slate-400">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">SKU</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Stock Level</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-bold text-white">#{p.id}</td>
                    <td className="px-6 py-4">{p.sku}</td>
                    <td className="px-6 py-4 text-slate-200">{p.name}</td>
                    <td className="px-6 py-4 font-semibold">${p.price.toFixed(2)}</td>
                    <td className="px-6 py-4">{p.stockLevel} units</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-3">
                      <button onClick={() => handleEditProduct(p)} className="text-xs text-indigo-400 hover:underline">Edit</button>
                      {p.active && <button onClick={() => handleDeleteProduct(p.id)} className="text-xs text-rose-400 hover:underline">Deactivate</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="glass p-6 rounded-2xl space-y-4">
          <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Moderate Customer Feedback</h3>
          {pendingReviews.length === 0 ? (
            <p className="text-slate-500 text-sm">All customer feedback has been moderated.</p>
          ) : (
            <div className="space-y-4">
              {pendingReviews.map((r) => (
                <div key={r.id} className="glass-light p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-purple-400 uppercase tracking-wide">{r.product.name}</span>
                      <span className="text-xs text-slate-500 font-medium">by {r.customer.firstName}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-200 italic">"{r.reviewText}"</p>
                  </div>
                  <button
                    onClick={() => handleApproveReview(r.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow transition flex items-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve & Publish
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="glass p-6 rounded-2xl space-y-4">
          <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-purple-400" /> AOP Audit Event Timeline
          </h3>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="glass-light p-4 rounded-xl flex items-start space-x-4 border-l-2 border-indigo-500">
                <div className="min-w-0 flex-grow space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-indigo-400 uppercase tracking-wider">{log.action}</span>
                    <span className="text-xs text-slate-500 font-medium">{log.createdAt.replace('T', ' ').substring(0, 19)}</span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono bg-slate-900 p-2 rounded">{log.details}</p>
                  <div className="text-[10px] text-slate-500">
                    Executor: <span className="font-semibold text-slate-400">{log.userEmail}</span> &bull; IP Source: <span className="font-semibold text-slate-400">{log.ipAddress}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
