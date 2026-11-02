import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload, X, Trash2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';

export const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [productSize, setProductSize] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [stock, setStock] = useState('0');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [status, setStatus] = useState('published'); // 'draft', 'published', 'unavailable'
  const [isFeatured, setIsFeatured] = useState(false);
  const [usageInstructions, setUsageInstructions] = useState('');
  const [storageInfo, setStorageInfo] = useState('');
  const [warnings, setWarnings] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState('');

  // Image management
  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  useEffect(() => {
    // Load categories
    api.get('/categories').then(res => {
      if (res.categories) setCategories(res.categories);
    }).catch(err => console.error(err));

    if (isEdit) {
      api.get(`/admin/products/${id}`)
        .then(res => {
          if (res.product) {
            const p = res.product;
            setName(p.name || '');
            setSku(p.sku || '');
            setBarcode(p.barcode || '');
            setDescription(p.description || '');
            setIngredients(p.ingredients || '');
            setManufacturer(p.manufacturer || '');
            setProductSize(p.product_size || '');
            setCategoryId(p.category_id || '');
            setPrice(p.price || '');
            setSalePrice(p.sale_price !== null && p.sale_price !== undefined ? p.sale_price : '');
            setStock(String(p.stock !== undefined ? p.stock : 0));
            setLowStockThreshold(String(p.low_stock_threshold || 5));
            setStatus(p.status || 'published');
            setIsFeatured(Boolean(p.is_featured));
            setUsageInstructions(p.usage_instructions || '');
            setStorageInfo(p.storage_info || '');
            setWarnings(p.warnings || '');
            setDeliveryInfo(p.delivery_info || '');
          }
          if (res.images) {
            setExistingImages(res.images);
          }
        })
        .catch(err => {
          console.error(err);
          toast.error('Failed to load product details');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleImageFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setNewImageFiles(prev => [...prev, ...files]);
    const previews = files.map(f => URL.createObjectURL(f));
    setNewImagePreviews(prev => [...prev, ...previews]);
  };

  const removeNewImage = (index) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingImage = async (imageId) => {
    if (!window.confirm('Delete this image permanently?')) return;
    try {
      await api.delete(`/admin/products/${id}/images/${imageId}`);
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
      toast.success('Image deleted');
    } catch (err) {
      toast.error('Failed to delete image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !price) {
      toast.error('Product name and regular price are required');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('sku', sku.trim());
      formData.append('barcode', barcode.trim());
      formData.append('description', description.trim());
      formData.append('ingredients', ingredients.trim());
      formData.append('manufacturer', manufacturer.trim());
      formData.append('product_size', productSize.trim());
      formData.append('category_id', categoryId || '');
      formData.append('price', price);
      formData.append('sale_price', salePrice !== '' ? salePrice : '');
      formData.append('stock', stock);
      formData.append('low_stock_threshold', lowStockThreshold);
      formData.append('status', status);
      formData.append('is_featured', isFeatured ? '1' : '0');
      formData.append('usage_instructions', usageInstructions.trim());
      formData.append('storage_info', storageInfo.trim());
      formData.append('warnings', warnings.trim());
      formData.append('delivery_info', deliveryInfo.trim());

      newImageFiles.forEach(file => {
        formData.append('images', file);
      });

      if (isEdit) {
        await api.put(`/admin/products/${id}`, formData);
        toast.success('Product updated successfully!');
      } else {
        await api.post('/admin/products', formData);
        toast.success('Product created and published!');
      }
      navigate('/admin/products');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-600 border-t-transparent mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <div className="flex items-center justify-between">
        <Link to="/admin/products" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </Link>
        <span className="text-xs font-bold text-slate-400">
          {isEdit ? `Editing #${id}` : 'New Product Entry'}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            {isEdit ? 'Edit Remedy' : 'Add New Homeopathic Remedy'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Specify verified potencies, pharmaceutical ingredients, dosage guidance, and stock levels.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Information */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-serif text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            1. Core Product Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">Product / Remedy Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Arnica Montana 30C Dilution"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="">Select Category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Manufacturer / Brand</label>
              <input
                type="text"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="e.g. Dr. Willmar Schwabe Germany"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">SKU (Stock Keeping Unit)</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                placeholder="Auto-generated if left blank"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Product Size / Packaging</label>
              <input
                type="text"
                value={productSize}
                onChange={(e) => setProductSize(e.target.value)}
                placeholder="e.g. 30ml Bottle, 20g Tablets"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Pricing & Inventory */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-serif text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            2. Pricing & Inventory Management
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Regular Price (PKR) *</label>
              <input
                type="number"
                required
                min="0"
                step="any"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="650"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Sale Price (Optional)</label>
              <input
                type="number"
                min="0"
                step="any"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="e.g. 580"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Stock Quantity</label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Low Stock Alert Level</label>
              <input
                type="number"
                min="1"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-700">Visibility Status:</span>
              <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={status === 'published'}
                  onChange={() => setStatus('published')}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-semibold text-emerald-800">Published</span>
              </label>
              <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={status === 'draft'}
                  onChange={() => setStatus('draft')}
                  className="text-slate-600 focus:ring-emerald-500"
                />
                <span className="font-semibold text-slate-600">Draft</span>
              </label>
              <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="unavailable"
                  checked={status === 'unavailable'}
                  onChange={() => setStatus('unavailable')}
                  className="text-rose-600 focus:ring-emerald-500"
                />
                <span className="font-semibold text-rose-700">Unavailable</span>
              </label>
            </div>

            <label className="inline-flex items-center gap-2 text-xs font-bold cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-amber-800">Mark as Featured on Home Page</span>
            </label>
          </div>
        </div>

        {/* Section 3: Product Imagery */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-serif text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            3. Product Images
          </h3>

          {/* Existing images list */}
          {existingImages.length > 0 && (
            <div>
              <span className="text-xs font-bold text-slate-500 block mb-2">Saved Product Images:</span>
              <div className="flex flex-wrap gap-3">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative h-24 w-24 rounded-2xl overflow-hidden border border-slate-200 group">
                    <img src={img.image_path} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleDeleteExistingImage(img.id)}
                      className="absolute top-1 right-1 p-1 rounded-lg bg-rose-600 text-white shadow opacity-0 group-hover:opacity-100 transition"
                      title="Delete Image"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New images preview */}
          {newImagePreviews.length > 0 && (
            <div>
              <span className="text-xs font-bold text-emerald-700 block mb-2">New Images to Upload:</span>
              <div className="flex flex-wrap gap-3">
                {newImagePreviews.map((prev, idx) => (
                  <div key={idx} className="relative h-24 w-24 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-sm">
                    <img src={prev} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewImage(idx)}
                      className="absolute top-1 right-1 p-1 rounded-lg bg-slate-900/80 text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer transition bg-slate-50/50">
            <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">Click to upload product photos</p>
            <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WEBP accepted (max 6 files, 5MB each)</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageFileChange}
              className="mt-3 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-700 file:text-white cursor-pointer"
            />
          </div>
        </div>

        {/* Section 4: Verified Medicinal Text */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-serif text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            4. Descriptions, Ingredients & Directions
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Clinical background and overview of the homeopathic preparation..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Ingredients & Potency Composition</label>
              <textarea
                rows={2}
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                placeholder="e.g. Active Ingredient: Arnica Montana 30C HPUS. Inactive: Alcohol 90% v/v"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Usage Instructions / Dosage</label>
                <textarea
                  rows={2}
                  value={usageInstructions}
                  onChange={(e) => setUsageInstructions(e.target.value)}
                  placeholder="e.g. 5 drops in water 3 times daily..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Storage Information</label>
                <textarea
                  rows={2}
                  value={storageInfo}
                  onChange={(e) => setStorageInfo(e.target.value)}
                  placeholder="e.g. Store below 25°C away from camphor..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Precautionary Warnings & Contraindications</label>
              <textarea
                rows={2}
                value={warnings}
                onChange={(e) => setWarnings(e.target.value)}
                placeholder="e.g. Consult practitioner during pregnancy..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            to="/admin/products"
            className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
          >
            {submitting ? 'Saving Product...' : (isEdit ? 'Save Changes' : 'Publish Product')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;
