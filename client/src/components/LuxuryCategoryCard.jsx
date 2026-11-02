import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, Droplets, FlaskConical, HeartPulse, 
  Eye, ShieldCheck, ArrowRight, Activity 
} from 'lucide-react';

const categoryMeta = {
  'mother-tinctures': {
    icon: Droplets,
    badge: '100% Botanical Extracts',
    desc: 'Unadulterated herbal mother tinctures prepared according to GHP standards.',
    gradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
    accentColor: 'text-emerald-700',
    iconBg: 'bg-emerald-600 text-white shadow-emerald-600/30'
  },
  'potentized-dilutions': {
    icon: FlaskConical,
    badge: 'Classical Potencies',
    desc: 'Decimal (X) and centesimal (C) serial dilutions in pure dispensing spirit.',
    gradient: 'from-teal-500/10 via-cyan-500/5 to-transparent',
    accentColor: 'text-teal-700',
    iconBg: 'bg-teal-600 text-white shadow-teal-600/30'
  },
  'biochemic-and-combinations': {
    icon: Sparkles,
    badge: 'Schuessler Tissue Salts',
    desc: '12 essential inorganic cellular mineral salts and combined bio-complexes.',
    gradient: 'from-amber-500/10 via-orange-500/5 to-transparent',
    accentColor: 'text-amber-700',
    iconBg: 'bg-amber-600 text-white shadow-amber-600/30'
  },
  'syrups-and-tonics': {
    icon: HeartPulse,
    badge: 'Restorative Health',
    desc: 'Nourishing herbal tonics with Ginseng, Alfalfa, and vital nutritive bases.',
    gradient: 'from-rose-500/10 via-amber-500/5 to-transparent',
    accentColor: 'text-rose-700',
    iconBg: 'bg-rose-600 text-white shadow-rose-600/30'
  },
  'specialty-drops': {
    icon: Eye,
    badge: 'Clinical Eye & Oral Drops',
    desc: 'Sterile Senecio Cineraria ophthalmic drops and targeted organic complexes.',
    gradient: 'from-blue-500/10 via-indigo-500/5 to-transparent',
    accentColor: 'text-blue-700',
    iconBg: 'bg-blue-600 text-white shadow-blue-600/30'
  },
  'ointments-and-topicals': {
    icon: ShieldCheck,
    badge: 'Herbal Dermal Care',
    desc: 'Non-greasy soothing Calendula ointments for natural cutaneous repair.',
    gradient: 'from-emerald-500/10 via-lime-500/5 to-transparent',
    accentColor: 'text-emerald-700',
    iconBg: 'bg-emerald-700 text-white shadow-emerald-700/30'
  }
};

export const LuxuryCategoryCard = ({ category }) => {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [spotlight, setSpotlight] = useState({ x: 0, y: 0, opacity: 0 });

  const meta = categoryMeta[category.slug] || {
    icon: Activity,
    badge: 'Verified Department',
    desc: category.description || 'Authentic certified homeopathic remedies.',
    gradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
    accentColor: 'text-emerald-700',
    iconBg: 'bg-emerald-600 text-white shadow-emerald-600/30'
  };

  const Icon = meta.icon;

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -9;
    const rotY = ((x - centerX) / centerX) * 9;

    setRotateX(rotX);
    setRotateY(rotY);
    setSpotlight({ x, y, opacity: 1 });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setSpotlight({ x: 0, y: 0, opacity: 0 });
  };

  return (
    <div
      style={{ perspective: 1000 }}
      className="h-full"
    >
      <Link
        to={`/shop?category=${category.slug}`}
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`,
          transition: 'transform 0.15s ease-out, box-shadow 0.3s ease'
        }}
        className="group relative flex flex-col justify-between h-full p-6 sm:p-7 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.06),0_20px_40px_-15px_rgba(16,185,129,0.08)] hover:shadow-[0_25px_50px_-12px_rgba(16,185,129,0.22),0_0_30px_rgba(52,211,153,0.15)] hover:border-emerald-300/80 transition-all duration-300 overflow-hidden"
      >
        {/* Dynamic 3D Mouse Spotlight */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: spotlight.opacity,
            background: `radial-gradient(circle 220px at ${spotlight.x}px ${spotlight.y}px, rgba(52, 211, 153, 0.18), transparent 75%)`
          }}
        />

        {/* Top ambient color wash */}
        <div className={`absolute top-0 right-0 w-36 h-36 bg-gradient-to-br ${meta.gradient} rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500`} />

        <div>
          {/* Header with Icon & Live Badge */}
          <div className="flex items-center justify-between mb-5">
            <div className={`h-14 w-14 rounded-2xl ${meta.iconBg} flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:-translate-y-1 transition duration-300`}>
              <Icon className="h-7 w-7" />
            </div>

            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-100/90 text-slate-600 border border-slate-200/80 group-hover:bg-emerald-50 group-hover:text-emerald-700 group-hover:border-emerald-200 transition">
              {category.product_count !== undefined ? `${category.product_count} Remedies` : 'Explore'}
            </span>
          </div>

          {/* Department Meta Badge */}
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1.5">
            {meta.badge}
          </span>

          {/* Category Title */}
          <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900 group-hover:text-emerald-800 transition leading-snug">
            {category.name}
          </h3>

          {/* Clinical description */}
          <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-2">
            {meta.desc}
          </p>
        </div>

        {/* Footer CTA */}
        <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
          <span>Explore Department</span>
          <div className="h-7 w-7 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center transform group-hover:translate-x-1.5 group-hover:bg-emerald-600 group-hover:text-white transition duration-300 shadow-sm">
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </Link>
    </div>
  );
};

export default LuxuryCategoryCard;
