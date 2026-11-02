import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, Package, Truck, CheckCircle2, Clock, 
  MapPin, AlertCircle, Copy, ExternalLink 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import { useSettings } from '../contexts/SettingsContext';
import StatusBadge from '../components/StatusBadge';

export const OrderTracking = () => {
  const [searchParams] = useSearchParams();
  const { formatPrice } = useSettings();

  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const tokenParam = searchParams.get('token');

  const executeTrack = async (identifier, phoneNumber) => {
    if (!identifier) return;
    setLoading(true);
    setSearched(true);
    try {
      const url = phoneNumber
        ? `/orders/track/${encodeURIComponent(identifier)}?phone=${encodeURIComponent(phoneNumber)}`
        : `/orders/track/${encodeURIComponent(identifier)}`;
      const res = await api.get(url);
      if (res.order) {
        setOrder(res.order);
      }
    } catch (err) {
      console.error('Tracking query error:', err);
      setOrder(null);
      toast.error(err.message || 'No matching order found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tokenParam) {
      executeTrack(tokenParam, '');
    } else if (orderNumber) {
      // Prompt phone if needed or search
      executeTrack(orderNumber, phone);
    }
  }, []);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      toast.error('Please enter your order number');
      return;
    }
    executeTrack(orderNumber.trim(), phone.trim());
  };

  const copyTracking = () => {
    if (order?.tracking_number) {
      navigator.clipboard.writeText(order.tracking_number);
      toast.success('Tracking number copied');
    }
  };

  // Status timeline steps
  const steps = [
    { key: 'pending', label: 'Order Placed' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'processing', label: 'Dispensing' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
  ];

  const getStepIndex = (status) => {
    const s = String(status).toLowerCase();
    if (s === 'pending') return 0;
    if (s === 'confirmed') return 1;
    if (s === 'processing' || s === 'ready_for_pickup') return 2;
    if (s === 'shipped') return 3;
    if (s === 'delivered') return 4;
    return 0;
  };

  const currentStep = order ? getStepIndex(order.order_status) : 0;
  const isCancelled = order?.order_status === 'cancelled';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Real-time status</span>
        <h1 className="font-serif text-3xl font-bold text-slate-900 mt-1">Track Your Order</h1>
        <p className="mt-2 text-sm text-slate-500">
          Enter your Order Number and phone number to verify status and track dispatch.
        </p>
      </div>

      {/* Search Tracker Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm max-w-xl mx-auto">
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Order Number *</label>
            <input
              type="text"
              required
              placeholder="e.g. ASH-20261024-1234"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Customer Phone Number</label>
            <input
              type="tel"
              placeholder="e.g. 0300 1234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>Track Package</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results Display */}
      {order && (
        <div className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-8 animate-in fade-in">
          {/* Order Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs text-slate-400 block">Order Reference</span>
              <h2 className="font-mono text-xl font-bold text-slate-900">{order.order_number}</h2>
              <span className="text-xs text-slate-500 mt-1 block">Placed on {new Date(order.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={order.order_status} type="order" />
              <StatusBadge status={order.payment_status} type="payment" />
            </div>
          </div>

          {/* Timeline */}
          {isCancelled ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>This order has been cancelled. If you need support, please contact our helpline.</span>
            </div>
          ) : (
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-6">Delivery Progress</h3>
              <div className="relative flex items-center justify-between">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 -z-0" />
                <div
                  className="absolute top-1/2 left-0 h-1 bg-emerald-600 -translate-y-1/2 -z-0 transition-all duration-500"
                  style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((st, idx) => {
                  const isDone = idx <= currentStep;
                  const isCurrent = idx === currentStep;

                  return (
                    <div key={st.key} className="flex flex-col items-center relative z-10">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                        isDone
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-50'
                          : 'bg-white border-2 border-slate-200 text-slate-400'
                      }`}>
                        {idx + 1}
                      </div>
                      <span className={`mt-2 text-[11px] sm:text-xs font-semibold ${
                        isCurrent ? 'text-emerald-700 font-bold' : (isDone ? 'text-slate-900' : 'text-slate-400')
                      }`}>
                        {st.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Courier Tracking section if available */}
          {order.tracking_number && (
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider block">Courier Shipment</span>
                <p className="text-xs text-emerald-900 mt-0.5">
                  Courier: <strong className="font-bold">{order.courier_name || 'Standard Courier'}</strong>
                </p>
                <p className="text-sm font-mono font-bold text-slate-900 mt-1">
                  Tracking #: {order.tracking_number}
                </p>
              </div>
              <button
                onClick={copyTracking}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Tracking #</span>
              </button>
            </div>
          )}

          {/* Items Summary */}
          {order.items && order.items.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Ordered Remedies</h4>
              <div className="divide-y divide-slate-100">
                {order.items.map((it, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800">{it.quantity}x {it.product_name}</span>
                    <span className="font-bold text-slate-900">{formatPrice(it.total_price)}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 flex justify-between text-sm font-bold text-slate-900 border-t border-slate-100">
                <span>Total Amount:</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {searched && !order && !loading && (
        <div className="text-center py-12 rounded-3xl bg-white border border-slate-200 max-w-xl mx-auto">
          <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">Order Not Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Please make sure you entered the correct Order Number and matching phone number.
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
