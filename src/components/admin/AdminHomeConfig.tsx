import React, { useState } from 'react';
import { Plus, Pencil, Trash2, X, Save, RefreshCw, Sparkles, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAdminContext } from './AdminContext';
import ImageUpload from '../ImageUpload';
import { clearFetchCache } from '../../hooks/useFetch';

export const AdminHomeConfig: React.FC = () => {
  const { 
    moods,
    findHereItems,
    shopCategories,
    blogCategories,
    siteConfigs,
    adminFetch,
    refreshMoods,
    refreshFindHere,
    refreshSiteConfig,
    isLoading,
    setIsLoading,
    showToast
  } = useAdminContext();

  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [editingMood, setEditingMood] = useState<any>(null);
  const [confirmDeleteMoodId, setConfirmDeleteMoodId] = useState<string | null>(null);

  const [isFindHereModalOpen, setIsFindHereModalOpen] = useState(false);
  const [editingFindHere, setEditingFindHere] = useState<any>(null);
  const [confirmDeleteFindHereId, setConfirmDeleteFindHereId] = useState<string | null>(null);

  const handleSaveMood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMood) return;

    setIsLoading(true);
    try {
      const isEdit = !!editingMood.id;
      const url = isEdit ? `/api/home-shop/admin/moods/${editingMood.id}` : '/api/home-shop/admin/moods';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingMood)
      });

      if (res.ok) {
        setIsMoodModalOpen(false);
        setEditingMood(null);
        showToast(`Mood ${isEdit ? 'updated' : 'created'} successfully`, 'success');
        clearFetchCache();
        refreshMoods();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to save mood', 'error');
      }
    } catch (err) {
      showToast('Failed to save mood', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMood = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await adminFetch(`/api/home-shop/admin/moods/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setConfirmDeleteMoodId(null);
        showToast('Mood deleted', 'success');
        clearFetchCache();
        refreshMoods();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to delete mood', 'error');
      }
    } catch (err) {
      showToast('Failed to delete mood', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveFindHere = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFindHere) return;

    setIsLoading(true);
    try {
      const isEdit = !!editingFindHere.id;
      const url = isEdit ? `/api/home-shop/admin/find-here/${editingFindHere.id}` : '/api/home-shop/admin/find-here';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingFindHere)
      });

      if (res.ok) {
        setIsFindHereModalOpen(false);
        setEditingFindHere(null);
        showToast(`Item ${isEdit ? 'updated' : 'created'} successfully`, 'success');
        clearFetchCache();
        refreshFindHere();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to save item', 'error');
      }
    } catch (err) {
      showToast('Failed to save item', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFindHere = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await adminFetch(`/api/home-shop/admin/find-here/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setConfirmDeleteFindHereId(null);
        showToast('Item deleted', 'success');
        clearFetchCache();
        refreshFindHere();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to delete item', 'error');
      }
    } catch (err) {
      showToast('Failed to delete item', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateConfig = async (key: string, value: string) => {
    setIsLoading(true);
    try {
      const res = await adminFetch('/api/home-shop/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });
      if (res.ok) {
        showToast('Config updated', 'success');
        refreshSiteConfig();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || 'Failed to update config', 'error');
      }
    } catch {
      showToast('Failed to update config', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-16">
      {/* Home Branding Section */}
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <Layout size={24} className="text-primary" />
          <h2 className="text-3xl font-headline font-bold">Home Branding</h2>
        </div>
        <div className="bg-white rounded-[32px] border border-outline-variant/30 shadow-sm p-8 max-w-3xl">
          <ImageUpload
            label="Favicon (Upload or URL)"
            value={siteConfigs.favicon_url || ''}
            onChange={(url) => { void handleUpdateConfig('favicon_url', url); }}
          />
          <p className="text-[10px] text-outline mt-3">
            Recommended: square PNG (32x32 or 64x64). This updates the browser tab icon site-wide.
          </p>
        </div>
      </div>

      {/* Home Moods Section */}
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Sparkles size={24} className="text-primary" />
            <h2 className="text-3xl font-headline font-bold">Home Moods (Vibe Grid)</h2>
          </div>
          <button 
            onClick={() => {
              setEditingMood({});
              setIsMoodModalOpen(true);
            }}
            className="bg-primary text-white px-6 py-3 rounded-2xl font-label text-xs uppercase tracking-widest font-bold flex items-center gap-2 hover:bg-primary-hover transition-all"
          >
            <Plus size={18} /> New Mood
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {moods.map((mood) => (
            <div key={mood.id} className="bg-white rounded-[32px] border border-outline-variant/30 shadow-sm overflow-hidden group">
              <div className="aspect-square relative overflow-hidden">
                <img src={mood.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-6 left-6 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">{mood.vibe || 'The Aesthetic'}</p>
                  <h3 className="text-xl font-headline font-bold">{mood.name}</h3>
                </div>
              </div>
              <div className="p-6 flex items-center justify-between">
                <div className="flex gap-1">
                  <button 
                    onClick={() => {
                      setEditingMood(mood);
                      setIsMoodModalOpen(true);
                    }}
                    className="p-2 text-outline hover:text-primary transition-colors"
                  >
                    <Pencil size={18} />
                  </button>
                  {confirmDeleteMoodId === mood.id ? (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleDeleteMood(mood.id)}
                        className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest"
                      >
                        Confirm
                      </button>
                      <button 
                        onClick={() => setConfirmDeleteMoodId(null)}
                        className="border border-outline-variant px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setConfirmDeleteMoodId(mood.id)}
                      className="p-2 text-outline hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
                <span className="text-[10px] text-outline font-mono">{mood.count || '0'} items</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Find Here Section */}
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Layout size={24} className="text-primary" />
            <h2 className="text-3xl font-headline font-bold">"Find it Here" Categories</h2>
          </div>
          <button 
            onClick={() => {
              setEditingFindHere({});
              setIsFindHereModalOpen(true);
            }}
            className="bg-primary text-white px-6 py-3 rounded-2xl font-label text-xs uppercase tracking-widest font-bold flex items-center gap-2 hover:bg-primary-hover transition-all"
          >
            <Plus size={18} /> New Item
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {findHereItems.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-[32px] border border-outline-variant/30 shadow-sm space-y-4">
              <div className="aspect-16/9 rounded-2xl overflow-hidden">
                <img src={item.image} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-headline font-bold">{item.title}</h3>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => {
                        setEditingFindHere(item);
                        setIsFindHereModalOpen(true);
                      }}
                      className="p-2 text-outline hover:text-primary transition-colors"
                    >
                      <Pencil size={18} />
                    </button>
                    {confirmDeleteFindHereId === item.id ? (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleDeleteFindHere(item.id)}
                          className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest"
                        >
                          Confirm
                        </button>
                        <button 
                          onClick={() => setConfirmDeleteFindHereId(null)}
                          className="border border-outline-variant px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setConfirmDeleteFindHereId(item.id)}
                        className="p-2 text-outline hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-on-surface-variant line-clamp-2">{item.description}</p>
                <p className="text-[10px] text-primary font-bold uppercase tracking-widest">
                  Linked to: {item.linked_blog_category_slug || 'None'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {/* Mood Modal */}
        {isMoodModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center px-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMoodModalOpen(false)} className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl border border-outline-variant/30 p-10 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-outline-variant/20">
                <h2 className="text-2xl font-headline font-bold">{editingMood?.id ? 'Edit Mood' : 'New Mood'}</h2>
                <button onClick={() => setIsMoodModalOpen(false)} className="p-2 text-outline hover:text-primary transition-colors"><X size={24} /></button>
              </div>
              <form onSubmit={handleSaveMood} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Name</label>
                    <input 
                      type="text" 
                      value={editingMood?.name || ''} 
                      onChange={(e) => {
                        const newName = e.target.value;
                        setEditingMood((prev: any) => ({ 
                          ...prev, 
                          name: newName, 
                          slug: prev.id ? prev.slug : newName.toLowerCase().replace(/\s+/g, '-') 
                        }));
                      }} 
                      className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Slug</label>
                    <input type="text" value={editingMood?.slug || ''} onChange={(e) => setEditingMood((prev: any) => ({ ...prev, slug: e.target.value }))} className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Vibe (Tag)</label>
                    <input type="text" value={editingMood?.vibe || ''} onChange={(e) => setEditingMood((prev: any) => ({ ...prev, vibe: e.target.value }))} className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm" placeholder="e.g. Clean Girl" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Item Count Tag</label>
                    <input type="text" value={editingMood?.count || ''} onChange={(e) => setEditingMood((prev: any) => ({ ...prev, count: e.target.value }))} className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm" placeholder="e.g. 1.2k" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <ImageUpload 
                      label="Mood Image" 
                      value={editingMood?.image || ''} 
                      onChange={(val) => setEditingMood((prev: any) => ({ ...prev, image: val }))} 
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Linked Shop Category</label>
                    <select value={editingMood?.linked_shop_category_id || ''} onChange={(e) => setEditingMood((prev: any) => ({ ...prev, linked_shop_category_id: e.target.value }))} className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm">
                      <option value="">None</option>
                      {shopCategories.map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-4 pt-8">
                  <button type="button" onClick={() => setIsMoodModalOpen(false)} className="border border-outline-variant px-4 py-2 rounded-xl font-label text-xs uppercase font-bold">Cancel</button>
                  <button type="submit" disabled={isLoading} className="bg-primary text-white px-6 py-3 rounded-2xl font-label text-xs uppercase font-bold flex items-center gap-2">
                    {isLoading ? <RefreshCw className="animate-spin" /> : <Save size={16} />} Save
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Find Here Modal */}
        {isFindHereModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center px-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsFindHereModalOpen(false)} className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl border border-outline-variant/30 p-10 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-outline-variant/20">
                <h2 className="text-2xl font-headline font-bold">{editingFindHere?.id ? 'Edit Item' : 'New Item'}</h2>
                <button onClick={() => setIsFindHereModalOpen(false)} className="p-2 text-outline hover:text-primary transition-colors"><X size={24} /></button>
              </div>
              <form onSubmit={handleSaveFindHere} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Title</label>
                    <input type="text" value={editingFindHere?.title || ''} onChange={(e) => setEditingFindHere((prev: any) => ({ ...prev, title: e.target.value }))} className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Description</label>
                    <textarea value={editingFindHere?.description || ''} onChange={(e) => setEditingFindHere((prev: any) => ({ ...prev, description: e.target.value }))} rows={3} className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm resize-none" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <ImageUpload 
                      label="Item Image" 
                      value={editingFindHere?.image || ''} 
                      onChange={(val) => setEditingFindHere((prev: any) => ({ ...prev, image: val }))} 
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Linked Blog Category</label>
                    <select value={editingFindHere?.linked_blog_category_slug || ''} onChange={(e) => setEditingFindHere((prev: any) => ({ ...prev, linked_blog_category_slug: e.target.value }))} className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm">
                      <option value="">None</option>
                      {blogCategories.map((c: any) => <option key={c.slug} value={c.slug}>{c.title}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-4 pt-8">
                  <button type="button" onClick={() => setIsFindHereModalOpen(false)} className="border border-outline-variant px-4 py-2 rounded-xl font-label text-xs uppercase font-bold">Cancel</button>
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
