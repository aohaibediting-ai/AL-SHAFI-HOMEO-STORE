import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, ShieldCheck, Truck, Clock, Sparkles, 
  Award, CheckCircle2, HeartPulse, ChevronRight,
  GraduationCap, PhoneCall, MapPin, CalendarCheck, MessageSquare,
  FileCheck, ZoomIn, X, CheckCircle, ShieldPlus, Compass
} from 'lucide-react';
import api from '../api';
import ProductCard from '../components/ProductCard';
import LuxuryCategoryCard from '../components/LuxuryCategoryCard';
import Interactive3dBg from '../components/Interactive3dBg';
import { useSettings } from '../contexts/SettingsContext';

export const Home = () => {
  const { settings } = useSettings();
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [degreeModalOpen, setDegreeModalOpen] = useState(false);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [bannersRes, catRes, featuredRes, newRes, bestRes] = await Promise.all([
          api.get('/settings/banners'),
          api.get('/categories'),
          api.get('/products/featured'),
          api.get('/products/new-arrivals'),
          api.get('/products/best-sellers')
        ]);

        if (bannersRes.banners) setBanners(bannersRes.banners);
        if (catRes.categories) setCategories(catRes.categories);
        if (featuredRes.products) setFeaturedProducts(featuredRes.products);
        if (newRes.products) setNewArrivals(newRes.products);
        if (bestRes.products) setBestSellers(bestRes.products);
      } catch (err) {
        console.error('Failed to load home page content:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const activeBanner = banners[0] || {
    title: 'Natural Homeopathic Remedies for Your Whole Family',
    subtitle: 'Certified pure mother tinctures, classical dilutions & Dr. Schuessler biochemic tissue salts.',
    link: '/shop'
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section with Interactive 3D Molecular Background & Luxury Highlights */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-emerald-950 to-emerald-900 text-white py-20 sm:py-28">
        {/* Interactive 3D Canvas Background */}
        <Interactive3dBg intensity="hero" />

        {/* Subtle grid mesh */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold mb-6 shadow-lg backdrop-blur-md animate-float">
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span>Certified Classical Homeopathic Dispensary • Est. Rawalpindi</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                {activeBanner.title}
              </h1>

              <p className="mt-6 text-base sm:text-lg text-emerald-100/90 leading-relaxed max-w-xl">
                {activeBanner.subtitle}
              </p>

              {/* Luxury Buttons Row */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to={activeBanner.link || '/shop'}
                  className="btn-luxury-primary px-8 py-4 text-sm font-extrabold shadow-xl animate-shimmer"
                >
                  <span>Explore All Remedies</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>

                <a
                  href="https://wa.me/923485349232?text=Hello%20Dr.%20Musab%20Maqsood,%20I%20would%20like%20to%20consult%20regarding%20homeopathic%20treatment."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-luxury-gold px-6 py-4 text-sm font-black shadow-xl"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  <span>Consult Dr. Musab (+92 348 5349232)</span>
                </a>
              </div>

              {/* Quick Trust Highlights */}
              <div className="mt-10 pt-8 border-t border-emerald-800/60 flex flex-wrap items-center gap-6 text-xs text-emerald-200/80">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" /> 100% German Pharmacopoeia (GHP)
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-amber-400" /> Verified Gov. Registered Physician
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" /> Tamper-Proof Nationwide Shipping
                </span>
              </div>
            </div>

            {/* Right 3D Floating Glassmorphic Showcase */}
            <div className="lg:col-span-5 relative hidden lg:block">
              {/* Outer Glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-3xl blur-2xl transform rotate-3" />

              <div className="relative p-8 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl text-white space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-serif font-black text-xl shadow-lg">
                      AS
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-lg leading-tight">AL SHAFI DISPENSARY</h4>
                      <p className="text-[11px] text-emerald-300 font-semibold uppercase tracking-wider">Clinical Grade Remedies</p>
                    </div>
                  </div>
                  <span className="h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-between">
                    <span className="text-emerald-200">Director & Physician</span>
                    <strong className="text-white font-bold">Dr. Musab Maqsood (DHMS)</strong>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-between">
                    <span className="text-emerald-200">Govt Registration</span>
                    <strong className="text-amber-300 font-mono font-bold">NCH # 190530</strong>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-between">
                    <span className="text-emerald-200">Physical Clinic</span>
                    <strong className="text-white font-bold">Raja Bazar, Rawalpindi</strong>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-800/80 to-teal-900/80 border border-emerald-500/40 text-[11px] text-emerald-100/90 leading-relaxed">
                  🌿 <em>"Similia Similibus Curentur"</em> — Healing stimulated gently through potentized nature under certified medical supervision.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Guarantee Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-white shadow-md border border-slate-100">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">100% Authentic Quality</h4>
              <p className="text-xs text-slate-500 mt-0.5">Prepared to Pharmacopoeia standards</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 rounded-2xl bg-white shadow-md border border-slate-100">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Safe Nationwide Delivery</h4>
              <p className="text-xs text-slate-500 mt-0.5">Leak-proof bubble packaging</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 rounded-2xl bg-white shadow-md border border-slate-100">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Original Potencies</h4>
              <p className="text-xs text-slate-500 mt-0.5">Schwabe, Reckeweg & Local labs</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 rounded-2xl bg-white shadow-md border border-slate-100">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <HeartPulse className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Verified Formulations</h4>
              <p className="text-xs text-slate-500 mt-0.5">Carefully labeled ingredients</p>
            </div>
          </div>
        </div>
      </section>

      {/* $100,000 Luxury Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-black text-emerald-700 uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 inline-block mb-2">
              Pharmaceutical Departments
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Curated Dispensary Collections
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Precision dilutions, organic mother tinctures, and biochemic tissue salts cataloged by medicinal action.
            </p>
          </div>
          <Link 
            to="/shop" 
            className="btn-luxury-primary px-5 py-2.5 text-xs font-bold self-start md:self-auto flex items-center gap-1.5 shadow-md"
          >
            <span>Explore Full Catalog</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* 3D Interactive Tilt Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {categories.map((cat) => (
            <LuxuryCategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Handpicked Selection</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Featured Remedies
            </h2>
          </div>
          <Link to="/shop" className="text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
            <span>Explore All</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* Chief Doctor & Expert Consultation Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-8 sm:p-14 shadow-2xl border border-emerald-700/40">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Doctor Portrait / Badge Column */}
            <div className="lg:col-span-5 flex flex-col items-center text-center">
              <div className="relative">
                <div className="h-56 w-56 sm:h-64 sm:w-64 rounded-3xl overflow-hidden border-4 border-emerald-400/40 shadow-2xl bg-emerald-950">
                  <img
                    src="/uploads/dr-musab-maqsood.jpg"
                    alt="Dr. Musab Maqsood"
                    className="h-full w-full object-cover rounded-2xl"
                  />
                </div>
                <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 font-black text-xs px-4 py-1.5 rounded-full shadow-lg uppercase tracking-wider whitespace-nowrap">
                  Registered Homeopath
                </span>
              </div>

              <div className="mt-6">
                <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
                  Dr. Musab Maqsood
                </h3>
                <p className="text-emerald-300 text-sm font-semibold mt-1">
                  Consultant Homeopathic Physician & Medical Director
                </p>
                <div className="mt-2 flex items-center justify-center gap-2 text-xs text-emerald-100/80">
                  <MapPin className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>Raja Bazar, Rawalpindi, Pakistan</span>
                </div>
              </div>

              {/* Verified Degree Certificate Preview Card */}
              <div 
                onClick={() => setDegreeModalOpen(true)}
                className="mt-5 w-full max-w-xs p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-sm cursor-pointer transition transform hover:scale-[1.02] flex items-center gap-3 text-left shadow-lg"
              >
                <div className="h-14 w-11 rounded-lg overflow-hidden border border-emerald-400/50 bg-white flex-shrink-0 relative group">
                  <img 
                    src="/uploads/dr-musab-degree.jpg" 
                    alt="Degree Certificate" 
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-emerald-950/40 flex items-center justify-center">
                    <ZoomIn className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                    <CheckCircle className="h-3 w-3" /> Verified Degree
                  </div>
                  <p className="text-xs font-semibold text-white truncate">Govt of Pakistan Reg #190530</p>
                  <p className="text-[10px] text-emerald-200">Click to view official certificate</p>
                </div>
              </div>
            </div>

            {/* Doctor Credentials & Consultation Action */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-500/40 text-emerald-200 text-xs font-bold mb-3">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Certified Medical Practitioner</span>
                </span>
                <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white leading-tight">
                  Personalized Classical Homeopathy Consultations
                </h2>
                <p className="text-sm sm:text-base text-emerald-100/90 mt-3 leading-relaxed">
                  Under the clinical guidance of <strong>Dr. Musab Maqsood</strong>, AL SHAFI HOMEO STORE provides personalized constitutional remedy selection and verified pharmaceutical dispensing according to Hahnemannian principles.
                </p>
              </div>

              {/* Badges of Qualifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">4-Year Degree in Homeopathy</h4>
                    <p className="text-xs text-emerald-200/80 mt-0.5">DHMS • Rawal Homeopathic Medical College, Rawalpindi</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">5+ Years Clinical & Marketing</h4>
                    <p className="text-xs text-emerald-200/80 mt-0.5">Extensive patient care & remedy efficacy experience</p>
                  </div>
                </div>
              </div>

              {/* Registration Details Strip */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-200">
                  <FileCheck className="h-4 w-4 text-amber-400 flex-shrink-0" />
                  <span><strong>National Council for Homoeopathy</strong> (Registration # 190530 • Certificate # 38198)</span>
                </div>
                <button
                  onClick={() => setDegreeModalOpen(true)}
                  className="text-amber-300 hover:text-amber-200 font-bold underline flex items-center gap-1"
                >
                  <ZoomIn className="h-3.5 w-3.5" /> View Certificate
                </button>
              </div>

              {/* Clinic Timings & WhatsApp Action */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <a
                  href="https://wa.me/923485349232?text=Hello%20Dr.%20Musab%20Maqsood,%20I%20would%20like%20to%20consult%20regarding%20homeopathic%20treatment."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-luxury-gold px-8 py-4 text-sm font-black shadow-2xl animate-shimmer animate-pulse-glow"
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  <span>Consult via WhatsApp: +92 348 5349232</span>
                </a>

                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition hover:scale-[1.02] active:scale-95"
                >
                  <CalendarCheck className="h-4 w-4" />
                  <span>Clinic Details</span>
                </Link>
              </div>

              <div className="text-xs text-emerald-200/70 flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-emerald-400" />
                <span>Clinic Hours in Raja Bazar, Rawalpindi: Mon – Sat (10:00 AM – 9:00 PM)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promotional Notice Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-semibold mb-3">
              Promotional Offer
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold">
              Use Coupon <span className="text-amber-300">WELCOME10</span> for 10% Off
            </h3>
            <p className="mt-2 text-sm text-emerald-100">
              Apply code at checkout on your order of Rs. 1,000 or more. Valid on all homeopathic remedies, syrups, and tissue salts.
            </p>
          </div>
          <Link
            to="/shop"
            className="flex-shrink-0 px-6 py-3.5 rounded-2xl bg-white text-emerald-900 font-bold text-sm shadow hover:bg-emerald-50 transition"
          >
            Shop Now & Save
          </Link>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Fresh Stock</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                New Arrivals
              </h2>
            </div>
            <Link to="/shop?sort=newest" className="text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
              <span>View More</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {newArrivals.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* Official Degree & Registration Modal */}
      {degreeModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setDegreeModalOpen(false)}
        >
          <div 
            className="relative max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100 bg-slate-50">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest block">Official Verification</span>
                <h3 className="font-serif font-bold text-slate-900 text-base">Government of Pakistan — National Council for Homoeopathy</h3>
              </div>
              <button
                onClick={() => setDegreeModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 flex flex-col items-center">
              <div className="rounded-xl overflow-hidden shadow-md border border-slate-200 max-w-lg">
                <img
                  src="/uploads/dr-musab-degree.jpg"
                  alt="Dr. Musab Maqsood Certificate of Registration"
                  className="w-full h-auto object-contain"
                />
              </div>

              <div className="w-full max-w-lg mt-4 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-100 text-xs text-slate-700 space-y-1.5">
                <p><strong>Practitioner:</strong> Homoeopathic Doctor Musab Maqsood</p>
                <p><strong>Registration No:</strong> 190530 • <strong>Certificate No:</strong> 38198</p>
                <p><strong>Institution:</strong> Rawal Homoeopathic Medical College, Rawalpindi (DHMS)</p>
                <p><strong>Legal Authorization:</strong> Registered under Section 24(1) of the Unani, Ayurvedic and Homoeopathic Practitioners Act, 1965</p>
              </div>
            </div>

            <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <a
                href="/uploads/dr-musab-degree.jpg"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline"
              >
                Open High-Resolution Original ↗
              </a>
              <button
                onClick={() => setDegreeModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
