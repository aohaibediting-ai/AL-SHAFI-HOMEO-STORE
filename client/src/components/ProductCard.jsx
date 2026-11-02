import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, Check, AlertCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useSettings } from '../contexts/SettingsContext';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { formatPrice } = useSettings();

  if (!product) return null;

  const isSale = product.sale_price !== null && product.sale_price !== undefined && product.sale_price < product.price;
  const currentPrice = isSale ? product.sale_price : product.price;
  const isOutOfStock = product.stock <= 0;

  const imageSrc = product.image || product.primary_image || (product.images && product.images[0]?.image_path) || null;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-md transition-all duration-300 hover:shadow-[0_20px_45px_-12px_rgba(16,185,129,0.22)] hover:border-emerald-300 hover:-translate-y-1.5">
      {/* Badges */}
      <div className="absolute top-3.5 left-3.5 z-10 flex flex-col gap-1.5">
        {isSale && (
          <span className="rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-md shadow-emerald-700/20">
            Sale
          </span>
        )}
        {product.is_featured === 1 && (
          <span className="rounded-full bg-amber-500 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-950 shadow-md shadow-amber-500/20 flex items-center gap-1">
            <Star className="h-3 w-3 fill-current" /> Featured
          </span>
        )}
      </div>

      {/* Stock badge */}
      {isOutOfStock && (
        <div className="absolute top-3.5 right-3.5 z-10">
          <span className="rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-[10px] font-bold text-rose-700 shadow-sm flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> Out of stock
          </span>
        </div>
      )}

      {/* Product Image */}
      <Link to={`/shop/${product.slug}`} className="relative block aspect-square w-full overflow-hidden bg-slate-50/70 p-4">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={product.name}
            className="h-full w-full object-contain object-center transition-transform duration-700 group-hover:scale-108 group-hover:rotate-1"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-emerald-50/60 to-slate-100 p-6 text-center text-slate-400">
            <div className="rounded-full bg-white p-4 shadow-sm border border-emerald-100/60 mb-2">
              <svg className="h-8 w-8 text-emerald-600/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <span className="text-xs font-medium text-emerald-800/80">AL SHAFI HOMEO</span>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="flex flex-1 flex-col p-5 sm:p-6 bg-gradient-to-b from-white/60 to-white">
        <div className="mb-1 text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
          {product.category_name || (product.manufacturer || 'Homeopathy Remedy')}
        </div>

        <Link to={`/shop/${product.slug}`} className="group-hover:text-emerald-700 transition">
          <h3 className="line-clamp-2 text-sm sm:text-base font-bold text-slate-900 leading-snug">
            {product.name}
          </h3>
        </Link>

        {product.product_size && (
          <p className="mt-1 text-xs text-slate-500 font-medium">{product.product_size}</p>
        )}

        <div className="mt-auto pt-5 flex items-center justify-between border-t border-slate-100/80">
          <div>
            <div className="text-base sm:text-lg font-black text-slate-900">
              {formatPrice(currentPrice)}
            </div>
            {isSale && (
              <div className="text-xs text-slate-400 line-through">
                {formatPrice(product.price)}
              </div>
            )}
          </div>

          <button
            onClick={() => addToCart(product.id, 1)}
            disabled={isOutOfStock}
            className={`btn-luxury-primary px-4 py-2.5 text-xs font-bold shadow-md animate-shimmer ${
              isOutOfStock
                ? 'opacity-40 cursor-not-allowed pointer-events-none'
                : ''
            }`}
            title={isOutOfStock ? 'Currently out of stock' : 'Add to cart'}
          >
            <ShoppingBag className="h-4 w-4 mr-1.5" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
