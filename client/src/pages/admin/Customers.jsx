import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';
import { useSettings } from '../../contexts/SettingsContext';

export const AdminCustomers = () => {
  const { formatPrice } = useSettings();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/settings/customers')
      .then(res => {
        if (res.customers) setCustomers(res.customers);
      })
      .catch(err => {
        console.error(err);
        toast.error('Failed to load customers');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">Registered Customers</h1>
          <p className="text-xs text-slate-500 mt-1">Directory of patient accounts, lifetime orders, and contact details.</p>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-600 border-t-transparent mx-auto" />
          </div>
        ) : customers.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No customer accounts registered yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-2">Customer</th>
                  <th className="py-3 px-2">Contact Details</th>
                  <th className="py-3 px-2">Total Orders</th>
                  <th className="py-3 px-2">Lifetime Spent</th>
                  <th className="py-3 px-2 text-right">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                          {c.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-900">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Mail className="h-3 w-3 text-slate-400" />
                        <span>{c.email}</span>
                      </div>
                      {c.phone && (
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Phone className="h-3 w-3 text-slate-400" />
                          <span>{c.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-bold">
                        {c.orders_count} orders
                      </span>
                    </td>
                    <td className="py-3 px-2 font-bold text-emerald-700 text-sm">
                      {formatPrice(c.total_spent || 0)}
                    </td>
                    <td className="py-3 px-2 text-right text-slate-400">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomers;
