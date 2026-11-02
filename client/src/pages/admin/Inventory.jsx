import React, { useState, useEffect } from 'react';
import { 
  Warehouse, Search, Plus, Minus, AlertTriangle, 
  History, CheckCircle2, ArrowUpDown 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';
import { useSettings } from '../../contexts/SettingsContext';

export const AdminInventory = () => {
  const { formatPrice } = useSettings();

  const [inventory, setInventory] = useState([]);
  const [filter, setFilter] = useState(''); // '', 'low', 'out'
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Stock Adjustment Modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustmentQty, setAdjustmentQty] = useState('');
  const [adjustmentAction, setAdjustmentAction] = useState('add'); // 'add' or 'subtract'
  const [adjustmentNotes, setAdjustmentNotes] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  // History Modal
  const [historyProduct, setHistoryProduct] = useState(null);
  const [movementHistory, setMovementHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        ...(filter && { filter }),
        ...(search && { search })
      }).toString();

      const res = await api.get(`/admin/inventory?${query}`);
      if (res.inventory) {
        setInventory(res.inventory);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [filter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInventory();
  };

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    const qty = parseInt(adjustmentQty, 10);
    if (isNaN(qty) || qty <= 0) {
      toast.error('Please enter a valid positive quantity');
      return;
    }

    const change = adjustmentAction === 'add' ? qty : -qty;

    setAdjusting(true);
    try {
      await api.put(`/admin/inventory/${selectedProduct.id}`, {
        quantity_change: change,
        notes: adjustmentNotes || `Manual ${adjustmentAction} adjustment`
      });
      toast.success('Stock adjusted successfully');
      setSelectedProduct(null);
      setAdjustmentQty('');
      setAdjustmentNotes('');
      fetchInventory();
    } catch (err) {
      toast.error(err.message || 'Failed to adjust stock');
    } finally {
      setAdjusting(false);
    }
  };

  const handleOpenHistory = async (prod) => {
    setHistoryProduct(prod);
    setHistoryLoading(true);
    try {
      const res = await api.get(`/admin/inventory/${prod.id}/history`);
      if (res.history) setMovementHistory(res.history);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load history');
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">Inventory & Stock Control</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time stock management, low-stock warnings, and historical logs.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search remedy name or SKU..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
        </form>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              !filter ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Products
          </button>
          <button
            onClick={() => setFilter('low')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
              filter === 'low' ? 'bg-amber-600 text-white shadow-xs' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle className="h-3 w-3" /> Low Stock
          </button>
          <button
            onClick={() => setFilter('out')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filter === 'out' ? 'bg-rose-600 text-white shadow-xs' : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            Out of Stock
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-600 border-t-transparent mx-auto" />
          </div>
        ) : inventory.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No items matching inventory filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-2">Remedy</th>
                  <th className="py-3 px-2">SKU</th>
                  <th className="py-3 px-2">Current Stock</th>
                  <th className="py-3 px-2">Alert Threshold</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-2">
                      <span className="font-bold text-slate-900 block">{item.name}</span>
                      <span className="text-[10px] text-slate-400">ID #{item.id}</span>
                    </td>
                    <td className="py-3 px-2 font-mono text-slate-500">{item.sku || 'N/A'}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                        item.stock === 0
                          ? 'bg-rose-100 text-rose-800'
                          : (item.stock <= item.low_stock_threshold ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800')
                      }`}>
                        {item.stock} in stock
                      </span>
                    </td>
                    <td className="py-3 px-2 text-slate-500 font-semibold">{item.low_stock_threshold} units</td>
                    <td className="py-3 px-2">
                      {item.stock === 0 ? (
                        <span className="text-rose-700 font-bold text-[11px]">Out of Stock</span>
                      ) : item.stock <= item.low_stock_threshold ? (
                        <span className="text-amber-700 font-bold text-[11px] flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Reorder Soon
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-bold text-[11px]">Adequate</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedProduct(item)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] transition"
                        >
                          Adjust Stock
                        </button>
                        <button
                          onClick={() => handleOpenHistory(item)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700"
                          title="Movement History"
                        >
                          <History className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stock Adjustment Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="font-serif text-lg font-bold text-slate-900">Adjust Stock Level</h3>
            <p className="text-xs text-slate-500">
              Product: <strong className="text-slate-800">{selectedProduct.name}</strong> (Currently: {selectedProduct.stock})
            </p>

            <form onSubmit={handleAdjustStock} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustmentAction('add')}
                  className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                    adjustmentAction === 'add' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <Plus className="h-3.5 w-3.5" /> Add Stock
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustmentAction('subtract')}
                  className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                    adjustmentAction === 'subtract' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <Minus className="h-3.5 w-3.5" /> Deduct Stock
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 10"
                  value={adjustmentQty}
                  onChange={(e) => setAdjustmentQty(e.target.value)}
                  className="w-full p-2.5 text-xs font-bold border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Reason / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Batch shipment received, damaged bottle..."
                  value={adjustmentNotes}
                  onChange={(e) => setAdjustmentNotes(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow hover:bg-slate-800 transition disabled:opacity-50"
                >
                  {adjusting ? 'Updating...' : 'Save Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Movement History Modal */}
      {historyProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-xl max-h-[85vh] flex flex-col">
            <h3 className="font-serif text-lg font-bold text-slate-900">Inventory Movement Logs</h3>
            <p className="text-xs text-slate-500">
              Audit trail for: <strong className="text-slate-800">{historyProduct.name}</strong>
            </p>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {historyLoading ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading history...</div>
              ) : movementHistory.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No movement history recorded.</div>
              ) : (
                <div className="divide-y divide-slate-100 text-xs">
                  {movementHistory.map((m) => (
                    <div key={m.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className={`font-bold ${
                          m.quantity_change > 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}>
                          {m.quantity_change > 0 ? `+${m.quantity_change}` : m.quantity_change} units
                        </span>
                        <span className="text-slate-600 ml-2 font-medium capitalize">({m.type})</span>
                        {m.notes && <p className="text-[11px] text-slate-400 mt-0.5">{m.notes}</p>}
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {new Date(m.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setHistoryProduct(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
