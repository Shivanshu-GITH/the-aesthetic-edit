import React, { useState } from 'react';
import { Plus, Eye, EyeOff, Pencil, Trash2, X, Save, RefreshCw, Flame, Star, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useAdminContext } from './AdminContext';
import { formatPrice } from '../../lib/currency';
import MultiImageUpload from '../MultiImageUpload';
import { VIBES } from '../../lib/constants';
import { clearFetchCache } from '../../hooks/useFetch';

export const AdminProducts: React.FC = () => {
  const { 
    allProducts, 
    productPrices, 
    updatingId, 
    handleToggleActive, 
    shopCategories,
    siteConfigs,
    adminFetch,
    refreshProducts,
    isLoading,
    setIsLoading,
    showToast
  } = useAdminContext();

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [customVibe, setCustomVibe] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [relatedSearch, setRelatedSearch] = useState('');

  const filteredProductsForRelated = allProducts.filter(p => 
    p.id !== editingProduct?.id && 
    p.title.toLowerCase().includes(relatedSearch.toLowerCase())
  );

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const errors: Record<string, string> = {};
    if (!editingProduct.title) errors.title = 'Title is required';
    if (!editingProduct.price) errors.price = 'Price is required';
    if (!editingProduct.image) errors.image = 'Image URL is required';
    if (!editingProduct.category) errors.category = 'Category is required';
    if (!editingProduct.subCategory) errors.subCategory = 'SubCategory is required';
    if (!editingProduct.vibe || editingProduct.vibe.length === 0) errors.vibes = 'At least one vibe is required';
    if (!editingProduct.affiliateUrl) errors.affiliateUrl = 'Affiliate URL is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const isEdit = !!editingProduct.id;
      const url = isEdit ? `/api/products/admin/${editingProduct.id}` : '/api/products/admin/create';
      const method = isEdit ? 'PUT' : 'POST';

      const body = {
        ...editingProduct,
        vibes: editingProduct.vibe
      };

      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        setIsProductModalOpen(false);
        setEditingProduct(null);
        showToast(`Product ${isEdit ? 'updated' : 'created'} successfully`, 'success');
        clearFetchCache();
        refreshProducts();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to save product', 'error');
      }
    } catch (err) {
      showToast('Failed to save product', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await adminFetch(`/api/products/admin/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setConfirmDeleteId(null);
        showToast('Product deleted', 'success');
        clearFetchCache();
        refreshProducts();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to delete product', 'error');
      }
    } catch (err) {
      showToast('Failed to delete product', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-headline font-bold">Manage Products</h2>
        <button 
          onClick={() => {
            setEditingProduct({ isActive: true, vibe: [] });
            setFormErrors({});
            setIsProductModalOpen(true);
          }}
          className="bg-primary text-white px-6 py-3 rounded-2xl font-label text-xs uppercase tracking-widest font-bold flex items-center gap-2 hover:bg-primary-hover transition-all"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-[40px] border border-outline-variant/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container/30 text-[10px] uppercase tracking-widest text-outline font-bold">
                <th className="px-8 py-4">Image</th>
                <th className="px-8 py-4">Title</th>
                <th className="px-8 py-4">Price</th>
                <th className="px-8 py-4">Category</th>
                <th className="px-8 py-4">Retailer</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {allProducts.map((p) => (
                <tr key={p.id} className="group hover:bg-surface-container/10 transition-colors">
                  <td className="px-8 py-4">
                    <img src={p.image} className="w-10 h-10 rounded-lg object-cover" alt="" />
                  </td>
                  <td className="px-8 py-4">
                    <span className="text-sm font-bold block truncate max-w-50">{p.title}</span>
                  </td>
                  <td className="px-8 py-4 text-sm font-bold text-primary">{productPrices[p.id] || formatPrice(p.price)}</td>
                  <td className="px-8 py-4">
                    <span className="text-[10px] text-outline block">{p.category}</span>
                    <span className="text-[9px] text-primary/70 font-bold uppercase tracking-widest">{p.subCategory}</span>
                  </td>
                  <td className="px-8 py-4 text-sm text-on-surface-variant">{p.retailer || '—'}</td>
                  <td className="px-8 py-4">
                    <button 
                      onClick={() => handleToggleActive(p.id)}
                      disabled={updatingId === p.id}
                      className={`p-2 rounded-lg transition-colors ${p.isActive ? 'text-green-600 bg-green-50' : 'text-outline bg-surface-container'}`}
                    >
                      {p.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => {
                          setEditingProduct(p);
                          setFormErrors({});
                          setIsProductModalOpen(true);
                        }}
                        className="p-2 text-outline hover:text-primary transition-colors"
                      >
                        <Pencil size={18} />
                      </button>
                      {confirmDeleteId === p.id ? (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleDeleteProduct(p.id)}
                            className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-red-100 transition-all"
                          >
                            Confirm
                          </button>
                          <button 
                            onClick={() => setConfirmDeleteId(null)}
                            className="border border-outline-variant px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-surface-container transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setConfirmDeleteId(p.id)}
                          className="p-2 text-outline hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsProductModalOpen(false)}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[40px] border border-outline-variant/30 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col p-8"
          >
            <div className="border-b border-outline-variant/20 flex items-center justify-between pb-6 mb-8">
              <h3 className="text-2xl font-headline font-bold">
                {editingProduct?.id ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button 
                onClick={() => setIsProductModalOpen(false)}
                className="p-2 hover:bg-surface-container rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto space-y-8 pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Title */}
                <div className="space-y-2">
                  <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Title</label>
                  <input 
                    type="text"
                    value={editingProduct?.title || ''}
                    onChange={(e) => setEditingProduct((prev: any) => ({ ...prev, title: e.target.value }))}
                    placeholder="Product title"
                    className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-sm"
                  />
                  {formErrors.title && <p className="text-[9px] text-red-500 uppercase font-bold tracking-widest">{formErrors.title}</p>}
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Price</label>
                  <input 
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingProduct?.price || ''}
                    onChange={(e) => setEditingProduct((prev: any) => ({ ...prev, price: parseFloat(e.target.value) }))}
                    placeholder="0.00"
                    className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-sm"
                  />
                  {formErrors.price && <p className="text-[9px] text-red-500 uppercase font-bold tracking-widest">{formErrors.price}</p>}
                </div>

                {/* Images */}
                <div className="md:col-span-2 space-y-2">
                  <MultiImageUpload 
                    label="Product Images (First will be main cover)" 
                    value={editingProduct?.images || (editingProduct?.image ? [editingProduct.image] : [])} 
                    onChange={(urls) => setEditingProduct((prev: any) => ({ 
                      ...prev, 
                      images: urls,
                      image: urls[0] || '' 
                    }))} 
                  />
                  {formErrors.image && <p className="text-[9px] text-red-500 uppercase font-bold tracking-widest">{formErrors.image}</p>}
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Category</label>
                  <select 
                    value={editingProduct?.category || ''}
                    onChange={(e) => setEditingProduct((prev: any) => ({ ...prev, category: e.target.value, subCategory: '' }))}
                    className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-sm appearance-none"
                  >
                    <option value="">Select Category</option>
                    {shopCategories.map((c: any) => <option key={c.id} value={c.title}>{c.title}</option>)}
                  </select>
                  {formErrors.category && <p className="text-[9px] text-red-500 uppercase font-bold tracking-widest">{formErrors.category}</p>}
                </div>

                {/* SubCategory */}
                <div className="space-y-2">
                  <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Sub-Category</label>
                  <select 
                    value={editingProduct?.subCategory || ''}
                    disabled={!editingProduct?.category}
                    onChange={(e) => setEditingProduct((prev: any) => ({ ...prev, subCategory: e.target.value }))}
                    className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-sm appearance-none disabled:opacity-50"
                  >
                    <option value="">Select Sub-Category</option>
                    {shopCategories.find((c: any) => c.title === editingProduct?.category)?.sub_categories?.map((s: string) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {formErrors.subCategory && <p className="text-[9px] text-red-500 uppercase font-bold tracking-widest">{formErrors.subCategory}</p>}
                </div>

                {/* Vibes */}
                <div className="space-y-3 md:col-span-2">
                  <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Vibes</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {(siteConfigs.vibes_preset || VIBES.join(', ')).split(',').map((v: any) => v.trim()).filter(Boolean).map((vibe: any) => {
                      const isSelected = editingProduct?.vibe?.includes(vibe);
                      return (
                        <button
                          key={vibe}
                          type="button"
                          onClick={() => {
                            const currentVibes = editingProduct?.vibe || [];
                            const newVibes = isSelected 
                              ? currentVibes.filter((v: any) => v !== vibe)
                              : [...currentVibes, vibe];
                            setEditingProduct((prev: any) => ({ ...prev, vibe: newVibes }));
                          }}
                          className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border ${
                            isSelected 
                              ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
                              : 'bg-surface-container border-outline-variant/30 text-outline hover:border-primary'
                          }`}
                        >
                          {vibe}
                        </button>
                      );
                    })}
                  </div>
                  {/* Add Custom Vibe */}
                  <div className="flex gap-2 mt-4">
                    <div className="relative flex-1">
                      <input 
                        type="text"
                        value={customVibe}
                        onChange={(e) => setCustomVibe(e.target.value)}
                        placeholder="Add custom vibe..."
                        className="px-4 py-2.5 rounded-xl bg-surface-container/50 border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-xs"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (customVibe.trim()) {
                              const currentVibes = editingProduct?.vibe || [];
                              if (!currentVibes.includes(customVibe.trim())) {
                                setEditingProduct((prev: any) => ({ ...prev, vibe: [...currentVibes, customVibe.trim()] }));
                              }
                              setCustomVibe('');
                            }
                          }
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (customVibe.trim()) {
                          const currentVibes = editingProduct?.vibe || [];
                          if (!currentVibes.includes(customVibe.trim())) {
                            setEditingProduct((prev: any) => ({ ...prev, vibe: [...currentVibes, customVibe.trim()] }));
                          }
                          setCustomVibe('');
                        }
                      }}
                      className="bg-surface-container text-primary px-4 py-2 rounded-xl text-[10px] uppercase font-bold tracking-widest hover:bg-primary hover:text-white transition-all border border-primary/20"
                    >
                      Add
                    </button>
                  </div>
                  {/* Display currently selected custom vibes not in the preset list */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {editingProduct?.vibe?.filter((v: any) => !((siteConfigs.vibes_preset || VIBES.join(', ')).split(',').map((vp: any) => vp.trim()).includes(v))).map((v: any) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setEditingProduct((prev: any) => ({ ...prev, vibe: (prev.vibe || []).filter((vibe: any) => vibe !== v) }))}
                        className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 group hover:bg-primary/20"
                      >
                        {v} <X size={12} className="text-primary/50 group-hover:text-primary" />
                      </button>
                    ))}
                  </div>
                  {formErrors.vibes && <p className="text-[9px] text-red-500 uppercase font-bold tracking-widest">{formErrors.vibes}</p>}
                </div>

                {/* Affiliate URL */}
                <div className="space-y-2 md:col-span-2">
                  <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Affiliate URL</label>
                  <input 
                    type="text"
                    value={editingProduct?.affiliateUrl || ''}
                    onChange={(e) => setEditingProduct((prev: any) => ({ ...prev, affiliateUrl: e.target.value }))}
                    placeholder="https://..."
                    className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-sm"
                  />
                  {formErrors.affiliateUrl && <p className="text-[9px] text-red-500 uppercase font-bold tracking-widest">{formErrors.affiliateUrl}</p>}
                </div>

                {/* Retailer */}
                <div className="space-y-2">
                  <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Retailer (Optional)</label>
                  <input 
                    type="text"
                    value={editingProduct?.retailer || ''}
                    onChange={(e) => setEditingProduct((prev: any) => ({ ...prev, retailer: e.target.value }))}
                    placeholder="Amazon, ASOS, etc."
                    className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-sm"
                  />
                </div>

                {/* Visibility & Quick Filters */}
                <div className="md:col-span-2 space-y-4">
                  <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Product Flags & Visibility</label>
                  <div className="flex flex-wrap gap-4">
                    {/* Is Active */}
                    <button
                      type="button"
                      onClick={() => setEditingProduct((prev: any) => ({ ...prev, isActive: !prev?.isActive }))}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all border ${
                        editingProduct?.isActive 
                          ? 'bg-green-50 border-green-200 text-green-600' 
                          : 'bg-surface-container border-outline-variant/30 text-outline'
                      }`}
                    >
                      {editingProduct?.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                      <span className="text-[9px] uppercase tracking-widest font-bold">
                        {editingProduct?.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </button>

                    {/* Is Trending */}
                    <button
                      type="button"
                      onClick={() => setEditingProduct((prev: any) => ({ ...prev, isTrending: !prev?.isTrending }))}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all border ${
                        editingProduct?.isTrending 
                          ? 'bg-orange-50 border-orange-200 text-orange-600' 
                          : 'bg-surface-container border-outline-variant/30 text-outline'
                      }`}
                    >
                      <Flame size={18} />
                      <span className="text-[9px] uppercase tracking-widest font-bold">
                        {editingProduct?.isTrending ? 'Trending' : 'Not Trending'}
                      </span>
                    </button>

                    {/* Is Top Rated */}
                    <button
                      type="button"
                      onClick={() => setEditingProduct((prev: any) => ({ ...prev, isTopRated: !prev?.isTopRated }))}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all border ${
                        editingProduct?.isTopRated 
                          ? 'bg-yellow-50 border-yellow-200 text-yellow-600' 
                          : 'bg-surface-container border-outline-variant/30 text-outline'
                      }`}
                    >
                      <Star size={18} />
                      <span className="text-[9px] uppercase tracking-widest font-bold">
                        {editingProduct?.isTopRated ? 'Top Rated' : 'Standard'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2 md:col-span-2">
                  <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Description (Optional)</label>
                  <textarea 
                    rows={4}
                    value={editingProduct?.description || ''}
                    onChange={(e) => setEditingProduct((prev: any) => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the product..."
                    className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-sm resize-none"
                  />
                </div>

                {/* Related Products (Complete the Look) */}
                <div className="space-y-4 md:col-span-2 border-t border-outline-variant/10 pt-8">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <Plus size={16} />
                    <label className="font-label text-xs uppercase tracking-widest font-bold">Complete the Look (Related Products)</label>
                  </div>
                  
                  {/* Search and Selection */}
                  <div className="space-y-4">
                    <div className="relative">
                      <input 
                        type="text"
                        value={relatedSearch}
                        onChange={(e) => setRelatedSearch(e.target.value)}
                        placeholder="Search products to add..."
                        className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-sm"
                      />
                    </div>

                    {/* Selected Products Chips */}
                    <div className="flex flex-wrap gap-2">
                      {(editingProduct?.relatedProducts || []).map((relId: string) => {
                        const relProd = allProducts.find(p => p.id === relId);
                        if (!relProd) return null;
                        return (
                          <div key={relId} className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest group">
                            <img src={relProd.image} className="w-4 h-4 rounded-sm object-cover" alt="" />
                            <span className="truncate max-w-[150px]">{relProd.title}</span>
                            <button 
                              type="button"
                              onClick={() => {
                                setEditingProduct((prev: any) => ({
                                  ...prev,
                                  relatedProducts: (prev.relatedProducts || []).filter((id: string) => id !== relId)
                                }));
                              }}
                              className="text-primary/50 hover:text-primary"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Results Dropdown (only show when searching) */}
                    {relatedSearch && (
                      <div className="bg-white border border-outline-variant/30 rounded-2xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                        {filteredProductsForRelated.length > 0 ? (
                          filteredProductsForRelated.map(p => {
                            const isAlreadySelected = (editingProduct?.relatedProducts || []).includes(p.id);
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => {
                                  if (!isAlreadySelected) {
                                    setEditingProduct((prev: any) => ({
                                      ...prev,
                                      relatedProducts: [...(prev.relatedProducts || []), p.id]
                                    }));
                                  }
                                  setRelatedSearch('');
                                }}
                                className="w-full flex items-center gap-4 px-4 py-3 hover:bg-surface-container transition-colors text-left disabled:opacity-50"
                                disabled={isAlreadySelected}
                              >
                                <img src={p.image} className="w-8 h-8 rounded-lg object-cover" alt="" />
                                <div>
                                  <p className="text-xs font-bold truncate">{p.title}</p>
                                  <p className="text-[10px] text-outline">{p.category}</p>
                                </div>
                                {isAlreadySelected && <Check size={14} className="ml-auto text-green-600" />}
                              </button>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center text-xs text-outline italic">No products found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-outline-variant/20 pt-8 mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex gap-4 w-full sm:w-auto ml-auto">
                  <button 
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="border border-outline-variant px-4 py-2 rounded-xl font-label text-xs uppercase tracking-widest font-bold hover:bg-surface-container transition-all flex-1 sm:flex-none"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="bg-primary text-white px-6 py-3 rounded-2xl font-label text-xs uppercase tracking-widest font-bold hover:bg-primary-hover transition-all flex items-center justify-center gap-2 disabled:opacity-50 flex-1 sm:flex-none"
                  >
                    {isLoading ? <RefreshCw size={16} className="animate-spin" /> : <><Save size={16} /> Save Product</>}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
