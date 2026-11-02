import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

export const AccountAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New address state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [landmark, setLandmark] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/customer/addresses');
      if (res.addresses) setAddresses(res.addresses);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/customer/addresses', {
        name,
        phone,
        city,
        area,
        street,
        house_number: houseNumber,
        landmark,
        is_default: isDefault ? 1 : 0
      });
      toast.success('Address saved successfully');
      setShowAddModal(false);
      // Reset form
      setName('');
      setPhone('');
      setCity('');
      setArea('');
      setStreet('');
      setHouseNumber('');
      setLandmark('');
      setIsDefault(false);
      fetchAddresses();
    } catch (err) {
      toast.error(err.message || 'Failed to add address');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this saved address?')) return;
    try {
      await api.delete(`/customer/addresses/${id}`);
      toast.success('Address deleted');
      fetchAddresses();
    } catch (err) {
      toast.error(err.message || 'Failed to delete address');
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-600 border-t-transparent mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="font-serif text-lg font-bold text-slate-900">Saved Delivery Addresses</h2>
          <p className="text-xs text-slate-500">Speed up checkout by saving your frequent delivery locations.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow hover:bg-emerald-800 transition"
        >
          <Plus className="h-4 w-4" /> Add New Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="p-10 text-center rounded-3xl bg-white border border-slate-200/80">
          <MapPin className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500">No saved addresses yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-5 rounded-3xl bg-white border transition relative ${
                addr.is_default ? 'border-emerald-500 shadow-xs ring-1 ring-emerald-500' : 'border-slate-200/80'
              }`}
            >
              {addr.is_default === 1 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full mb-2">
                  <CheckCircle2 className="h-3 w-3" /> Default Address
                </span>
              )}
              <h4 className="font-bold text-slate-900 text-sm">{addr.name}</h4>
              <p className="text-xs text-slate-600 mt-0.5">{addr.phone}</p>
              <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                {addr.house_number && `${addr.house_number}, `}
                {addr.street && `${addr.street}, `}
                {addr.area && `${addr.area}, `}
                <strong className="text-slate-900">{addr.city}</strong>
              </p>
              {addr.landmark && (
                <p className="text-[11px] text-slate-400 mt-1">Landmark: {addr.landmark}</p>
              )}

              <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Address Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-xl">
            <h3 className="font-serif text-lg font-bold text-slate-900">Add New Delivery Address</h3>

            <form onSubmit={handleCreateAddress} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Receiver Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Area / Town</label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">House #</label>
                  <input
                    type="text"
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Landmark</label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-semibold text-slate-700">Set as my default shipping address</span>
              </label>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow hover:bg-emerald-800 transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountAddresses;
