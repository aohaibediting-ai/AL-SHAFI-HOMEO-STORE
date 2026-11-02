import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Zap, ShieldCheck, Truck, AlertTriangle, 
  ChevronRight, Minus, Plus, CheckCircle, PackageCheck, Eye 
} from 'lucide-react';
import api from '../api';
import { useCart } from '../contexts/CartContext';
import { useSettings } from '../contexts/SettingsContext';
import ProductCard from '../components/ProductCard';

export const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { formatPrice } = useSettings();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [zoomModalOpen, setZoomModalOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${slug}`);
        if (res.product) {
          setProduct(res.product);
          setRelated(res.related || res.relatedProducts || []);
          setSelectedImage(0);
          setQuantity(1);
        }
      } catch (err) {
        console.error('Failed to load remedy details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="font-serif text-2xl font-bold text-slate-900">Remedy Not Found</h2>
        <p className="mt-2 text-slate-500">The product you are looking for is unavailable or has been removed.</p>
        <Link to="/shop" className="mt-6 inline-block px-6 py-2.5 rounded-xl bg-emerald-700 text-white font-semibold">
          Back to Shop
        </Link>
      </div>
    );
  }

  const isSale = product.sale_price !== null && product.sale_price !== undefined && product.sale_price < product.price;
  const currentPrice = isSale ? product.sale_price : product.price;
  const isOutOfStock = product.stock <= 0;
  const images = (product.images && product.images.length > 0) 
    ? product.images 
    : (product.image ? [{ id: 1, image_path: product.image }] : []);

  const handleBuyNow = () => {
    // Navigate straight to checkout with this single product item
    navigate('/checkout', {
      state: {
        buyNowItem: {
          product_id: product.id,
          quantity,
          name: product.name,
          sku: product.sku,
          price: currentPrice,
          image: images[0]?.image_path || null
        }
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-8 overflow-x-auto whitespace-nowrap">
        <Link to="/" className="hover:text-emerald-700">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/shop" className="hover:text-emerald-700">Shop</Link>
        {product.category_name && (
          <>
            <ChevronRight className="h-3 w-3" />
            <Link to={`/shop?category=${product.category_slug}`} className="hover:text-emerald-700">
              {product.category_name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-900 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Images Column */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-3xl bg-slate-50 border border-slate-200/80 overflow-hidden flex items-center justify-center group">
            {images[selectedImage]?.image_path ? (
              <img
                src={images[selectedImage].image_path}
                alt={product.name}
                className="h-full w-full object-cover object-center cursor-zoom-in transition-transform duration-300 group-hover:scale-105"
                onClick={() => setZoomModalOpen(true)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <div className="h-20 w-20 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-3">
                  <ShieldCheck className="h-10 w-10 text-emerald-600/70" />
                </div>
                <span className="font-serif font-bold text-slate-800">{product.name}</span>
                <span className="text-xs text-slate-500 mt-1">Authentic Dispensary Batch</span>
              </div>
            )}

            {images[selectedImage]?.image_path && (
              <button
                onClick={() => setZoomModalOpen(true)}
                className="absolute bottom-4 right-4 p-2.5 rounded-xl bg-white/90 backdrop-blur-sm text-slate-700 hover:text-emerald-700 shadow-md transition"
                title="Click to zoom"
              >
                <Eye className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative h-20 w-20 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition ${
                    selectedImage === idx ? 'border-emerald-600 shadow-sm' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.image_path} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Column */}
        <div className="flex flex-col">
          <div className="border-b border-slate-200 pb-6">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
              {product.category_name || 'Homeopathic Preparation'}
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-slate-900 mt-1.5 leading-tight">
              {product.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
              {product.sku && (
                <span>SKU: <strong className="text-slate-700">{product.sku}</strong></span>
              )}
              {product.manufacturer && (
                <span>Manufacturer: <strong className="text-slate-700">{product.manufacturer}</strong></span>
              )}
              {product.product_size && (
                <span>Size: <strong className="text-slate-700">{product.product_size}</strong></span>
              )}
            </div>

            {/* Price section */}
            <div className="mt-5 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-slate-900">
                {formatPrice(currentPrice)}
              </span>
              {isSale && (
                <span className="text-lg text-slate-400 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
              {isSale && (
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-xs font-bold uppercase">
                  Save {formatPrice(product.price - product.sale_price)}
                </span>
              )}
            </div>

            {/* Availability status */}
            <div className="mt-4 flex items-center gap-2">
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
                  <AlertTriangle className="h-3.5 w-3.5" /> Out of Stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  <CheckCircle className="h-3.5 w-3.5" /> In Stock ({product.stock} available)
                </span>
              )}
            </div>
          </div>

          {/* Quantity & Buy actions */}
          <div className="py-6 border-b border-slate-200 space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-slate-700">Quantity:</span>
              <div className="flex items-center rounded-xl border border-slate-300 bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="p-2.5 text-slate-600 hover:text-slate-900 disabled:opacity-30"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center text-sm font-bold text-slate-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock || isOutOfStock}
                  className="p-2.5 text-slate-600 hover:text-slate-900 disabled:opacity-30"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                type="button"
                onClick={() => addToCart(product.id, quantity)}
                disabled={isOutOfStock}
                className="flex-1 btn-luxury-primary px-6 py-4 text-sm font-extrabold shadow-xl animate-shimmer disabled:opacity-40 disabled:pointer-events-none"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                <span>Add to Cart</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="flex-1 btn-luxury-gold px-6 py-4 text-sm font-black shadow-xl disabled:opacity-40 disabled:pointer-events-none"
              >
                <Zap className="h-4 w-4 mr-2 fill-current" />
                <span>Buy Now with Express Checkout</span>
              </button>
            </div>
          </div>

          {/* Delivery & Security guarantee pill */}
          <div className="pt-6 grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <Truck className="h-5 w-5 text-emerald-700 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="text-xs font-bold text-slate-900">Careful Shipping</h5>
                <p className="text-[11px] text-slate-500 mt-0.5">Secure bottle seal & shock absorbing wrap</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <ShieldCheck className="h-5 w-5 text-emerald-700 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="text-xs font-bold text-slate-900">Original Formulation</h5>
                <p className="text-[11px] text-slate-500 mt-0.5">Authentic potency as described</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Information Tabs */}
      <div className="mt-16 border-t border-slate-200 pt-10">
        <div className="flex border-b border-slate-200 overflow-x-auto gap-8">
          {[
            { id: 'description', label: 'Description' },
            { id: 'ingredients', label: 'Ingredients & Composition' },
            { id: 'usage', label: 'Usage & Directions' },
            { id: 'storage', label: 'Storage & Warnings' },
            { id: 'delivery', label: 'Delivery Information' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-sm font-bold transition whitespace-nowrap border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-emerald-700 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="py-8 prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed">
          {activeTab === 'description' && (
            <div>
              <p className="whitespace-pre-line">{product.description || 'No detailed description available for this remedy.'}</p>
            </div>
          )}

          {activeTab === 'ingredients' && (
            <div>
              <h4 className="font-bold text-slate-900 mb-2">Medicinal Ingredients:</h4>
              <p className="whitespace-pre-line">{product.ingredients || 'Ingredients provided according to classical homeopathic formulation.'}</p>
            </div>
          )}

          {activeTab === 'usage' && (
            <div>
              <h4 className="font-bold text-slate-900 mb-2">Directions for Use:</h4>
              <p className="whitespace-pre-line">{product.usage_instructions || 'Take as advised by your registered homeopathic physician.'}</p>
            </div>
          )}

          {activeTab === 'storage' && (
            <div className="space-y-4">
              {product.storage_info && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Storage Instructions:</h4>
                  <p className="whitespace-pre-line">{product.storage_info}</p>
                </div>
              )}
              {product.warnings && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
                  <h4 className="font-bold mb-1 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" /> Important Safety Warnings:
                  </h4>
                  <p className="whitespace-pre-line text-xs">{product.warnings}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'delivery' && (
            <div>
              <p className="whitespace-pre-line">{product.delivery_info || 'Dispatched via trusted couriers in bubble wrap protective casing. Standard delivery is 2 to 4 business days.'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="mt-16 pt-12 border-t border-slate-200">
          <h2 className="font-serif text-2xl font-bold text-slate-900 mb-8">
            Related Remedies
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {related.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen Zoom Modal */}
      {zoomModalOpen && images[selectedImage]?.image_path && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setZoomModalOpen(false)}
        >
          <img
            src={images[selectedImage].image_path}
            alt={product.name}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl"
          />
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
