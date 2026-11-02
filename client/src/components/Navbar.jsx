import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, User, Search, Menu, X, Shield, Phone, 
  MapPin, ChevronDown, LogOut, Package, LayoutDashboard 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useSettings } from '../contexts/SettingsContext';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-sm border-b border-slate-100">
      {/* Top Banner Bar */}
      <div className="bg-emerald-800 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span>{settings.store_phone || '+92 348 5349232'}</span>
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{settings.store_address || 'Raja Bazar, Rawalpindi, Pakistan'}</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-emerald-200">
              Free delivery on orders above Rs. {settings.free_delivery_threshold || '3000'}
            </span>
            <Link to="/track-order" className="hover:underline text-emerald-100 font-medium">
              Track Order
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
              <span className="font-serif font-black text-xl">AS</span>
            </div>
            <div>
              <span className="font-serif font-extrabold text-lg sm:text-xl text-emerald-950 tracking-tight leading-none block">
                AL SHAFI
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-widest block leading-none mt-0.5">
                HOMEO STORE
              </span>
            </div>
          </Link>

          {/* Search bar (Desktop) */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search homeopathic medicines, potencies, remedies..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full text-xs font-semibold transition"
            >
              Search
            </button>
          </form>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-700">
            <Link to="/" className="hover:text-emerald-700 transition">Home</Link>
            <Link to="/shop" className="hover:text-emerald-700 transition">Shop Remedies</Link>
            <Link to="/about" className="hover:text-emerald-700 transition">About Us</Link>
            <Link to="/contact" className="hover:text-emerald-700 transition">Contact</Link>
          </nav>

          {/* Actions: Cart & User */}
          <div className="flex items-center gap-3">
            {/* Cart Link */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-full text-slate-700 hover:bg-slate-100 transition flex items-center"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shadow">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-full border border-slate-200 text-slate-700 hover:border-emerald-300 transition text-sm"
                >
                  <div className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:inline font-medium max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-500">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-900 truncate">{user.email}</p>
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-emerald-700 hover:bg-emerald-50 font-semibold"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      to="/account"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <User className="h-4 w-4 text-slate-400" />
                      My Account
                    </Link>

                    <Link
                      to="/account/orders"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Package className="h-4 w-4 text-slate-400" />
                      My Orders
                    </Link>

                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 text-left border-t border-slate-100 mt-1"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-emerald-800 hover:text-emerald-950 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-flex px-4 py-2 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold shadow-sm transition"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search medicines, remedies..."
              className="w-full pl-9 pr-16 py-2 rounded-full border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <button
              type="submit"
              className="absolute right-1 top-1 px-3 py-1 bg-emerald-700 text-white rounded-full text-xs font-semibold"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 py-6 space-y-4 shadow-xl">
          <nav className="flex flex-col space-y-3 font-medium text-slate-800">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-emerald-700">Home</Link>
            <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-emerald-700">Shop Remedies</Link>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-emerald-700">About Us</Link>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-emerald-700">Contact</Link>
            <Link to="/track-order" onClick={() => setMobileMenuOpen(false)} className="py-2 text-emerald-700 font-semibold">Track Order</Link>
            {isAdmin && (
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="py-2 text-emerald-800 font-bold bg-emerald-50 px-3 rounded-xl">
                Admin Panel
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
