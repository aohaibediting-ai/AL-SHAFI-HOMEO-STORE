import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, DollarSign, Package, AlertTriangle, 
  Clock, CheckCircle, Truck, XCircle, ArrowUpRight, 
  TrendingUp, Plus, ExternalLink 
} from 'lucide-react';
import api from '../../api';
import { useSettings } from '../../contexts/SettingsContext';
import StatusBadge from '../../components/StatusBadge';

export const AdminDashboard = () => {
  const { formatPrice } = useSettings();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(res => {
        if (res.stats) setStats(res.stats);
        if (res.recentOrders) setRecentOrders(res.recentOrders);
        if (res.lowStockAlerts) setLowStockAlerts(res.lowStockAlerts);
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

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Dispensary Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Store performance overview, live orders, and pharmaceutical inventory telemetry.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition"
          >
            <Plus className="h-4 w-4" /> Add Product
          </Link>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow transition"
          >
            <ShoppingBag className="h-4 w-4" /> View Orders
          </Link>
        </div>
      </div>

      {/* Row 1: Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              Rs
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900">
              {formatPrice(stats?.totalRevenue || 0)}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Today: <strong className="text-slate-800">{formatPrice(stats?.todayRevenue || 0)}</strong>
            </p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900">
              {stats?.totalOrders || 0}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Today: <strong className="text-slate-800">{stats?.todayOrders || 0} orders</strong>
            </p>
          </div>
        </div>

        {/* Pending Orders */}
        <div className={`p-5 rounded-3xl bg-white border shadow-xs flex flex-col justify-between ${
          (stats?.pendingOrders || 0) > 0 ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200/80'
        }`}>
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Awaiting Action</span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-amber-900">
              {stats?.pendingOrders || 0}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Requires order confirmation
            </p>
          </div>
        </div>

        {/* Catalog Stock */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Medicines & Stock</span>
            <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900">
              {stats?.totalProducts || 0}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              <span className="text-emerald-700 font-bold">{stats?.publishedProducts || 0} published</span> • {stats?.draftProducts || 0} drafts
            </p>
          </div>
        </div>
      </div>

      {/* Row 2: Secondary Status Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
            <CheckCircle className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-bold uppercase">Confirmed</span>
            <span className="text-base font-bold text-slate-900">{stats?.confirmedOrders || 0}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
            <Truck className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-bold uppercase">In Transit</span>
            <span className="text-base font-bold text-slate-900">{stats?.shippedOrders || 0}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-bold uppercase">Low Stock</span>
            <span className="text-base font-bold text-amber-700">{stats?.lowStockProducts || 0}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
            <XCircle className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-bold uppercase">Out of Stock</span>
            <span className="text-base font-bold text-rose-700">{stats?.outOfStockProducts || 0}</span>
          </div>
        </div>
      </div>

      {/* Row 3: Live Tables (Recent Orders & Low Stock Alerts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900">Recent Customer Orders</h3>
              <p className="text-xs text-slate-500">Real-time incoming orders requiring dispatch.</p>
            </div>
            <Link to="/admin/orders" className="text-xs font-bold text-emerald-700 hover:underline">
              View all
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No orders recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-2.5">Order</th>
                    <th className="py-2.5">Customer</th>
                    <th className="py-2.5">Total</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 font-mono font-bold text-slate-900">
                        <Link to={`/admin/orders/${ord.id}`} className="hover:text-emerald-700">
                          {ord.order_number}
                        </Link>
                      </td>
                      <td className="py-3">
                        <span className="font-semibold text-slate-800 block">{ord.customer_name}</span>
                        <span className="text-[11px] text-slate-400">{ord.customer_phone}</span>
                      </td>
                      <td className="py-3 font-bold text-slate-900">
                        {formatPrice(ord.total)}
                      </td>
                      <td className="py-3">
                        <StatusBadge status={ord.order_status} type="order" />
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          to={`/admin/orders/${ord.id}`}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px]"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Watchlist (1 col) */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-600" /> Low Stock Watch
              </h3>
              <p className="text-xs text-slate-500">Items nearing replenishment threshold.</p>
            </div>
            <Link to="/admin/inventory" className="text-xs font-bold text-emerald-700 hover:underline">
              Inventory
            </Link>
          </div>

          {lowStockAlerts.length === 0 ? (
            <p className="text-xs text-emerald-700 py-6 text-center font-semibold">
              ✓ All products are comfortably stocked!
            </p>
          ) : (
            <div className="space-y-3">
              {lowStockAlerts.map((prod) => (
                <div key={prod.id} className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/60 border border-amber-200/60 text-xs">
                  <div className="min-w-0 pr-2">
                    <span className="font-bold text-slate-900 block truncate">{prod.name}</span>
                    <span className="text-[11px] text-slate-500 font-mono">{prod.sku}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                      prod.stock === 0 ? 'bg-rose-100 text-rose-800' : 'bg-amber-200 text-amber-900'
                    }`}>
                      {prod.stock} left
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
