import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSettings } from '../contexts/SettingsContext';

export const Contact = () => {
  const { settings } = useSettings();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    toast.success('Your message has been received! Our dispensary staff will get back to you.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Get in Touch</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mt-1">
          Contact Our Dispensary
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Have inquiries regarding specific potencies, dosages, or delivery? Reach out to us.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Info Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 text-white space-y-8 flex flex-col justify-between shadow-xl">
          <div className="space-y-6">
            <h3 className="font-serif text-2xl font-bold text-white">Dispensary Contact Details</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              We welcome patient queries, prescription verifications, and custom potency orders.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Store & Clinic Address</h4>
                  <p className="text-sm font-semibold text-white mt-0.5">{settings.store_address || 'Raja Bazar, Rawalpindi, Pakistan'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Telephone / WhatsApp</h4>
                  <p className="text-sm font-semibold text-white mt-0.5">{settings.store_phone || '+92 348 5349232'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Inquiries</h4>
                  <p className="text-sm font-semibold text-white mt-0.5">{settings.store_email || 'info@alshafihomeo.com'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Opening Hours</h4>
                  <p className="text-sm font-semibold text-white mt-0.5">{settings.store_pickup_hours || 'Mon - Sat: 9:00 AM - 9:00 PM'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 space-y-2">
            <p className="font-semibold text-emerald-400">🩺 Clinical Consultations with Dr. Musab Maqsood</p>
            <p className="text-slate-400">DHMS (4-Year Degree in Homeopathy) • 5+ Years Marketing & Clinical Practice</p>
            <a
              href="https://wa.me/923485349232?text=Hello%20Dr.%20Musab%20Maqsood,%20I%20would%20like%20to%20book%20a%20consultation."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200 font-bold underline"
            >
              Direct WhatsApp Appointment (+92 348 5349232) →
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/80 shadow-md">
          {sent ? (
            <div className="text-center py-12 space-y-4">
              <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
              <h3 className="font-serif text-2xl font-bold text-slate-900">Message Received</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">
                Thank you for contacting AL SHAFI HOMEO STORE. Our certified homoeopaths will respond shortly.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-4 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-serif text-xl font-bold text-slate-900 mb-4">Send a Message</h3>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Muhammad Ali"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number (WhatsApp) *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0300 1234567"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Message or Remedy Requirement *</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please specify remedies or general questions..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow transition flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" />
                <span>Send Inquiries</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
