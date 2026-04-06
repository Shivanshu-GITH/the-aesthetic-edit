import React, { useState } from 'react';
import { Plus, Pencil, Trash2, X, Save, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAdminContext } from './AdminContext';
import ImageUpload from '../ImageUpload';
import { clearFetchCache } from '../../hooks/useFetch';

export const AdminBlogCategories: React.FC = () => {
  const { 
    blogCategories,
    adminFetch,
    refreshBlogCategories,
    refreshBlogPosts,
    isLoading,
    setIsLoading,
    showToast
  } = useAdminContext();

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryFormErrors, setCategoryFormErrors] = useState<Record<string, string>>({});
  const [isCategorySlugManual, setIsCategorySlugManual] = useState(false);
  const [confirmDeleteCategoryId, setConfirmDeleteCategoryId] = useState<string | null>(null);

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    const errors: Record<string, string> = {};
    if (!editingCategory.title) errors.title = 'Title is required';
    if (!editingCategory.slug) errors.slug = 'Slug is required';
    if (!editingCategory.image) errors.image = 'Image URL is required';
    if (!editingCategory.description) errors.description = 'Description is required';

    if (Object.keys(errors).length > 0) {
      setCategoryFormErrors(errors);
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const isEdit = !!editingCategory.id;
      const url = isEdit ? `/api/blog/admin/categories/${editingCategory.id}` : '/api/blog/admin/categories';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCategory)
      });

      if (res.ok) {
        setIsCategoryModalOpen(false);
        setEditingCategory(null);
        showToast(`Category ${isEdit ? 'updated' : 'created'} successfully`, 'success');
        clearFetchCache();
        refreshBlogCategories();
        refreshBlogPosts();
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

  const handleDeleteCategory = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await adminFetch(`/api/blog/admin/categories/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setConfirmDeleteCategoryId(null);
        showToast('Category deleted', 'success');
        clearFetchCache();
        refreshBlogCategories();
        refreshBlogPosts();
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
        <h2 className="text-3xl font-headline font-bold">Blog Categories</h2>
        <button 
          onClick={() => {
            setEditingCategory({});
            setCategoryFormErrors({});
            setIsCategorySlugManual(false);
            setIsCategoryModalOpen(true);
          }}
          className="bg-primary text-white px-6 py-3 rounded-2xl font-label text-xs uppercase tracking-widest font-bold flex items-center gap-2 hover:bg-primary-hover transition-all"
        >
          <Plus size={18} /> New Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogCategories.map((category) => (
          <div key={category.id} className="bg-white p-6 rounded-4xl border border-outline-variant/30 shadow-sm space-y-4 group">
            <div className="relative aspect-5/4 overflow-hidden rounded-2xl">
              <img 
                src={category.image} 
                alt={category.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-headline font-bold">{category.title}</h3>
                <div className="flex gap-1">
                  <button 
                    onClick={() => {
                      setEditingCategory(category);
                      setCategoryFormErrors({});
                      setIsCategorySlugManual(true);
                      setIsCategoryModalOpen(true);
                    }}
                    className="p-2 text-outline hover:text-primary transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  {confirmDeleteCategoryId === category.id ? (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleDeleteCategory(category.id)}
                        className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-red-100 transition-all"
                      >
                        Confirm
                      </button>
                      <button 
                        onClick={() => setConfirmDeleteCategoryId(null)}
                        className="border border-outline-variant px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-surface-container transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setConfirmDeleteCategoryId(category.id)}
                      className="p-2 text-outline hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-[10px] text-outline font-mono">{category.slug}</p>
            </div>
            <p className="text-sm text-on-surface-variant line-clamp-2 leading-relaxed">
              {category.description}
            </p>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCategoryModalOpen(false)} className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl border border-outline-variant/30 p-10 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-outline-variant/20">
                <h2 className="text-2xl font-headline font-bold">{editingCategory?.id ? 'Edit Category' : 'New Category'}</h2>
                <button onClick={() => setIsCategoryModalOpen(false)} className="p-2 text-outline hover:text-primary transition-colors"><X size={24} /></button>
              </div>
              <form onSubmit={handleSaveCategory} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Title</label>
                    <input 
                      type="text" 
                      value={editingCategory?.title || ''} 
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        setEditingCategory((prev: any) => {
                          const updates: any = { title: newTitle };
                          if (!isCategorySlugManual) {
                            updates.slug = newTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                          }
                          return { ...prev, ...updates };
                        });
                      }} 
                      className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm" 
                    />
                    {categoryFormErrors.title && <p className="text-[9px] text-red-500 uppercase font-bold">{categoryFormErrors.title}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Slug</label>
                    <input 
                      type="text" 
                      value={editingCategory?.slug || ''} 
                      onChange={(e) => {
                        setIsCategorySlugManual(true);
                        setEditingCategory((prev: any) => ({ ...prev, slug: e.target.value }));
                      }} 
                      className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm" 
                    />
                    {categoryFormErrors.slug && <p className="text-[9px] text-red-500 uppercase font-bold">{categoryFormErrors.slug}</p>}
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <ImageUpload 
                      label="Category Image" 
                      value={editingCategory?.image || ''} 
                      onChange={(val) => setEditingCategory((prev: any) => ({ ...prev, image: val }))} 
                    />
                    {categoryFormErrors.image && <p className="text-[9px] text-red-500 uppercase font-bold">{categoryFormErrors.image}</p>}
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Description</label>
                    <textarea 
                      value={editingCategory?.description || ''} 
                      onChange={(e) => setEditingCategory((prev: any) => ({ ...prev, description: e.target.value }))} 
                      rows={3} 
                      className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm resize-none" 
                    />
                    {categoryFormErrors.description && <p className="text-[9px] text-red-500 uppercase font-bold">{categoryFormErrors.description}</p>}
                  </div>
                </div>
                <div className="flex justify-end gap-4 pt-8">
                  <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="border border-outline-variant px-4 py-2 rounded-xl font-label text-xs uppercase font-bold">Cancel</button>
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
