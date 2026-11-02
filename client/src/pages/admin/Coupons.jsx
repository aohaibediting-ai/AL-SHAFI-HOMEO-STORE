import React, { useState, useEffect } from 'react';
import { Ticket, Plus, Trash2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';

export const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form Fields
  const [code, setCode] = useState('');
  const [type, setType] = useState('percentage'); // 'percentage' or 'fixed'
  const [value, setValue] = useState('');
  const [minOrder, setMinOrder] = useState('0');
  const [maxUses, setMaxUses] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/admin/coupons');
      if (res.coupons) setCoupons(res.coupons);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!code.trim() || !value) {
      toast.error('Coupon code and discount value are required');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/admin/coupons', {
        code: code.trim().toUpperCase(),
        type,
        value: parseFloat(value),
        min_order: parseFloat(minOrder) || 0,
        max_uses: maxUses ? parseInt(maxUses, 10) : null
      });
      toast.success('Coupon code created');
      setShowModal(false);
      setCode('');
      setValue('');
      setMinOrder('0');
      setMaxUses('');
      fetchCoupons();
    } catch (err) {
      toast.error(err.message || 'Failed to create coupon');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, cCode) => {
    if (!window.confirm(`Delete coupon "${cCode}"?`)) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
      toast.success('Coupon removed');
      fetchCoupons();
    } catch (err) {
      toast.error('Failed to delete coupon');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">Discount Coupons</h1>
          <p className="text-xs text-slate-500 mt-1">Create promotional coupons, percentage discounts, and order thresholds.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition"
        >
          <Plus className="h-4 w-4" /> Add Coupon
        </button>
      </div>

      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-600 border-t-transparent mx-auto" />
          </div>
        ) : coupons.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No active coupons created yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-2">Coupon Code</th>
                  <th className="py-3 px-2">Discount</th>
                  <th className="py-3 px-2">Min Order</th>
                  <th className="py-3 px-2">Usage Count</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-2">
                      <span className="font-mono font-bold text-slate-900 text-sm">{c.code}</span>
                    </td>
                    <td className="py-3 px-2 font-bold text-emerald-700">
                      {c.type === 'percentage' ? `${c.value}% Off` : `Rs. ${c.value} Fixed Off`}
                    </td>
                    <td className="py-3 px-2 text-slate-600">Rs. {c.min_order}</td>
                    <td className="py-3 px-2 text-slate-600 font-semibold">
                      {c.used_count} / {c.max_uses ? `${c.max_uses} max` : 'Unlimited'}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.is_active ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {c.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => handleDelete(c.id, c.code)}
                        className="p-1.5 text-slate-400 hover:text-rose-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="font-serif text-lg font-bold text-slate-900">Create New Coupon</h3>
            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HEALTH15"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full p-2.5 text-xs font-mono uppercase font-bold border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Discount Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-200 rounded-xl bg-white font-semibold"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (Rs)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Value *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="10"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full p-2 text-xs font-bold border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Min Order Amount</label>
                  <input
                    type="number"
                    value={minOrder}
                    onChange={(e) => setMinOrder(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Max Usages</label>
                  <input
                    type="number"
                    placeholder="Unlimited"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow hover:bg-emerald-800 transition disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
