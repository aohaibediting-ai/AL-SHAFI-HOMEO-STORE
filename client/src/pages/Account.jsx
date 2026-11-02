import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { User, Package, MapPin, LogOut, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export const Account = () => {
  const { user, logout, updateProfile, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { name: name.trim(), phone: phone.trim() };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }
      await updateProfile(payload);
      toast.success('Profile details updated successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Account Sidebar Navigation */}
        <aside className="w-full md:w-64 space-y-2 flex-shrink-0">
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-800 font-bold text-lg flex items-center justify-center">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 text-sm truncate">{user?.name}</h3>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            {isAdmin && (
              <Link
                to="/admin"
                className="mt-4 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 hover:bg-emerald-100 transition"
              >
                <Shield className="h-3.5 w-3.5" />
                <span>Admin Panel</span>
              </Link>
            )}
          </div>

          <nav className="p-3 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-1">
            <NavLink
              to="/account"
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold transition ${
                  isActive ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              <User className="h-4 w-4" />
              <span>Personal Profile</span>
            </NavLink>

            <NavLink
              to="/account/orders"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold transition ${
                  isActive ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              <Package className="h-4 w-4" />
              <span>Order History</span>
            </NavLink>

            <NavLink
              to="/account/addresses"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold transition ${
                  isActive ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              <MapPin className="h-4 w-4" />
              <span>Delivery Addresses</span>
            </NavLink>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition text-left"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <div className="flex-1">
          <Outlet context={{ user, name, setName, phone, setPhone, currentPassword, setCurrentPassword, newPassword, setNewPassword, loading, handleUpdateProfile }} />
        </div>
      </div>
    </div>
  );
};

export const AccountProfile = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { name: name.trim(), phone: phone.trim() };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }
      await updateProfile(payload);
      toast.success('Profile updated successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="font-serif text-xl font-bold text-slate-900">Personal Profile Settings</h2>
        <p className="text-xs text-slate-500 mt-1">Manage your name, contact phone, and account security credentials.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
          <input
            type="email"
            disabled
            value={user?.email || ''}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Contact Phone (WhatsApp)</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Change Password</h4>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Leave empty if not changing password"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">New Password (min 8 chars)</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Profile Changes'}
        </button>
      </form>
    </div>
  );
};

export default Account;
