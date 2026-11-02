import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { 
  CheckCircle, PackageCheck, Upload, Building2, Printer, 
  ArrowRight, ShieldCheck, Clock, FileText 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import { useSettings } from '../contexts/SettingsContext';

export const OrderConfirmation = () => {
  const { orderNumber } = useParams();
  const location = useLocation();
  const { settings, formatPrice } = useSettings();

  const [order, setOrder] = useState(location.state?.order || null);
  const [guestToken, setGuestToken] = useState(location.state?.guestToken || null);
  const [loading, setLoading] = useState(!order);
  
  // Receipt upload form
  const [receiptFile, setReceiptFile] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [receiptUploaded, setReceiptUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!order) {
      // Try to fetch order details
      api.get(`/orders/track/${orderNumber}`)
        .then(res => {
          if (res.order) setOrder(res.order);
        })
        .catch(err => {
          console.error(err);
        })
        .finally(() => setLoading(false));
    }
  }, [orderNumber, order]);

  const handleReceiptUpload = async (e) => {
    e.preventDefault();
    if (!receiptFile) {
      toast.error('Please select a receipt screenshot or photo');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('receipt', receiptFile);
      if (transactionId) formData.append('transaction_id', transactionId);
      if (guestToken) formData.append('guest_token', guestToken);

      const res = await api.post(`/payments/${orderNumber}/receipt`, formData);
      if (res.success) {
        toast.success('Payment receipt submitted for verification!');
        setReceiptUploaded(true);
      }
    } catch (err) {
      console.error('Receipt upload error:', err);
      toast.error(err.message || 'Failed to upload receipt');
    } finally {
      setUploading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Printable Invoice Container */}
      <div id="printable-invoice" className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-10 space-y-8">
        {/* Success Header */}
        <div className="text-center pb-6 border-b border-slate-100">
          <div className="h-16 w-16 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10" />
          </div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
            Order Confirmed
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Thank You for Your Order!
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
            Your homeopathic remedies have been booked. Our dispensary staff is preparing your package.
          </p>
        </div>

        {/* Order Meta details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Order Number</span>
            <span className="font-bold text-slate-900 font-mono text-sm">{orderNumber}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Payment Method</span>
            <span className="font-bold text-slate-900 capitalize">
              {order?.payment_method?.replace(/_/g, ' ') || 'Cash on Delivery'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Payment Status</span>
            <span className="font-bold text-emerald-700 capitalize">
              {order?.payment_status?.replace(/_/g, ' ') || 'Pending'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Total Amount</span>
            <span className="font-extrabold text-slate-900 text-sm">
              {formatPrice(order?.total || 0)}
            </span>
          </div>
        </div>

        {/* Bank Transfer Instructions & Receipt Upload */}
        {order?.payment_method === 'bank_transfer' && (
          <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-4">
            <div className="flex items-start gap-3">
              <Building2 className="h-6 w-6 text-emerald-800 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-emerald-950">
                  Bank Transfer / Mobile Wallet Instructions
                </h3>
                <p className="text-xs text-emerald-900/80 mt-1">
                  Please transfer <strong className="font-bold">{formatPrice(order?.total || 0)}</strong> to our account below:
                </p>
                <div className="mt-3 p-3 bg-white rounded-xl border border-emerald-200 text-xs text-slate-800 font-mono whitespace-pre-line leading-relaxed">
                  {settings.bank_details}
                </div>
              </div>
            </div>

            {/* Receipt upload form */}
            <div className="pt-2 border-t border-emerald-200/60">
              {receiptUploaded ? (
                <div className="flex items-center gap-2 p-3 bg-white rounded-xl text-xs font-semibold text-emerald-800 border border-emerald-200">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>Receipt uploaded successfully! Our accounts team will verify it shortly.</span>
                </div>
              ) : (
                <form onSubmit={handleReceiptUpload} className="space-y-3">
                  <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <Upload className="h-3.5 w-3.5" /> Upload Payment Screenshot / Receipt:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setReceiptFile(e.target.files[0])}
                      className="text-xs file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-700 file:text-white hover:file:bg-emerald-800 cursor-pointer"
                    />
                    <input
                      type="text"
                      placeholder="Transaction / Reference ID (Optional)"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="px-3 py-1.5 text-xs rounded-xl border border-emerald-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={uploading || !receiptFile}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition disabled:opacity-40"
                  >
                    {uploading ? 'Uploading...' : 'Submit Payment Proof'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
          >
            <Printer className="h-4 w-4" />
            Print Order Summary
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              to={`/track-order?order=${orderNumber}`}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition"
            >
              Track Shipment
            </Link>

            <Link
              to="/shop"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition"
            >
              <span>Back to Store</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
