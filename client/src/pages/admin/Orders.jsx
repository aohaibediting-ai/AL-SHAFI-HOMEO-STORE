import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Download, Eye, Calendar, Filter, 
  ShoppingBag, CheckCircle2 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';
import { useSettings } from '../../contexts/SettingsContext';
import StatusBadge from '../../components/StatusBadge';

export const AdminOrders = () => {
  const { formatPrice } = useSettings();

  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page,
        limit: 20,
        ...(search && { search }),
        ...(orderStatus && { order_status: orderStatus }),
        ...(paymentStatus && { payment_status: paymentStatus }),
        ...(paymentMethod && { payment_method: paymentMethod }),
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate })
      }).toString();

      const res = await api.get(`/admin/orders?${query}`);
      if (res.orders) {
        setOrders(res.orders);
        setPagination(res.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, orderStatus, paymentStatus, paymentMethod, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleExportCSV = () => {
    const token = localStorage.getItem('ash_auth_token');
    window.open(`/api/admin/orders/export/csv?token=${token}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">Orders Management</h1>
          <p className="text-xs text-slate-500 mt-1">Review, process fulfillment, verify bank transfers, and print invoices.</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow transition"
        >
          <Download className="h-4 w-4" />
          <span>Export to CSV</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order #, Customer Name, Phone..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={orderStatus}
              onChange={(e) => { setOrderStatus(e.target.value); setPage(1); }}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-700"
            >
              <option value="">Fulfillment Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="ready_for_pickup">Ready for Pickup</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={paymentStatus}
              onChange={(e) => { setPaymentStatus(e.target.value); setPage(1); }}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-700"
            >
              <option value="">Payment Status</option>
              <option value="unpaid">Unpaid</option>
              <option value="awaiting_verification">Awaiting Verification</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
            </select>

            <select
              value={paymentMethod}
              onChange={(e) => { setPaymentMethod(e.target.value); setPage(1); }}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-700"
            >
              <option value="">Payment Method</option>
              <option value="cash_on_delivery">Cash on Delivery</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="store_pickup">Store Pickup</option>
              <option value="online">Online Gateway</option>
            </select>
          </div>
        </form>
      </div>

      {/* Orders Table */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-600 border-t-transparent mx-auto" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No orders match the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-2">Order #</th>
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2">Customer Info</th>
                  <th className="py-3 px-2">City</th>
                  <th className="py-3 px-2">Total Amount</th>
                  <th className="py-3 px-2">Payment</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-2 font-mono font-bold text-slate-900">
                      <Link to={`/admin/orders/${o.id}`} className="hover:text-emerald-700">
                        {o.order_number}
                      </Link>
                    </td>
                    <td className="py-3 px-2 text-slate-500 whitespace-nowrap">
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-2">
                      <span className="font-bold text-slate-900 block">{o.customer_name}</span>
                      <span className="text-[11px] text-slate-400">{o.customer_phone}</span>
                    </td>
                    <td className="py-3 px-2 text-slate-700">{o.shipping_city || 'Pick Up'}</td>
                    <td className="py-3 px-2 font-bold text-slate-900">
                      {formatPrice(o.total)}
                    </td>
                    <td className="py-3 px-2 space-y-1">
                      <div><StatusBadge status={o.payment_status} type="payment" /></div>
                      <span className="text-[10px] text-slate-400 block capitalize">
                        {o.payment_method?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <StatusBadge status={o.order_status} type="order" />
                    </td>
                    <td className="py-3 px-2 text-right">
                      <Link
                        to={`/admin/orders/${o.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Manage</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-6 mt-4 border-t border-slate-100 text-xs">
            <span className="text-slate-500">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} orders)
            </span>
            <div className="flex gap-1.5">
              {[...Array(pagination.totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`h-8 w-8 rounded-lg font-bold ${
                    page === i + 1 ? 'bg-emerald-700 text-white' : 'border border-slate-200 text-slate-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
