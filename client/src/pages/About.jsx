import React, { useState } from 'react';
import { ShieldCheck, Award, GraduationCap, MapPin, Phone, MessageSquare, FileCheck, ZoomIn, X, CheckCircle } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export const About = () => {
  const { settings } = useSettings();
  const [degreeModalOpen, setDegreeModalOpen] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Our Heritage & Expertise</span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900 leading-tight">
          About AL SHAFI HOMEO STORE
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Dedicated to providing certified, genuine homeopathic remedies, dilutions, mother tinctures, and biochemic tissue salts under verified medical supervision.
        </p>
      </div>

      {/* Doctor Musab Maqsood Featured Profile Card */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-8 sm:p-10 shadow-xl border border-emerald-700/50">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="h-44 w-44 rounded-2xl overflow-hidden bg-emerald-950 border-4 border-emerald-400/40 p-1 flex-shrink-0 shadow-lg">
            <img
              src="/uploads/dr-musab-maqsood.jpg"
              alt="Dr. Musab Maqsood"
              className="h-full w-full object-cover rounded-xl"
            />
          </div>
          <div className="space-y-4 text-center sm:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
              <Award className="h-3.5 w-3.5 text-emerald-400" />
              <span>Head Consultant & Dispensary Director</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
              Dr. Musab Maqsood
            </h2>
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start text-xs font-medium text-emerald-200">
              <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                <GraduationCap className="h-3.5 w-3.5 text-emerald-300" />
                4-Year Degree (DHMS) • Rawal College Rawalpindi
              </span>
              <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                <Award className="h-3.5 w-3.5 text-amber-300" />
                5+ Years Marketing & Clinical Practice
              </span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Dr. Musab Maqsood oversees clinical prescription safety, mother tincture purity, and patient consultations at our physical clinic located in Raja Bazar, Rawalpindi.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4 justify-center sm:justify-start">
              <a
                href="https://wa.me/923485349232?text=Hello%20Dr.%20Musab%20Maqsood,%20I%20would%20like%20to%20consult%20regarding%20homeopathic%20treatment."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition"
              >
                <MessageSquare className="h-4 w-4" />
                <span>WhatsApp: +92 348 5349232</span>
              </a>
              <span className="flex items-center gap-1 text-xs text-emerald-200/80">
                <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                Raja Bazar, Rawalpindi, Pakistan
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Official Medical Degree & Registration Certificate Showcase */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/80 shadow-md">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div 
            onClick={() => setDegreeModalOpen(true)}
            className="w-full md:w-56 flex-shrink-0 cursor-pointer group relative rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-lg bg-slate-50"
          >
            <img
              src="/uploads/dr-musab-degree.jpg"
              alt="Government Certificate of Registration - Dr. Musab Maqsood"
              className="w-full h-auto object-cover group-hover:scale-105 transition duration-300"
            />
            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-1">
              <ZoomIn className="h-5 w-5" /> Click to Enlarge
            </div>
            <div className="p-2 bg-emerald-900 text-white text-[11px] text-center font-bold">
              Official Registration Certificate
            </div>
          </div>

          <div className="space-y-4 flex-1 text-slate-700">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
              <span>Government Registered Medical Practitioner</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-slate-900">
              National Council for Homoeopathy Registration
            </h3>
            <p className="text-sm leading-relaxed text-slate-600">
              Dr. Musab Maqsood is a licensed Homoeopathic Medical Practitioner registered with the <strong>National Council for Homoeopathy, Government of Pakistan</strong> under Section 24(1) of the Unani, Ayurvedic and Homoeopathic Practitioners Act, 1965.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block font-semibold">Registration Number</span>
                <span className="font-bold text-slate-900 text-sm">190530</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block font-semibold">Certificate Number</span>
                <span className="font-bold text-slate-900 text-sm">38198</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 sm:col-span-2">
                <span className="text-slate-400 block font-semibold">Degree Qualification</span>
                <span className="font-bold text-slate-900 text-sm">Rawal Homoeopathic Medical College, Rawalpindi (DHMS)</span>
              </div>
            </div>
            <button
              onClick={() => setDegreeModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-sm"
            >
              <ZoomIn className="h-4 w-4" />
              <span>Inspect Full Certificate</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed">
        <h3 className="font-serif text-xl font-bold text-slate-900">Our Dispensary Mission</h3>
        <p>
          At <strong>AL SHAFI HOMEO STORE</strong>, our philosophy is anchored in classical homeopathy principles established by Dr. Samuel Hahnemann. We believe in gentle, holistic healing that supports the body's innate vital force without harsh side effects.
        </p>
        <p>
          We source all our botanical mother tinctures and potentized preparations directly from certified manufacturers including Dr. Willmar Schwabe Germany, Dr. Reckeweg, and trusted local certified labs adhering to the Homeopathic Pharmacopoeia of the United States (HPUS) and German Homeopathic Pharmacopoeia (GHP).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          <div className="flex gap-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Authentic Potencies</h4>
              <p className="text-xs text-slate-500 mt-1">
                Every decimal (X) and centesimal (C) dilution is preserved in high-purity neutral dispensing alcohol.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Integrity & Transparency</h4>
              <p className="text-xs text-slate-500 mt-1">
                We clearly disclose all botanical ingredients, sizes, and manufacturer origins.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Degree Modal */}
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

export default About;
