import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Home, Layers, MoveRight, CornerDownRight, CheckSquare } from 'lucide-react';

export const WarehouseDashboard: React.FC = () => {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(null);
  const [warehouseStock, setWarehouseStock] = useState<any[]>([]);
  const [incomingPOs, setIncomingPOs] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Stock Transfer Form State
  const [sourceWarehouseId, setSourceWarehouseId] = useState('');
  const [targetWarehouseId, setTargetWarehouseId] = useState('');
  const [transferProductId, setTransferProductId] = useState('');
  const [transferQty, setTransferQty] = useState('');

  // Create Warehouse Form State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newCapacity, setNewCapacity] = useState('');

  const loadData = async () => {
    try {
      const whRes = await API.get('/warehouses');
      setWarehouses(whRes.data);
      if (whRes.data.length > 0 && !selectedWarehouseId) {
        setSelectedWarehouseId(whRes.data[0].id);
      }

      // Load Shipped POs representing incoming shipments
      const poRes = await API.get('/suppliers/pos');
      setIncomingPOs(poRes.data.filter((po: any) => po.status === 'SHIPPED' || po.status === 'APPROVED' || po.status === 'PENDING'));

      const prodRes = await API.get('/products?size=100');
      setProducts(prodRes.data.content || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadWarehouseStock = async () => {
    if (!selectedWarehouseId) return;
    try {
      const res = await API.get(`/warehouses/${selectedWarehouseId}/stock`);
      setWarehouseStock(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadWarehouseStock();
  }, [selectedWarehouseId]);

  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post('/warehouses', {
        name: newName,
        location: newLocation,
        maxCapacity: Number(newCapacity),
      });
      alert('Warehouse created successfully!');
      setNewName('');
      setNewLocation('');
      setNewCapacity('');
      setShowCreateForm(false);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error occurred.');
    }
  };

  const handleTransferStock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post('/warehouses/transfer', {
        sourceWarehouseId: Number(sourceWarehouseId),
        targetWarehouseId: Number(targetWarehouseId),
        productId: Number(transferProductId),
        quantity: Number(transferQty),
      });
      alert('Stock transfer completed successfully!');
      setTransferQty('');
      loadData();
      loadWarehouseStock();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Transfer failed.');
    }
  };

  const handleReceiveShipment = async (poId: number) => {
    try {
      // Mark as DELIVERED which increments warehouse stock in backend
      await API.put(`/suppliers/pos/${poId}/status?status=DELIVERED`);
      alert('Shipment received! Warehouse inventory has been auto-replenished.');
      loadData();
      loadWarehouseStock();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 px-6 py-8">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-white">Logistics & Warehousing</h2>
          <p className="text-slate-400 text-sm">Monitor multi-location inventory volumes and execute stock transfers</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 font-bold rounded-lg text-xs transition"
        >
          Register New Location
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateWarehouse} className="glass p-6 rounded-2xl max-w-lg space-y-4">
          <h3 className="text-md font-bold text-cyan-400 uppercase tracking-wide">Warehouse Parameters</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Name</label>
              <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Location</label>
              <input type="text" required value={newLocation} onChange={(e) => setNewLocation(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-400 mb-1">Max Stock Capacity</label>
              <input type="number" required value={newCapacity} onChange={(e) => setNewCapacity(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 font-bold text-xs text-white rounded">Save Location</button>
            <button type="button" onClick={() => setShowCreateForm(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 font-bold text-xs text-slate-300 rounded">Cancel</button>
          </div>
        </form>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Warehouses list with Capacity meter */}
        <div className="glass p-6 rounded-2xl space-y-4 h-fit">
          <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-1">
            <Home className="w-5 h-5 text-cyan-400" /> Active Warehouses
          </h3>
          <div className="space-y-4">
            {warehouses.map((wh) => {
              // Calculate occupancy percentage
              // For visualization, we will compute the sum of warehouseStock quantities below
              const whStockSum = selectedWarehouseId === wh.id 
                ? warehouseStock.reduce((acc, item) => acc + item.stockQuantity, 0)
                : 0; // Simple layout estimation
              
              const pct = Math.min(100, Math.round((whStockSum / wh.maxCapacity) * 100)) || 15; // default fallback visual
              
              return (
                <div
                  key={wh.id}
                  onClick={() => setSelectedWarehouseId(wh.id)}
                  className={`p-4 rounded-xl cursor-pointer border transition ${
                    selectedWarehouseId === wh.id ? 'border-cyan-500 bg-cyan-500/5' : 'border-slate-800 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-white text-sm">{wh.name}</span>
                    <span className="text-xs text-slate-400 font-semibold">{wh.location}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Occupancy Capacity</span>
                      <span className="font-bold text-slate-400">{pct}% ({wh.maxCapacity} max)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 h-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Warehouse Stock list */}
        <div className="lg:col-span-2 glass p-6 rounded-2xl space-y-4">
          <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-1">
            <Layers className="w-5 h-5 text-cyan-400" /> Warehouse Inventory Breakdown
          </h3>
          {warehouseStock.length === 0 ? (
            <p className="text-slate-500 text-sm">No items currently stored in this location.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-400">
                <thead className="text-xs uppercase bg-slate-900 text-slate-400">
                  <tr>
                    <th className="px-6 py-3">Product SKU</th>
                    <th className="px-6 py-3">Product Name</th>
                    <th className="px-6 py-3">Stored Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {warehouseStock.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40">
                      <td className="px-6 py-4 font-mono text-cyan-400 font-bold">{item.product.sku}</td>
                      <td className="px-6 py-4 text-slate-200">{item.product.name}</td>
                      <td className="px-6 py-4 font-semibold">{item.stockQuantity} units</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Transfers and Incoming Shipments row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Stock Transfer Form */}
        <div className="glass p-6 rounded-2xl space-y-4">
          <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-1">
            <CornerDownRight className="w-5 h-5 text-cyan-400" /> Stock Relocation Engine
          </h3>
          <form onSubmit={handleTransferStock} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Source Warehouse</label>
                <select required value={sourceWarehouseId} onChange={(e) => setSourceWarehouseId(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white">
                  <option value="">Select Source</option>
                  {warehouses.map((wh) => <option key={wh.id} value={wh.id}>{wh.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Target Warehouse</label>
                <select required value={targetWarehouseId} onChange={(e) => setTargetWarehouseId(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white">
                  <option value="">Select Target</option>
                  {warehouses.map((wh) => <option key={wh.id} value={wh.id}>{wh.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Product to Transfer</label>
              <select required value={transferProductId} onChange={(e) => setTransferProductId(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white">
                <option value="">Select Product SKU</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Quantity</label>
              <input
                type="number"
                required
                value={transferQty}
                onChange={(e) => setTransferQty(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white"
                placeholder="Number of units"
              />
            </div>

            <button type="submit" className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 font-bold rounded-lg text-xs transition flex justify-center items-center gap-1">
              Initiate Stock Transfer <MoveRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Incoming Procurement shipments */}
        <div className="glass p-6 rounded-2xl space-y-4">
          <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-1">
            <CheckSquare className="w-5 h-5 text-cyan-400" /> Incoming Supply Shipments
          </h3>
          {incomingPOs.length === 0 ? (
            <p className="text-slate-500 text-sm">No incoming procurement shipments pending.</p>
          ) : (
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
              {incomingPOs.map((po) => (
                <div key={po.id} className="glass-light p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-cyan-400 uppercase tracking-wide">PO #{po.id}</span>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-semibold uppercase tracking-wider">{po.status}</span>
                    </div>
                    <span className="text-sm font-bold text-white block mt-1">{po.product.name} ({po.quantity} units)</span>
                    <span className="text-xs text-slate-500 block">Recipient: {po.warehouse.name}</span>
                  </div>
                  {po.status === 'SHIPPED' && (
                    <button
                      onClick={() => handleReceiveShipment(po.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow transition"
                    >
                      Receive Stock
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
