import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, Truck, Store, CreditCard, Banknote, 
  Building2, CheckCircle2, ChevronRight, AlertCircle, ArrowLeft 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import api from '../api';

export const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, subtotal: cartSubtotal, refreshCart } = useCart();
  const { user } = useAuth();
  const { settings, formatPrice } = useSettings();

  // Buy Now item support
  const buyNowItem = location.state?.buyNowItem || null;
  const initialCoupon = location.state?.appliedCoupon || '';

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');

  // Form State
  const [fulfilmentType, setFulfilmentType] = useState('delivery'); // 'delivery' or 'pickup'
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery'); // 'cash_on_delivery', 'bank_transfer', 'store_pickup', 'online'
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  
  // Address Fields
  const [shippingCountry, setShippingCountry] = useState('Pakistan');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingArea, setShippingArea] = useState('');
  const [shippingStreet, setShippingStreet] = useState('');
  const [shippingHouse, setShippingHouse] = useState('');
  const [shippingLandmark, setShippingLandmark] = useState('');
  const [shippingPostalCode, setShippingPostalCode] = useState('');
  const [shippingInstructions, setShippingInstructions] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [couponCode, setCouponCode] = useState(initialCoupon);

  const [loading, setLoading] = useState(false);

  // Load saved addresses if logged in
  useEffect(() => {
    if (user) {
      api.get('/customer/addresses').then(res => {
        if (res.addresses && res.addresses.length > 0) {
          setSavedAddresses(res.addresses);
          const defaultAddr = res.addresses.find(a => a.is_default) || res.addresses[0];
          applyAddress(defaultAddr);
        }
      }).catch(err => console.error(err));
    }
  }, [user]);

  const applyAddress = (addr) => {
    if (!addr) return;
    setSelectedAddressId(addr.id);
    setCustomerName(addr.name || customerName);
    setCustomerPhone(addr.phone || customerPhone);
    setCustomerEmail(addr.email || customerEmail);
    setShippingCity(addr.city || '');
    setShippingArea(addr.area || '');
    setShippingStreet(addr.street || '');
    setShippingHouse(addr.house_number || '');
    setShippingLandmark(addr.landmark || '');
    setShippingPostalCode(addr.postal_code || '');
    setShippingInstructions(addr.delivery_instructions || '');
  };

  // Determine items & totals
  const items = buyNowItem ? [{
    product_id: buyNowItem.product_id,
    quantity: buyNowItem.quantity,
    name: buyNowItem.name,
    sku: buyNowItem.sku,
    unit_price: buyNowItem.price,
    total_price: buyNowItem.price * buyNowItem.quantity,
    image: buyNowItem.image
  }] : (cart?.items || []);

  const subtotal = buyNowItem
    ? (buyNowItem.price * buyNowItem.quantity)
    : cartSubtotal;

  const freeDeliveryThreshold = parseFloat(settings.free_delivery_threshold || '3000');
  const baseDeliveryCharge = parseFloat(settings.delivery_charge || '200');

  const deliveryCharge = fulfilmentType === 'pickup'
    ? 0
    : (subtotal >= freeDeliveryThreshold ? 0 : baseDeliveryCharge);

  const total = subtotal + deliveryCharge;

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error('Customer full name and mobile number are required');
      return;
    }

    if (fulfilmentType === 'delivery' && (!shippingCity.trim() || !shippingStreet.trim())) {
      toast.error('Delivery city and complete street address are required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_email: customerEmail.trim() || null,
        shipping_country: shippingCountry,
        shipping_city: shippingCity.trim(),
        shipping_area: shippingArea.trim(),
        shipping_street: shippingStreet.trim(),
        shipping_house: shippingHouse.trim(),
        shipping_landmark: shippingLandmark.trim(),
        shipping_postal_code: shippingPostalCode.trim(),
        shipping_instructions: shippingInstructions.trim(),
        fulfilment_type: fulfilmentType,
        payment_method: paymentMethod,
        order_notes: orderNotes.trim(),
        coupon_code: couponCode.trim() || null,
        // If Buy Now mode, send explicit item array
        items: buyNowItem ? [{ product_id: buyNowItem.product_id, quantity: buyNowItem.quantity }] : undefined
      };

      const res = await api.post('/orders', payload);

      if (res.success && res.order) {
        toast.success('Order placed successfully!');
        if (!buyNowItem) {
          refreshCart();
        }
        navigate(`/order-confirmation/${res.order.order_number}`, {
          state: {
            order: res.order,
            guestToken: res.order.guest_token
          }
        });
      }
    } catch (err) {
      console.error('Order checkout error:', err);
      toast.error(err.message || 'Failed to place order. Please check all fields.');
    } finally {
      setLoading(false);
    }
  };

  if (!buyNowItem && (!cart || items.length === 0)) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-bold text-slate-900">Your basket is empty</h2>
        <p className="mt-2 text-sm text-slate-500">Add medicines or remedies to your basket before checking out.</p>
        <Link to="/shop" className="mt-6 inline-block px-6 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-sm">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <Link to="/cart" className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 mb-2">
          <ArrowLeft className="h-4 w-4" /> Return to basket
        </Link>
        <h1 className="font-serif text-3xl font-bold text-slate-900">Checkout & Order Placement</h1>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Delivery & Customer Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Fulfilment Choice: Delivery vs Store Pickup */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-bold text-slate-900">1. Fulfilment Option</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition ${
                fulfilmentType === 'delivery' ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200 hover:border-slate-300'
              }`}>
                <input
                  type="radio"
                  name="fulfilment"
                  value="delivery"
                  checked={fulfilmentType === 'delivery'}
                  onChange={() => { setFulfilmentType('delivery'); if (paymentMethod === 'store_pickup') setPaymentMethod('cash_on_delivery'); }}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-emerald-700" /> Home Delivery
                  </span>
                  <p className="text-xs text-slate-500 mt-1">
                    Doorstep courier delivery across Pakistan in 2-4 working days.
                  </p>
                </div>
              </label>

              {settings.enable_store_pickup === 'true' && (
                <label className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition ${
                  fulfilmentType === 'pickup' ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="fulfilment"
                    value="pickup"
                    checked={fulfilmentType === 'pickup'}
                    onChange={() => { setFulfilmentType('pickup'); setPaymentMethod('store_pickup'); }}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Store className="h-4 w-4 text-emerald-700" /> Store Pickup (Free)
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      Collect at our dispensary in {settings.store_pickup_address || 'Lahore'}.
                    </p>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Contact Details */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-bold text-slate-900">2. Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Muhammad Ali"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Number (WhatsApp) *</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="0300 1234567"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="you@example.com (for order receipts)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Delivery Address (if Delivery chosen) */}
          {fulfilmentType === 'delivery' && (
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-bold text-slate-900">3. Delivery Address</h3>
                {savedAddresses.length > 0 && (
                  <select
                    value={selectedAddressId}
                    onChange={(e) => {
                      const addr = savedAddresses.find(a => a.id === parseInt(e.target.value, 10));
                      applyAddress(addr);
                    }}
                    className="text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 bg-slate-50 font-semibold"
                  >
                    <option value="">Use saved address...</option>
                    {savedAddresses.map((a) => (
                      <option key={a.id} value={a.id}>{a.city} - {a.street || a.area}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={shippingCity}
                    onChange={(e) => setShippingCity(e.target.value)}
                    placeholder="e.g. Lahore, Karachi, Islamabad"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Area / Town / Sector</label>
                  <input
                    type="text"
                    value={shippingArea}
                    onChange={(e) => setShippingArea(e.target.value)}
                    placeholder="e.g. Gulberg, DHA, F-7"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Complete Street Address *</label>
                  <input
                    type="text"
                    required
                    value={shippingStreet}
                    onChange={(e) => setShippingStreet(e.target.value)}
                    placeholder="Street name, road, or block"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">House / Flat / Shop Number</label>
                  <input
                    type="text"
                    value={shippingHouse}
                    onChange={(e) => setShippingHouse(e.target.value)}
                    placeholder="e.g. House # 14-B"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nearby Landmark (Optional)</label>
                  <input
                    type="text"
                    value={shippingLandmark}
                    onChange={(e) => setShippingLandmark(e.target.value)}
                    placeholder="e.g. Near PSO Pump"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Courier Delivery Instructions (Optional)</label>
                  <input
                    type="text"
                    value={shippingInstructions}
                    onChange={(e) => setShippingInstructions(e.target.value)}
                    placeholder="e.g. Call before delivery, leave with guard"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payment Method Selector */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-bold text-slate-900">4. Payment Method</h3>
            <div className="space-y-3">
              {/* Cash on Delivery */}
              {fulfilmentType === 'delivery' && settings.enable_cod === 'true' && (
                <label className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition ${
                  paymentMethod === 'cash_on_delivery' ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cash_on_delivery"
                    checked={paymentMethod === 'cash_on_delivery'}
                    onChange={() => setPaymentMethod('cash_on_delivery')}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Banknote className="h-4 w-4 text-emerald-700" /> Cash on Delivery (COD)
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      Pay cash to the rider when your package arrives safely at your doorstep.
                    </p>
                  </div>
                </label>
              )}

              {/* Direct Bank Transfer */}
              {settings.enable_bank_transfer === 'true' && (
                <label className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition ${
                  paymentMethod === 'bank_transfer' ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={() => setPaymentMethod('bank_transfer')}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Building2 className="h-4 w-4 text-emerald-700" /> Direct Bank Transfer / EasyPaisa / JazzCash
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      Transfer to our verified business bank account. You can upload the payment receipt on the next page.
                    </p>
                    {paymentMethod === 'bank_transfer' && (
                      <div className="mt-3 p-3 bg-white rounded-xl border border-emerald-200 text-xs text-slate-700 font-mono whitespace-pre-line leading-relaxed">
                        {settings.bank_details}
                      </div>
                    )}
                  </div>
                </label>
              )}

              {/* Store Pickup Payment */}
              {fulfilmentType === 'pickup' && (
                <label className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition ${
                  paymentMethod === 'store_pickup' ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="store_pickup"
                    checked={paymentMethod === 'store_pickup'}
                    onChange={() => setPaymentMethod('store_pickup')}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Store className="h-4 w-4 text-emerald-700" /> Pay at Dispensary on Pickup
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      Pay via Cash or Card when collecting your order at our branch.
                    </p>
                  </div>
                </label>
              )}

              {/* Online Payment Gateway */}
              {settings.enable_online_payment === 'true' && (
                <label className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition ${
                  paymentMethod === 'online' ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={() => setPaymentMethod('online')}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <CreditCard className="h-4 w-4 text-emerald-700" /> Credit / Debit Card (Online Gateway)
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      Pay safely via 3D-secure encrypted gateway.
                    </p>
                  </div>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Order Review & Confirmation */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-5 sticky top-28">
            <h3 className="font-serif text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Order Review
            </h3>

            {/* Items summary */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 max-w-[180px]">
                    <span className="font-bold text-emerald-800">{item.quantity}x</span>
                    <span className="truncate text-slate-800 font-medium">{item.name}</span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    {formatPrice(item.total_price || item.unit_price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 text-sm pt-4 border-t border-slate-100">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery</span>
                <span className="font-semibold text-slate-900">
                  {deliveryCharge === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : formatPrice(deliveryCharge)}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-3 border-t border-slate-100">
                <span>Total Payable</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {/* Order Notes */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Order Notes (Optional)</label>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                rows={2}
                placeholder="Any special remarks..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-lg transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Placing Order...</span>
                </>
              ) : (
                <span>Confirm & Place Order</span>
              )}
            </button>

            <p className="text-[11px] text-center text-slate-400">
              🔒 Safe & verified ordering. Your phone number is kept confidential.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
