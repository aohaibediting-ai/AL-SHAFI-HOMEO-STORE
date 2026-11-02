import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ShieldCheck, Heart, Clock, Truck } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export const Footer = () => {
  const { settings } = useSettings();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t-4 border-emerald-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Store Branding & Medical Disclaimer */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-serif font-black text-lg">
                AS
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-white leading-tight">
                  AL SHAFI
                </h4>
                <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                  HOMEO STORE
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              {settings.store_slogan || 'Under Clinical Guidance of Dr. Musab Maqsood'}. Providing authentic mother tinctures, classical dilutions, and natural wellness remedies.
            </p>
            <div className="rounded-xl bg-slate-800/80 p-3 border border-slate-700/60 text-xs text-slate-400 leading-relaxed mb-3">
              <strong className="text-emerald-400 block mb-0.5">Clinical Lead:</strong>
              Dr. Musab Maqsood (DHMS 4-Year Homeopathy Degree, 5+ Years Clinical & Healthcare Marketing Experience).
            </div>
            <div className="rounded-xl bg-slate-800/80 p-3 border border-slate-700/60 text-xs text-slate-400 leading-relaxed">
              <strong className="text-emerald-400 block mb-0.5">Medical Notice:</strong>
              Medicines are intended for classical homeopathic usage. Please consult a registered homeopathic practitioner for personalized advice.
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h5 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Quick Links
            </h5>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/shop" className="hover:text-emerald-400 transition">All Remedies & Products</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition">About Our Store</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-emerald-400 transition">Consultation & Contact</Link>
              </li>
              <li>
                <Link to="/track-order" className="hover:text-emerald-400 transition">Track Your Order</Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-emerald-400 transition">Frequently Asked Questions</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Policies */}
          <div>
            <h5 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Policies & Info
            </h5>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/shipping-policy" className="hover:text-emerald-400 transition">Shipping & Delivery Policy</Link>
              </li>
              <li>
                <Link to="/return-policy" className="hover:text-emerald-400 transition">Return & Refund Policy</Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-emerald-400 transition">Privacy & Data Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-emerald-400 transition">Terms & Conditions</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Hours */}
          <div>
            <h5 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Store Information
            </h5>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-emerald-500 mt-1 flex-shrink-0" />
                <span>{settings.store_address || 'Raja Bazar, Rawalpindi, Pakistan'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span>{settings.store_phone || '+92 348 5349232'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span>{settings.store_email || 'info@alshafihomeo.com'}</span>
              </div>
              <div className="flex items-start gap-2.5 pt-1">
                <Clock className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-slate-400">
                  {settings.store_pickup_hours || 'Mon - Sat: 9:00 AM - 9:00 PM'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} AL SHAFI HOMEO STORE. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Cash on Delivery</span>
            <span>•</span>
            <span>Bank Transfer</span>
            <span>•</span>
            <span>Store Pickup</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
