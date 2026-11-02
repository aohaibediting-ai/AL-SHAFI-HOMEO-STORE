import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Settings as SettingsIcon, Truck, CreditCard, 
  Image as ImageIcon, Save, Plus, Trash2, CheckCircle2 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';
import { useSettings } from '../../contexts/SettingsContext';

export const AdminSettings = () => {
  const [searchParams] = useSearchParams();
  const { refreshSettings } = useSettings();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({});
  // Banners state
  const [banners, setBanners] = useState([]);
  const [showAddBannerModal, setShowAddBannerModal] = useState(false);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerLink, setBannerLink] = useState('/shop');
  const [bannerImage, setBannerImage] = useState(null);
  const [savingBanner, setSavingBanner] = useState(false);

  const fetchSettingsAndBanners = async () => {
    try {
      const [setRes, banRes] = await Promise.all([
        api.get('/admin/settings'),
        api.get('/admin/settings/banners')
      ]);
      if (setRes.settings) setSettings(setRes.settings);
      if (banRes.banners) setBanners(banRes.banners);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load store settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsAndBanners();
  }, []);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/admin/settings', { settings });
      toast.success('Store settings saved successfully!');
      refreshSettings();
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateBanner = async (e) => {
    e.preventDefault();
    setSavingBanner(true);
    try {
      const formData = new FormData();
      formData.append('title', bannerTitle.trim());
      formData.append('subtitle', bannerSubtitle.trim());
      formData.append('link', bannerLink.trim());
      if (bannerImage) formData.append('image', bannerImage);

      await api.post('/admin/settings/banners', formData);
      toast.success('Banner added');
      setShowAddBannerModal(false);
      setBannerTitle('');
      setBannerSubtitle('');
      setBannerImage(null);
      fetchSettingsAndBanners();
    } catch (err) {
      toast.error('Failed to create banner');
    } finally {
      setSavingBanner(false);
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm('Delete this banner?')) return;
    try {
      await api.delete(`/admin/settings/banners/${id}`);
      toast.success('Banner deleted');
      fetchSettingsAndBanners();
    } catch (err) {
      toast.error('Failed to delete banner');
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
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">Store Settings & Branding</h1>
          <p className="text-xs text-slate-500 mt-1">Configure business credentials, delivery charges, bank accounts, and banners.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-6">
        {[
          { id: 'general', label: 'General & Branding', icon: SettingsIcon },
          { id: 'delivery', label: 'Delivery & Shipping', icon: Truck },
          { id: 'payments', label: 'Payment Methods & Banking', icon: CreditCard },
          { id: 'banners', label: 'Promotional Banners', icon: ImageIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 text-xs font-bold transition whitespace-nowrap border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: General & Branding */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveSettings} className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Store / Website Name</label>
              <input
                type="text"
                value={settings.store_name || ''}
                onChange={(e) => handleChange('store_name', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Tagline / Slogan</label>
              <input
                type="text"
                value={settings.store_slogan || ''}
                onChange={(e) => handleChange('store_slogan', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Contact Phone (WhatsApp)</label>
              <input
                type="text"
                value={settings.store_phone || ''}
                onChange={(e) => handleChange('store_phone', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Support Email</label>
              <input
                type="email"
                value={settings.store_email || ''}
                onChange={(e) => handleChange('store_email', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">Physical Dispensary Address</label>
              <input
                type="text"
                value={settings.store_address || ''}
                onChange={(e) => handleChange('store_address', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Currency Code</label>
              <input
                type="text"
                value={settings.currency || 'PKR'}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Currency Symbol</label>
              <input
                type="text"
                value={settings.currency_symbol || 'Rs.'}
                onChange={(e) => handleChange('currency_symbol', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs shadow hover:bg-emerald-800 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save General Settings'}
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Delivery */}
      {activeTab === 'delivery' && (
        <form onSubmit={handleSaveSettings} className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Standard Delivery Fee (PKR)</label>
              <input
                type="number"
                value={settings.delivery_charge || '200'}
                onChange={(e) => handleChange('delivery_charge', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Free Delivery Threshold (PKR)</label>
              <input
                type="number"
                value={settings.free_delivery_threshold || '3000'}
                onChange={(e) => handleChange('free_delivery_threshold', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-emerald-700"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Minimum Order Amount (PKR)</label>
              <input
                type="number"
                value={settings.min_order_amount || '0'}
                onChange={(e) => handleChange('min_order_amount', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs shadow hover:bg-emerald-800 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Delivery Settings'}
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Payment Methods & Banking */}
      {activeTab === 'payments' && (
        <form onSubmit={handleSaveSettings} className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
          <div className="space-y-4">
            {/* COD */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-sm font-bold text-slate-900 block">Cash on Delivery (COD)</span>
                <span className="text-xs text-slate-500">Allow customers to pay the courier upon package arrival</span>
              </div>
              <input
                type="checkbox"
                checked={settings.enable_cod === 'true'}
                onChange={(e) => handleChange('enable_cod', e.target.checked ? 'true' : 'false')}
                className="h-5 w-5 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </div>

            {/* Bank Transfer */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-slate-900 block">Direct Bank Transfer / EasyPaisa / JazzCash</span>
                  <span className="text-xs text-slate-500">Manual bank payment with customer receipt upload workflow</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enable_bank_transfer === 'true'}
                  onChange={(e) => handleChange('enable_bank_transfer', e.target.checked ? 'true' : 'false')}
                  className="h-5 w-5 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Bank Account & Transfer Instructions (Visible to Customer):
                </label>
                <textarea
                  rows={4}
                  value={settings.bank_details || ''}
                  onChange={(e) => handleChange('bank_details', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-white"
                />
              </div>
            </div>

            {/* Store Pickup */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-slate-900 block">In-Store Pickup</span>
                  <span className="text-xs text-slate-500">Allow local customers to collect medicines at the pharmacy</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enable_store_pickup === 'true'}
                  onChange={(e) => handleChange('enable_store_pickup', e.target.checked ? 'true' : 'false')}
                  className="h-5 w-5 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Dispensary Pickup Location</label>
                  <input
                    type="text"
                    value={settings.store_pickup_address || ''}
                    onChange={(e) => handleChange('store_pickup_address', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Dispensary Working Hours</label>
                  <input
                    type="text"
                    value={settings.store_pickup_hours || ''}
                    onChange={(e) => handleChange('store_pickup_hours', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs shadow hover:bg-emerald-800 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Payment Settings'}
            </button>
          </div>
        </form>
      )}

      {/* Tab 4: Promotional Banners */}
      {activeTab === 'banners' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddBannerModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow"
            >
              <Plus className="h-4 w-4" /> Add Promotional Banner
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map((ban) => (
              <div key={ban.id} className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                {ban.image && (
                  <div className="h-32 w-full rounded-2xl overflow-hidden bg-slate-100">
                    <img src={ban.image} alt="" className="h-full w-full object-cover" />
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{ban.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{ban.subtitle}</p>
                  <span className="text-[10px] text-emerald-700 font-mono mt-1 block">Link: {ban.link}</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => handleDeleteBanner(ban.id)}
                    className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add banner modal */}
          {showAddBannerModal && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-xl">
                <h3 className="font-serif text-lg font-bold text-slate-900">Add Promotional Banner</h3>
                <form onSubmit={handleCreateBanner} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Banner Title *</label>
                    <input
                      type="text"
                      required
                      value={bannerTitle}
                      onChange={(e) => setBannerTitle(e.target.value)}
                      placeholder="e.g. Free Delivery on Orders Over Rs. 3,000"
                      className="w-full p-2.5 text-xs border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={bannerSubtitle}
                      onChange={(e) => setBannerSubtitle(e.target.value)}
                      placeholder="Brief description..."
                      className="w-full p-2.5 text-xs border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Link Target</label>
                    <input
                      type="text"
                      value={bannerLink}
                      onChange={(e) => setBannerLink(e.target.value)}
                      placeholder="/shop"
                      className="w-full p-2.5 text-xs border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Banner Image (Optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setBannerImage(e.target.files[0])}
                      className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-slate-100"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddBannerModal(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingBanner}
                      className="px-5 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow hover:bg-emerald-800 transition disabled:opacity-50"
                    >
                      {savingBanner ? 'Saving...' : 'Add Banner'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
