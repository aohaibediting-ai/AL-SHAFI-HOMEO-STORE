import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Package, Clock, ShieldAlert, 
  Upload, CheckCircle, Printer 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import { useSettings } from '../contexts/SettingsContext';
import StatusBadge from '../components/StatusBadge';

export const AccountOrderDetail = () => {
  const { orderNumber } = useParams();
  const { formatPrice } = useSettings();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cancellation
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Receipt
  const [receiptFile, setReceiptFile] = useState(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  const fetchOrderDetail = async () => {
    try {
      const res = await api.get(`/orders/${orderNumber}`);
      if (res.order) {
        setOrder(res.order);
        setItems(res.items || []);
        setPayments(res.payments || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [orderNumber]);

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      await api.post(`/orders/${orderNumber}/cancel`, { reason: cancelReason || 'Cancelled by customer' });
      toast.success('Order cancelled successfully');
      setShowCancelModal(false);
      fetchOrderDetail();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleUploadReceipt = async (e) => {
    e.preventDefault();
    if (!receiptFile) return;

    setUploadingReceipt(true);
    try {
      const formData = new FormData();
      formData.append('receipt', receiptFile);
      const res = await api.post(`/payments/${order.id}/receipt`, formData);
      toast.success('Payment receipt submitted!');
      fetchOrderDetail();
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploadingReceipt(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-600 border-t-transparent mx-auto" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-10 text-center rounded-3xl bg-white border border-slate-200">
        <h3 className="font-bold text-slate-900">Order not found</h3>
        <Link to="/account/orders" className="text-xs font-semibold text-emerald-700 hover:underline mt-2 inline-block">
          Return to orders
        </Link>
      </div>
    );
  }

  const canCancel = ['pending', 'confirmed'].includes(order.order_status);

  return (
    <div className="space-y-6">
      <Link to="/account/orders" className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800">
        <ArrowLeft className="h-4 w-4" /> Back to My Orders
      </Link>

      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-xs text-slate-400">Order Reference</span>
            <h2 className="font-mono text-xl font-bold text-slate-900">{order.order_number}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Placed on {new Date(order.created_at).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={order.order_status} type="order" />
            <StatusBadge status={order.payment_status} type="payment" />
          </div>
        </div>

        {/* Shipment Tracking if available */}
        {order.tracking_number && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
            <div>
              <span className="font-bold block">Shipment Dispatched</span>
              <span>Courier: {order.courier_name || 'Standard'} • Tracking #: <strong className="font-mono">{order.tracking_number}</strong></span>
            </div>
            <Link to={`/track-order?order=${order.order_number}`} className="px-3 py-1 bg-white rounded-xl font-bold text-emerald-800 border border-emerald-300">
              Track
            </Link>
          </div>
        )}

        {/* Ordered items */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Order Items</h4>
          <div className="divide-y divide-slate-100 border-y border-slate-100">
            {items.map((it) => (
              <div key={it.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">{it.product_name}</span>
                  {it.product_sku && <span className="text-slate-400 ml-2 font-mono">({it.product_sku})</span>}
                  <div className="text-slate-500 mt-0.5">{it.quantity} x {formatPrice(it.unit_price)}</div>
                </div>
                <span className="font-bold text-slate-900">{formatPrice(it.total_price)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="max-w-xs ml-auto space-y-1.5 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-900">{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery</span>
            <span className="font-semibold text-slate-900">{formatPrice(order.delivery_charge)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Discount</span>
              <span>-{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* Bank Transfer Receipt upload if awaiting */}
        {order.payment_method === 'bank_transfer' && order.payment_status !== 'paid' && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-2">
            <span className="font-bold text-amber-900 block">Bank Transfer Proof</span>
            <form onSubmit={handleUploadReceipt} className="flex gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setReceiptFile(e.target.files[0])}
                className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-amber-600 file:text-white"
              />
              <button
                type="submit"
                disabled={uploadingReceipt || !receiptFile}
                className="px-3 py-1 bg-amber-600 text-white rounded-lg font-bold disabled:opacity-50"
              >
                {uploadingReceipt ? 'Uploading...' : 'Submit Receipt'}
              </button>
            </form>
          </div>
        )}

        {/* Actions: Cancel if pending */}
        {canCancel && (
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition"
            >
              Cancel Order
            </button>
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="font-bold text-slate-900">Cancel this order?</h3>
            <p className="text-xs text-slate-500">
              Your order will be cancelled and items restored to inventory.
            </p>
            <textarea
              placeholder="Reason for cancellation (optional)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full p-2 text-xs border border-slate-200 rounded-xl"
              rows={2}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 font-semibold"
              >
                Back
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="px-4 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountOrderDetail;
