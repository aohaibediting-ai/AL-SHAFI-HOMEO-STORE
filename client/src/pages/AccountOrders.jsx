import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, AlertCircle, ShoppingBag } from 'lucide-react';
import api from '../api';
import { useSettings } from '../contexts/SettingsContext';
import StatusBadge from '../components/StatusBadge';

export const AccountOrders = () => {
  const { formatPrice } = useSettings();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders')
      .then(res => {
        if (res.orders) setOrders(res.orders);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-600 border-t-transparent mx-auto" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-8 sm:p-12 text-center rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div className="h-16 w-16 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
          <Package className="h-8 w-8" />
        </div>
        <h3 className="font-serif text-lg font-bold text-slate-900">No Orders Placed Yet</h3>
        <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto">
          You haven't placed any orders with us yet. Explore our homeopathic remedies catalog.
        </p>
        <Link to="/shop" className="mt-6 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold">
          <ShoppingBag className="h-4 w-4" /> Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
        <h2 className="font-serif text-lg font-bold text-slate-900">My Orders History</h2>
        <span className="text-xs text-slate-500">{orders.length} order(s) found</span>
      </div>

      <div className="space-y-3">
        {orders.map((ord) => (
          <Link
            key={ord.id}
            to={`/account/orders/${ord.order_number}`}
            className="block p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs text-slate-400">Order Reference</span>
                <p className="font-mono font-bold text-slate-900 text-sm">{ord.order_number}</p>
                <span className="text-[11px] text-slate-500">
                  {new Date(ord.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={ord.order_status} type="order" />
                <StatusBadge status={ord.payment_status} type="payment" />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between">
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-800">{ord.items_count || (ord.items ? ord.items.length : 1)} items</span>
                <span className="mx-2">•</span>
                <span className="font-bold text-slate-900">{formatPrice(ord.total)}</span>
              </div>
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                View Details <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AccountOrders;
