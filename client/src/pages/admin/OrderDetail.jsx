import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle2, XCircle, Printer, 
  Truck, Building2, User, Clock, ShieldCheck, AlertCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';
import { useSettings } from '../../contexts/SettingsContext';
import StatusBadge from '../../components/StatusBadge';

export const AdminOrderDetail = () => {
  const { id } = useParams();
  const { formatPrice } = useSettings();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [payments, setPayments] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status updates
  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierName, setCourierName] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/admin/orders/${id}`);
      if (res.order) {
        setOrder(res.order);
        setOrderStatus(res.order.order_status);
        setPaymentStatus(res.order.payment_status);
        setTrackingNumber(res.order.tracking_number || '');
        setCourierName(res.order.courier_name || '');
        setAdminNotes(res.order.admin_notes || '');
        setItems(res.items || []);
        setPayments(res.payments || []);
        setAuditLogs(res.auditLogs || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleUpdateOrderStatus = async () => {
    try {
      await api.put(`/admin/orders/${id}/status`, { order_status: orderStatus });
      toast.success('Order status updated');
      fetchOrder();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleUpdatePaymentStatus = async () => {
    try {
      await api.put(`/admin/orders/${id}/payment`, { payment_status: paymentStatus });
      toast.success('Payment status updated');
      fetchOrder();
    } catch (err) {
      toast.error('Failed to update payment status');
    }
  };

  const handleUpdateTracking = async () => {
    try {
      await api.put(`/admin/orders/${id}/tracking`, {
        tracking_number: trackingNumber.trim(),
        courier_name: courierName.trim()
      });
      toast.success('Courier tracking details saved');
      fetchOrder();
    } catch (err) {
      toast.error('Failed to update tracking');
    }
  };

  const handleSaveNotes = async () => {
    try {
      await api.post(`/admin/orders/${id}/notes`, { admin_notes: adminNotes });
      toast.success('Internal notes saved');
      fetchOrder();
    } catch (err) {
      toast.error('Failed to save notes');
    }
  };

  const handleVerifyReceipt = async (action) => {
    try {
      await api.post(`/admin/orders/${id}/verify-receipt`, {
        action,
        notes: `Receipt ${action}d via admin panel`
      });
      toast.success(`Receipt ${action}d!`);
      fetchOrder();
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const handlePrint = () => {
    window.print();
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
      <div className="p-8 text-center text-slate-500">
        Order not found.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top action header */}
      <div className="flex items-center justify-between">
        <Link to="/admin/orders" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </Link>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs"
        >
          <Printer className="h-4 w-4" /> Print Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Invoice & Items */}
        <div className="lg:col-span-2 space-y-6">
          <div id="printable-invoice" className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Customer Invoice</span>
                <h2 className="font-mono text-2xl font-black text-slate-900 mt-1">{order.order_number}</h2>
                <p className="text-xs text-slate-400 mt-0.5">Date: {new Date(order.created_at).toLocaleString()}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <StatusBadge status={order.order_status} type="order" />
                <StatusBadge status={order.payment_status} type="payment" />
              </div>
            </div>

            {/* Customer & Shipping information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-700">
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Customer Info</span>
                <p className="font-bold text-slate-900 text-sm">{order.customer_name}</p>
                <p className="mt-0.5">Phone: <strong className="text-slate-900">{order.customer_phone}</strong></p>
                {order.customer_email && <p className="text-slate-500">{order.customer_email}</p>}
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">
                  {order.fulfilment_type === 'pickup' ? 'Store Pickup Details' : 'Delivery Address'}
                </span>
                {order.fulfilment_type === 'pickup' ? (
                  <p className="font-bold text-emerald-800">In-Store Collection</p>
                ) : (
                  <p className="leading-relaxed font-medium">
                    {order.shipping_house && `${order.shipping_house}, `}
                    {order.shipping_street && `${order.shipping_street}, `}
                    {order.shipping_area && `${order.shipping_area}, `}
                    <strong className="text-slate-900">{order.shipping_city}</strong>
                    {order.shipping_landmark && <span className="block text-slate-400">Near: {order.shipping_landmark}</span>}
                  </p>
                )}
              </div>
            </div>

            {/* Ordered Items Table */}
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Dispensed Remedies</span>
              <table className="w-full text-left text-xs border border-slate-100 rounded-2xl overflow-hidden">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="p-3">Product Name</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {items.map((it) => (
                    <tr key={it.id}>
                      <td className="p-3 font-bold text-slate-900">{it.product_name}</td>
                      <td className="p-3 font-mono text-slate-500">{it.product_sku || 'N/A'}</td>
                      <td className="p-3 text-center font-bold text-slate-900">{it.quantity}</td>
                      <td className="p-3 text-right">{formatPrice(it.unit_price)}</td>
                      <td className="p-3 text-right font-bold text-slate-900">{formatPrice(it.total_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Breakdown */}
            <div className="max-w-xs ml-auto space-y-1.5 text-xs text-slate-600 pt-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge:</span>
                <span className="font-semibold text-slate-900">{formatPrice(order.delivery_charge)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount ({order.coupon_code || ''}):</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-100">
                <span>Final Total:</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>

            {/* Special notes */}
            {order.order_notes && (
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
                <strong>Customer Notes:</strong> {order.order_notes}
              </div>
            )}
          </div>

          {/* Audit Trail */}
          {auditLogs.length > 0 && (
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="font-serif text-sm font-bold text-slate-900 uppercase tracking-wider">Order History & Audit Logs</h3>
              <div className="space-y-2 text-xs divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <div key={log.id} className="pt-2 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800">{log.details || log.action}</span>
                      <span className="text-[10px] text-slate-400 block">{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Order Controls & Verification */}
        <div className="space-y-6">
          {/* Order Status Controller */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-serif text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Fulfillment Status
            </h3>
            <div className="space-y-3">
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold"
              >
                <option value="pending">Pending Confirmation</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing / Dispensing</option>
                <option value="ready_for_pickup">Ready for Pickup</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="returned">Returned</option>
              </select>

              <button
                onClick={handleUpdateOrderStatus}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
              >
                Update Fulfillment Status
              </button>
            </div>
          </div>

          {/* Payment Status Controller */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-serif text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Payment Control
            </h3>
            <div className="space-y-3">
              <div className="text-xs text-slate-500">
                Method: <strong className="text-slate-800 capitalize">{order.payment_method?.replace(/_/g, ' ')}</strong>
              </div>

              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold"
              >
                <option value="unpaid">Unpaid</option>
                <option value="awaiting_verification">Awaiting Verification</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
                <option value="failed">Failed</option>
              </select>

              <button
                onClick={handleUpdatePaymentStatus}
                className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition"
              >
                Update Payment Status
              </button>
            </div>
          </div>

          {/* Bank Receipt Verification (if receipt attached) */}
          {payments.some(p => p.receipt_image) && (
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-serif text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-emerald-700" /> Bank Payment Receipt
              </h3>

              {payments.filter(p => p.receipt_image).map((p, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                    <img
                      src={p.receipt_image}
                      alt="Payment Receipt"
                      className="h-full w-full object-contain cursor-pointer"
                      onClick={() => window.open(p.receipt_image, '_blank')}
                    />
                  </div>
                  {p.transaction_id && (
                    <p className="text-xs font-mono text-slate-600">Ref: {p.transaction_id}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVerifyReceipt('approve')}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow hover:bg-emerald-700"
                    >
                      Approve & Mark Paid
                    </button>
                    <button
                      onClick={() => handleVerifyReceipt('reject')}
                      className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Courier & Tracking assignment */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-serif text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-emerald-700" /> Courier & Tracking
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Courier Company</label>
                <input
                  type="text"
                  placeholder="e.g. TCS, Leopards, Call Courier, PostEx"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Tracking Number</label>
                <input
                  type="text"
                  placeholder="e.g. 1234567890"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full p-2 text-xs font-mono border border-slate-200 rounded-xl"
                />
              </div>

              <button
                onClick={handleUpdateTracking}
                className="w-full py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Save Tracking & Mark Shipped
              </button>
            </div>
          </div>

          {/* Admin Internal Notes */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-serif text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Internal Admin Notes
            </h3>
            <div className="space-y-3">
              <textarea
                rows={3}
                placeholder="Private remarks (not visible to customer)..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl"
              />
              <button
                onClick={handleSaveNotes}
                className="w-full py-2 rounded-xl border border-slate-200 text-slate-800 text-xs font-bold hover:bg-slate-50"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;
