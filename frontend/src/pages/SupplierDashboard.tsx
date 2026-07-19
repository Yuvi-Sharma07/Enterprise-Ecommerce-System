import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Tag, Truck, CheckCircle2, Navigation, Mail, Phone, MapPin } from 'lucide-react';

export const SupplierDashboard: React.FC = () => {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [selectedPoId, setSelectedPoId] = useState<number | null>(null);

  // Supplier CRUD State (for demo updates)
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [showForm, setShowForm] = useState(false);

  const loadData = async () => {
    try {
      const supRes = await API.get('/suppliers');
      setSuppliers(supRes.data);
      if (supRes.data.length > 0 && !selectedSupplierId) {
        setSelectedSupplierId(supRes.data[0].id);
      }

      const poRes = await API.get('/suppliers/pos');
      setPurchaseOrders(poRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name, contactEmail, phone, address };
    try {
      if (selectedSupplierId) {
        await API.put(`/suppliers/${selectedSupplierId}`, payload);
        alert('Supplier credentials updated!');
      } else {
        await API.post('/suppliers', payload);
        alert('Supplier profile registered!');
      }
      setShowForm(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const startEditSupplier = (s: any) => {
    setSelectedSupplierId(s.id);
    setName(s.name);
    setContactEmail(s.contactEmail);
    setPhone(s.phone);
    setAddress(s.address);
    setShowForm(true);
  };

  const handleShipPO = async (poId: number) => {
    if (!trackingNumber.trim()) {
      alert('Please enter a delivery tracking number');
      return;
    }
    try {
      // Mark as SHIPPED in backend
      await API.put(`/suppliers/pos/${poId}/ship?trackingNumber=${encodeURIComponent(trackingNumber)}`);
      alert('Purchase Order shipped! Tracking log added.');
      setTrackingNumber('');
      setSelectedPoId(null);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter purchase orders allocated to selected supplier
  const supplierPOs = purchaseOrders.filter((po: any) => po.supplier.id === selectedSupplierId);

  return (
    <div className="space-y-8 px-6 py-8">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-white">Procurement & Suppliers</h2>
          <p className="text-slate-400 text-sm">Fulfill warehouse restock purchase orders and log logistics tracking</p>
        </div>
        <button
          onClick={() => {
            setSelectedSupplierId(null);
            setName('');
            setContactEmail('');
            setPhone('');
            setAddress('');
            setShowForm(!showForm);
          }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-lg text-xs transition"
        >
          Register Supplier Profile
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSupplierSubmit} className="glass p-6 rounded-2xl max-w-lg space-y-4">
          <h3 className="text-md font-bold text-emerald-400 uppercase tracking-wide">Supplier Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Company Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Email</label>
              <input type="email" required value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Phone</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Address</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white rounded">Save Profile</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 font-bold text-xs text-slate-300 rounded">Cancel</button>
          </div>
        </form>
      )}

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Suppliers List Card */}
        <div className="glass p-6 rounded-2xl space-y-4 h-fit">
          <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-1">
            <Tag className="w-5 h-5 text-emerald-400" /> Authorized Suppliers
          </h3>
          <div className="space-y-4">
            {suppliers.map((s) => (
              <div
                key={s.id}
                onClick={() => setSelectedSupplierId(s.id)}
                className={`p-4 rounded-xl cursor-pointer border transition text-left space-y-2 ${
                  selectedSupplierId === s.id ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-800 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-sm">{s.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); startEditSupplier(s); }} className="text-[10px] text-emerald-400 hover:underline">Edit Info</button>
                </div>
                <div className="space-y-1 text-slate-400 text-xs">
                  <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-600" /> {s.contactEmail}</div>
                  <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-600" /> {s.phone || 'N/A'}</div>
                  <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-600" /> {s.address || 'N/A'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Supplier Purchase Orders */}
        <div className="lg:col-span-2 glass p-6 rounded-2xl space-y-4">
          <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-1">
            <Truck className="w-5 h-5 text-emerald-400" /> Restock Purchase Orders ({supplierPOs.length})
          </h3>
          {supplierPOs.length === 0 ? (
            <p className="text-slate-500 text-sm">No restock orders assigned to this supplier.</p>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {supplierPOs.map((po) => (
                <div key={po.id} className="glass-light p-5 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">PO ID</span>
                      <span className="font-extrabold text-slate-200">#PO-{po.id}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider text-right">Destination Warehouse</span>
                      <span className="text-slate-400 text-sm font-semibold block text-right">{po.warehouse.name}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider text-right">Delivery Status</span>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded block text-right w-fit ml-auto ${
                        po.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'
                      }`}>{po.status}</span>
                    </div>
                  </div>

                  <div className="flex justify-between border-t border-slate-800 pt-3 text-sm text-slate-300">
                    <span>SKU Item: <span className="text-emerald-400 font-bold">{po.product.name}</span></span>
                    <span className="font-bold">{po.quantity} units</span>
                  </div>

                  {po.status === 'PENDING' && (
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => setSelectedPoId(po.id)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-xs transition"
                      >
                        Prepare Dispatch
                      </button>
                    </div>
                  )}

                  {selectedPoId === po.id && (
                    <div className="bg-slate-900 p-4 rounded-lg flex flex-col sm:flex-row gap-3 items-end">
                      <div className="flex-grow space-y-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Logistics Tracking Number</label>
                        <input
                          type="text"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          placeholder="E.g. SHIP-8234-NY"
                          className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleShipPO(po.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-xs transition flex items-center gap-1"
                        >
                          <Navigation className="w-3.5 h-3.5" /> Ship Dispatch
                        </button>
                        <button
                          onClick={() => setSelectedPoId(null)}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded text-xs transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {po.deliveryTrackingNumber && (
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 border-t border-slate-850 pt-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Logistics Tracking: <code className="text-emerald-400">{po.deliveryTrackingNumber}</code>
                    </div>
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
