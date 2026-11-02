import React from 'react';

export const StatusBadge = ({ status, type = 'order' }) => {
  if (!status) return null;

  const s = String(status).toLowerCase();

  // Color mappings
  const config = {
    // Order fulfillment statuses
    pending: { label: 'Pending Confirmation', bg: 'bg-amber-100 text-amber-800 border-amber-200' },
    confirmed: { label: 'Confirmed', bg: 'bg-blue-100 text-blue-800 border-blue-200' },
    processing: { label: 'Processing', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    ready_for_pickup: { label: 'Ready for Pickup', bg: 'bg-purple-100 text-purple-800 border-purple-200' },
    shipped: { label: 'Shipped', bg: 'bg-sky-100 text-sky-800 border-sky-200' },
    delivered: { label: 'Delivered', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    cancelled: { label: 'Cancelled', bg: 'bg-rose-100 text-rose-800 border-rose-200' },
    returned: { label: 'Returned', bg: 'bg-slate-100 text-slate-800 border-slate-200' },

    // Payment statuses
    unpaid: { label: 'Unpaid', bg: 'bg-rose-100 text-rose-800 border-rose-200' },
    awaiting_verification: { label: 'Awaiting Verification', bg: 'bg-amber-100 text-amber-800 border-amber-200' },
    paid: { label: 'Paid', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    refunded: { label: 'Refunded', bg: 'bg-orange-100 text-orange-800 border-orange-200' },
    failed: { label: 'Failed', bg: 'bg-red-100 text-red-800 border-red-200' },

    // Product statuses
    published: { label: 'Published', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    draft: { label: 'Draft', bg: 'bg-slate-100 text-slate-700 border-slate-200' },
    unavailable: { label: 'Unavailable', bg: 'bg-rose-100 text-rose-800 border-rose-200' },
  };

  const current = config[s] || { label: status.replace(/_/g, ' '), bg: 'bg-slate-100 text-slate-800 border-slate-200' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${current.bg}`}>
      {current.label}
    </span>
  );
};

export default StatusBadge;
