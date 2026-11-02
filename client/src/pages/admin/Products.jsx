import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Edit2, Copy, Trash2, ExternalLink, 
  AlertTriangle, Star, CheckCircle2 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';
import { useSettings } from '../../contexts/SettingsContext';
import StatusBadge from '../../components/StatusBadge';

export const AdminProducts = () => {
  const { formatPrice } = useSettings();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page,
        limit: 20,
        ...(search && { search }),
        ...(categoryId && { category_id: categoryId }),
        ...(status && { status })
      }).toString();

      const [prodRes, catRes] = await Promise.all([
        api.get(`/admin/products?${query}`),
        api.get('/categories')
      ]);

      if (prodRes.products) {
        setProducts(prodRes.products);
        setPagination(prodRes.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
      }
      if (catRes.categories) setCategories(catRes.categories);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, categoryId, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await api.post(`/admin/products/${id}/duplicate`);
      toast.success('Product duplicated as draft');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to duplicate product');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}"?`)) return;
    try {
      await api.delete(`/admin/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">Products Catalog</h1>
          <p className="text-xs text-slate-500 mt-1">Manage homeopathic dilutions, mother tinctures, pricing, and stock.</p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, SKU..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={categoryId}
            onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-600 border-t-transparent mx-auto" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No products found matching filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-2">Image</th>
                  <th className="py-3 px-2">Product Details</th>
                  <th className="py-3 px-2">Category</th>
                  <th className="py-3 px-2">Price</th>
                  <th className="py-3 px-2">Stock</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-2">
                      <div className="h-11 w-11 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                        {p.primary_image || p.image ? (
                          <img src={p.primary_image || p.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[9px] text-slate-400">
                            N/A
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <span>{p.name}</span>
                        {p.is_featured === 1 && (
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" title="Featured Remedy" />
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">SKU: {p.sku || 'N/A'}</span>
                      {p.manufacturer && (
                        <span className="text-[11px] text-slate-500 block">Mfg: {p.manufacturer}</span>
                      )}
                    </td>
                    <td className="py-3 px-2 font-semibold text-slate-600">
                      {p.category_name || 'Unassigned'}
                    </td>
                    <td className="py-3 px-2">
                      <span className="font-bold text-slate-900 block">
                        {formatPrice(p.sale_price || p.price)}
                      </span>
                      {p.sale_price && (
                        <span className="text-[10px] text-slate-400 line-through">
                          {formatPrice(p.price)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        p.stock === 0
                          ? 'bg-rose-100 text-rose-800'
                          : (p.stock <= p.low_stock_threshold ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800')
                      }`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <StatusBadge status={p.status} type="product" />
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/shop/${p.slug}`}
                          target="_blank"
                          className="p-1.5 text-slate-400 hover:text-slate-700"
                          title="View on store"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/admin/products/${p.id}/edit`}
                          className="p-1.5 text-slate-600 hover:text-emerald-700"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDuplicate(p.id)}
                          className="p-1.5 text-slate-600 hover:text-blue-700"
                          title="Duplicate"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-6 mt-4 border-t border-slate-100 text-xs">
            <span className="text-slate-500">
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} products)
            </span>
            <div className="flex gap-1.5">
              {[...Array(pagination.totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`h-8 w-8 rounded-lg font-bold ${
                    page === i + 1 ? 'bg-emerald-700 text-white' : 'border border-slate-200 text-slate-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
