import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Trash2, ArrowRight, Minus, Plus, 
  Ticket, ShieldCheck, Truck, ChevronRight 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../contexts/CartContext';
import { useSettings } from '../contexts/SettingsContext';
import api from '../api';

export const Cart = () => {
  const { cart, loading, updateQuantity, removeItem, clearCart, subtotal } = useCart();
  const { settings, formatPrice } = useSettings();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const freeDeliveryThreshold = parseFloat(settings.free_delivery_threshold || '3000');
  const baseDeliveryCharge = parseFloat(settings.delivery_charge || '200');

  const qualifiesForFreeDelivery = subtotal >= freeDeliveryThreshold;
  const deliveryCharge = qualifiesForFreeDelivery ? 0 : baseDeliveryCharge;

  // Calculate discount if coupon applied
  const discount = appliedCoupon?.discount || 0;
  const finalTotal = Math.max(0, subtotal + deliveryCharge - discount);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    try {
      const res = await api.post('/settings/coupons/validate', {
        code: couponCode.trim(),
        subtotal
      });
      if (res.valid) {
        setAppliedCoupon(res);
        toast.success(`Coupon ${res.code} applied! Saved ${formatPrice(res.discount)}`);
      }
    } catch (err) {
      toast.error(err.message || 'Invalid or expired coupon');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const handleProceedToCheckout = () => {
    navigate('/checkout', {
      state: {
        appliedCoupon: appliedCoupon?.code || null
      }
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="h-20 w-20 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-slate-900">Your Basket is Empty</h2>
        <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
          Explore our wide range of authentic homeopathic mother tinctures, potentized dilutions, and health syrups.
        </p>
        <Link
          to="/shop"
          className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-emerald-700 px-8 py-3.5 text-sm font-bold text-white shadow-md hover:bg-emerald-800 transition"
        >
          <span>Start Shopping</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const progressToFreeDelivery = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
          Shopping Basket
        </h1>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:underline"
        >
          Clear Basket
        </button>
      </div>

      {/* Free delivery progress bar */}
      <div className="my-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80">
        <div className="flex items-center justify-between text-xs font-bold text-emerald-900 mb-2">
          <span className="flex items-center gap-1.5">
            <Truck className="h-4 w-4 text-emerald-700" />
            {qualifiesForFreeDelivery
              ? '🎉 You have unlocked Free Nationwide Delivery!'
              : `Add ${formatPrice(freeDeliveryThreshold - subtotal)} more to qualify for Free Delivery`}
          </span>
          <span>{Math.round(progressToFreeDelivery)}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-emerald-200/60 overflow-hidden">
          <div
            className="h-full bg-emerald-600 transition-all duration-500"
            style={{ width: `${progressToFreeDelivery}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs"
            >
              {/* Product Image */}
              <Link to={`/shop/${item.slug}`} className="h-20 w-20 rounded-xl bg-slate-50 overflow-hidden flex-shrink-0 border border-slate-100">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-400 font-semibold">
                    NO IMAGE
                  </div>
                )}
              </Link>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <Link to={`/shop/${item.slug}`} className="text-sm font-bold text-slate-900 hover:text-emerald-700 transition line-clamp-1">
                  {item.name}
                </Link>
                {item.product_size && (
                  <p className="text-xs text-slate-500 mt-0.5">{item.product_size}</p>
                )}
                <div className="text-xs font-semibold text-slate-900 mt-1">
                  {formatPrice(item.unit_price)} each
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="p-1.5 text-slate-600 hover:text-slate-900"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-bold text-slate-900">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={item.quantity >= item.stock}
                  className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Line item total */}
              <div className="text-right min-w-[70px]">
                <div className="text-sm font-bold text-slate-900">
                  {formatPrice(item.total_price)}
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-xs text-slate-400 hover:text-rose-600 transition mt-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-5">
            <h3 className="font-serif text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Order Summary
            </h3>

            {/* Coupon input */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Ticket className="h-3.5 w-3.5 text-emerald-700" /> Have a Coupon Code?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. WELCOME10"
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={couponLoading || !couponCode.trim()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition disabled:opacity-40"
                >
                  Apply
                </button>
              </div>

              {appliedCoupon && (
                <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-800 p-2 rounded-lg mt-1">
                  <span>Coupon {appliedCoupon.code} applied (-{formatPrice(appliedCoupon.discount)})</span>
                  <button onClick={removeCoupon} className="text-slate-400 hover:text-rose-600 font-bold ml-2">×</button>
                </div>
              )}
            </form>

            {/* Totals Breakdown */}
            <div className="space-y-2.5 text-sm pt-2 border-t border-slate-100">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Estimated Delivery</span>
                <span className="font-semibold text-slate-900">
                  {deliveryCharge === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : formatPrice(deliveryCharge)}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-3 border-t border-slate-100">
                <span>Total Amount</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition transform active:scale-95"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <Link
              to="/shop"
              className="block text-center text-xs font-semibold text-slate-500 hover:text-emerald-700"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
