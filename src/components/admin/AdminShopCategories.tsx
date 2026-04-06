import React, { useState } from 'react';
import { Plus, Pencil, Trash2, X, Save, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAdminContext } from './AdminContext';
import { clearFetchCache } from '../../hooks/useFetch';

export const AdminShopCategories: React.FC = () => {
  const { 
    shopCategories,
    adminFetch,
    refreshShopCategories,
    isLoading,
    setIsLoading,
    showToast
  } = useAdminContext();

  const [isShopCategoryModalOpen, setIsShopCategoryModalOpen] = useState(false);
  const [editingShopCategory, setEditingShopCategory] = useState<any>(null);
  const [shopCategoryFormErrors, setShopCategoryFormErrors] = useState<Record<string, string>>({});
  const [confirmDeleteShopCategoryId, setConfirmDeleteShopCategoryId] = useState<string | null>(null);

  const handleSaveShopCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShopCategory) return;

    const errors: Record<string, string> = {};
    if (!editingShopCategory.title) errors.title = 'Title is required';
    if (!editingShopCategory.slug) errors.slug = 'Slug is required';

    if (Object.keys(errors).length > 0) {
      setShopCategoryFormErrors(errors);
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const isEdit = !!editingShopCategory.id;
      const url = isEdit ? `/api/home-shop/admin/shop-categories/${editingShopCategory.id}` : '/api/home-shop/admin/shop-categories';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingShopCategory)
      });

      if (res.ok) {
        setIsShopCategoryModalOpen(false);
        setEditingShopCategory(null);
        showToast(`Category ${isEdit ? 'updated' : 'created'} successfully`, 'success');
        clearFetchCache();
        refreshShopCategories();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to save category', 'error');
      }
    } catch (err) {
      showToast('Failed to save category', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteShopCategory = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await adminFetch(`/api/home-shop/admin/shop-categories/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setConfirmDeleteShopCategoryId(null);
        showToast('Category deleted', 'success');
        clearFetchCache();
        refreshShopCategories();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to delete category', 'error');
      }
    } catch (err) {
      showToast('Failed to delete category', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-headline font-bold">Shop Sidebar Categories</h2>
        <button 
          onClick={() => {
            setEditingShopCategory({ sub_categories: [] });
            setShopCategoryFormErrors({});
            setIsShopCategoryModalOpen(true);
          }}
          className="bg-primary text-white px-6 py-3 rounded-2xl font-label text-xs uppercase tracking-widest font-bold flex items-center gap-2 hover:bg-primary-hover transition-all"
        >
          <Plus size={18} /> New Category
        </button>
      </div>

      <div className="bg-white rounded-[40px] border border-outline-variant/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container/30 text-[10px] uppercase tracking-widest text-outline font-bold">
                <th className="px-8 py-4">Title</th>
                <th className="px-8 py-4">Slug</th>
                <th className="px-8 py-4">Sub-categories</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {shopCategories.map((category) => (
                <tr key={category.id} className="group hover:bg-surface-container/10 transition-colors">
                  <td className="px-8 py-4 font-bold">{category.title}</td>
                  <td className="px-8 py-4 text-[10px] font-mono text-outline">{category.slug}</td>
                  <td className="px-8 py-4">
                    <div className="flex flex-wrap gap-2">
                      {category.sub_categories?.map((s: string) => (
                        <span key={s} className="px-2 py-1 bg-surface-container rounded-lg text-[9px] font-bold uppercase tracking-widest text-outline">{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => {
                          setEditingShopCategory({ ...category });
                          setShopCategoryFormErrors({});
                          setIsShopCategoryModalOpen(true);
                        }}
                        className="p-2 text-outline hover:text-primary transition-colors"
                      >
                        <Pencil size={18} />
                      </button>
                      {confirmDeleteShopCategoryId === category.id ? (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleDeleteShopCategory(category.id)}
                            className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-red-100 transition-all"
                          >
                            Confirm
                          </button>
                          <button 
                            onClick={() => setConfirmDeleteShopCategoryId(null)}
                            className="border border-outline-variant px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-surface-container transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setConfirmDeleteShopCategoryId(category.id)}
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

      <AnimatePresence>
        {isShopCategoryModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center px-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsShopCategoryModalOpen(false)} className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl border border-outline-variant/30 p-10 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-outline-variant/20">
                <h2 className="text-2xl font-headline font-bold">{editingShopCategory?.id ? 'Edit Shop Category' : 'New Shop Category'}</h2>
                <button onClick={() => setIsShopCategoryModalOpen(false)} className="p-2 text-outline hover:text-primary transition-colors"><X size={24} /></button>
              </div>
              <form onSubmit={handleSaveShopCategory} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Title</label>
                    <input 
                      type="text" 
                      value={editingShopCategory?.title || ''} 
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        setEditingShopCategory((prev: any) => ({ 
                          ...prev, 
                          title: newTitle, 
                          slug: prev.id ? prev.slug : newTitle.toLowerCase().replace(/\s+/g, '-') 
                        }));
                      }} 
                      className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm" 
                    />
                    {shopCategoryFormErrors.title && <p className="text-[9px] text-red-500 uppercase font-bold">{shopCategoryFormErrors.title}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Slug</label>
                    <input 
                      type="text" 
                      value={editingShopCategory?.slug || ''} 
                      onChange={(e) => setEditingShopCategory((prev: any) => ({ ...prev, slug: e.target.value }))} 
                      className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm" 
                    />
                    {shopCategoryFormErrors.slug && <p className="text-[9px] text-red-500 uppercase font-bold">{shopCategoryFormErrors.slug}</p>}
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Sub-categories (comma separated)</label>
                    <input 
                      type="text" 
                      value={editingShopCategory?.sub_categories?.join(', ') || ''} 
                      onChange={(e) => setEditingShopCategory((prev: any) => ({ 
                        ...prev, 
                        sub_categories: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) 
                      }))} 
                      className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm" 
                      placeholder="Clothing, Accessories, etc." 
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-4 pt-8">
                  <button type="button" onClick={() => setIsShopCategoryModalOpen(false)} className="border border-outline-variant px-4 py-2 rounded-xl font-label text-xs uppercase font-bold">Cancel</button>
                  <button type="submit" disabled={isLoading} className="bg-primary text-white px-6 py-3 rounded-2xl font-label text-xs uppercase font-bold flex items-center gap-2">
                    {isLoading ? <RefreshCw className="animate-spin" /> : <Save size={16} />} Save
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
