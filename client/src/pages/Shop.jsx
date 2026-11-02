import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Filter, X, Search, SlidersHorizontal, ChevronDown, 
  ArrowUpDown, Check, RefreshCw 
} from 'lucide-react';
import api from '../api';
import ProductCard from '../components/ProductCard';

export const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filters state from URL params
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const inStockOnly = searchParams.get('in_stock') === 'true';
  const manufacturer = searchParams.get('manufacturer') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Fetch categories and manufacturers once
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, mfgRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products/manufacturers')
        ]);
        if (catRes.categories) setCategories(catRes.categories);
        if (mfgRes.manufacturers) setManufacturers(mfgRes.manufacturers);
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch products whenever searchParams change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams(searchParams).toString();
        const res = await api.get(`/products?${query}`);
        if (res.products) {
          setProducts(res.products);
          setPagination(res.pagination || { page: 1, limit: 12, total: 0, totalPages: 1 });
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value !== null && value !== undefined && value !== '' && value !== false) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = Boolean(search || category || minPrice || maxPrice || inStockOnly || manufacturer);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-slate-200">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
            Homeopathic Remedies
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Showing {pagination.total} natural remedies and classical preparations
          </p>
        </div>

        {/* Sort & Mobile filter button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 bg-white"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
            )}
          </button>

          <div className="relative flex items-center">
            <span className="text-xs font-semibold text-slate-500 mr-2 hidden sm:inline">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="appearance-none bg-white border border-slate-200 text-slate-800 text-xs sm:text-sm font-semibold rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <span className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-emerald-700" /> Filters
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-semibold text-rose-600 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Search inside shop */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">Search Catalog</label>
            <input
              type="text"
              value={search}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="Filter by name or SKU..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Categories */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">Category</label>
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              <button
                onClick={() => updateFilter('category', '')}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  !category ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateFilter('category', cat.slug)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                    category === cat.slug ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  {cat.product_count !== undefined && (
                    <span className="text-[11px] text-slate-400">({cat.product_count})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">Price Range (PKR)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => updateFilter('min_price', e.target.value)}
                className="w-1/2 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-slate-400">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => updateFilter('max_price', e.target.value)}
                className="w-1/2 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* In Stock Only Toggle */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => updateFilter('in_stock', e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs font-semibold text-slate-700">In Stock Items Only</span>
            </label>
          </div>

          {/* Manufacturer filter */}
          {manufacturers.length > 0 && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Manufacturer / Brand</label>
              <select
                value={manufacturer}
                onChange={(e) => updateFilter('manufacturer', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Manufacturers</option>
                {manufacturers.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Product Grid Area */}
        <div className="lg:col-span-3">
          {/* Active filter tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {search && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Search: "{search}"
                  <button onClick={() => updateFilter('search', '')}><X className="h-3 w-3" /></button>
                </span>
              )}
              {category && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Category: {categories.find(c => c.slug === category)?.name || category}
                  <button onClick={() => updateFilter('category', '')}><X className="h-3 w-3" /></button>
                </span>
              )}
              {inStockOnly && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-emerald-50 text-emerald-800 border border-emerald-200">
                  In Stock Only
                  <button onClick={() => updateFilter('in_stock', false)}><X className="h-3 w-3" /></button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Price: Rs. {minPrice || '0'} - Rs. {maxPrice || '∞'}
                  <button onClick={() => { updateFilter('min_price', ''); updateFilter('max_price', ''); }}><X className="h-3 w-3" /></button>
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="text-xs text-rose-600 font-semibold hover:underline ml-2"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 h-80 flex flex-col justify-between">
                  <div className="bg-slate-100 rounded-xl aspect-square w-full" />
                  <div className="space-y-2 mt-4">
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-4 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16 px-4 rounded-3xl bg-white border border-slate-200/80 max-w-lg mx-auto">
              <div className="h-16 w-16 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-slate-900">No Remedies Found</h3>
              <p className="mt-2 text-sm text-slate-500">
                We couldn't find any remedies matching your selected filters or search terms.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 transition"
              >
                <RefreshCw className="h-4 w-4" />
                Reset All Filters
              </button>
            </div>
          ) : (
            /* Products Grid */
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination controls */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12 pt-8 border-t border-slate-200">
                  {[...Array(pagination.totalPages)].map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => updateFilter('page', pageNum)}
                        className={`h-10 w-10 rounded-xl text-sm font-bold transition ${
                          pagination.page === pageNum
                            ? 'bg-emerald-700 text-white shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
