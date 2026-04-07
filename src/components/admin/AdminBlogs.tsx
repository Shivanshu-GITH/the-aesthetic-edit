import React, { useState } from 'react';
import { Plus, Pencil, Trash2, X, Save, RefreshCw, Check, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAdminContext } from './AdminContext';
import { formatPrice } from '../../lib/currency';
import MultiImageUpload from '../MultiImageUpload';
import ImageUpload from '../ImageUpload';
import { clearFetchCache } from '../../hooks/useFetch';

export const AdminBlogs: React.FC = () => {
  const { 
    allBlogPosts, 
    allProducts,
    productPrices,
    blogCategories,
    updatingId, 
    adminFetch,
    refreshBlogPosts,
    isLoading,
    setIsLoading,
    showToast
  } = useAdminContext();

  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any>(null);
  const [blogFormErrors, setBlogFormErrors] = useState<Record<string, string>>({});
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [confirmDeleteBlogId, setConfirmDeleteBlogId] = useState<string | null>(null);

  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog) return;

    const errors: Record<string, string> = {};
    if (!editingBlog.title) errors.title = 'Title is required';
    if (!editingBlog.slug) errors.slug = 'Slug is required';
    if (!editingBlog.category) errors.category = 'Category name is required';
    if (!editingBlog.categorySlug) errors.categorySlug = 'Category slug is required';
    if (!editingBlog.excerpt) errors.excerpt = 'Excerpt is required';
    if (!editingBlog.content) errors.content = 'Content is required';
    if (!editingBlog.image) errors.image = 'Cover image URL is required';
    if (!editingBlog.author) errors.author = 'Author is required';
    if (!editingBlog.date) errors.date = 'Date is required';
    if (!editingBlog.readTime) errors.readTime = 'Read time is required';

    if (Object.keys(errors).length > 0) {
      setBlogFormErrors(errors);
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const isEdit = !!editingBlog.id;
      const url = isEdit ? `/api/blog/admin/posts/${editingBlog.id}` : '/api/blog/admin/posts';
      const method = isEdit ? 'PUT' : 'POST';

      const dataToSave = {
        ...editingBlog,
        date: formatDateForDisplay(editingBlog.date),
        images: Array.isArray(editingBlog.images) ? editingBlog.images : (editingBlog.image ? [editingBlog.image] : []),
        recommendedProducts: Array.isArray(editingBlog.recommendedProducts) ? editingBlog.recommendedProducts : [],
        relatedPosts: Array.isArray(editingBlog.relatedPosts) ? editingBlog.relatedPosts : [],
        isPublished: editingBlog.isPublished ?? true,
        sectionHeading: editingBlog.sectionHeading || null,
        sectionSubheading: editingBlog.sectionSubheading || null,
        sectionDescription: editingBlog.sectionDescription || null,
        sectionCtaText: editingBlog.sectionCtaText || null
      };

      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave)
      });

      if (res.ok) {
        setIsBlogModalOpen(false);
        setEditingBlog(null);
        showToast(`Blog post ${isEdit ? 'updated' : 'created'} successfully`, 'success');
        clearFetchCache();
        refreshBlogPosts();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to save blog post', 'error');
      }
    } catch (err) {
      showToast('Failed to save blog post', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await adminFetch(`/api/blog/admin/posts/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setConfirmDeleteBlogId(null);
        showToast('Blog post deleted', 'success');
        clearFetchCache();
        refreshBlogPosts();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to delete blog post', 'error');
      }
    } catch (err) {
      showToast('Failed to delete blog post', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBlogPublished = async (id: string) => {
    const post = allBlogPosts.find(p => p.id === id);
    if (!post) return;

    setIsLoading(true);
    try {
      const res = await adminFetch(`/api/blog/admin/posts/${id}/publish`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !post.isPublished })
      });
      if (res.ok) {
        showToast('Status updated', 'success');
        clearFetchCache();
        refreshBlogPosts();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || 'Failed to update status', 'error');
      }
    } catch (err) {
      showToast('Failed to update status', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-headline font-bold">Blog Posts</h2>
        <button 
          onClick={() => {
            setEditingBlog({ 
              isPublished: true, 
              author: 'Elena Muse', 
              date: new Date().toISOString().split('T')[0],
              recommendedProducts: [],
              sectionHeading: '',
              sectionSubheading: '',
              sectionDescription: '',
              sectionCtaText: ''
            });
            setBlogFormErrors({});
            setIsSlugManual(false);
            setIsBlogModalOpen(true);
          }}
          className="bg-primary text-white px-6 py-3 rounded-2xl font-label text-xs uppercase tracking-widest font-bold flex items-center gap-2 hover:bg-primary-hover transition-all"
        >
          <Plus size={18} /> New Post
        </button>
      </div>

      <div className="bg-white rounded-[40px] border border-outline-variant/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container/30 text-[10px] uppercase tracking-widest text-outline font-bold">
                <th className="px-8 py-4">Image</th>
                <th className="px-8 py-4">Title</th>
                <th className="px-8 py-4">Category</th>
                <th className="px-8 py-4">Author</th>
                <th className="px-8 py-4">Date</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {allBlogPosts.map((post) => (
                <tr key={post.id} className="group hover:bg-surface-container/10 transition-colors">
                  <td className="px-8 py-4">
                    <img src={post.image} className="w-10 h-10 rounded-lg object-cover" alt="" />
                  </td>
                  <td className="px-8 py-4">
                    <span className="text-sm font-bold block truncate max-w-50">{post.title}</span>
                  </td>
                  <td className="px-8 py-4 text-sm text-on-surface-variant">{post.category}</td>
                  <td className="px-8 py-4 text-sm text-on-surface-variant">{post.author}</td>
                  <td className="px-8 py-4 text-[10px] text-outline">{post.date}</td>
                  <td className="px-8 py-4">
                    <button 
                      onClick={() => handleToggleBlogPublished(post.id)}
                      disabled={updatingId === post.id}
                      className={`p-2 rounded-lg transition-colors ${post.isPublished ? 'text-green-600 bg-green-50' : 'text-outline bg-surface-container'}`}
                    >
                      {post.isPublished ? <Check size={18} /> : <FileText size={18} />}
                    </button>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => {
                          setEditingBlog({ 
                            ...post,
                            sectionHeading: post.sectionHeading || '',
                            sectionSubheading: post.sectionSubheading || '',
                            sectionDescription: post.sectionDescription || '',
                            sectionCtaText: post.sectionCtaText || ''
                          });
                          setBlogFormErrors({});
                          setIsSlugManual(true);
                          setIsBlogModalOpen(true);
                        }}
                        className="p-2 text-outline hover:text-primary transition-colors"
                      >
                        <Pencil size={18} />
                      </button>
                      {confirmDeleteBlogId === post.id ? (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleDeleteBlog(post.id)}
                            className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-red-100 transition-all"
                          >
                            Confirm
                          </button>
                          <button 
                            onClick={() => setConfirmDeleteBlogId(null)}
                            className="border border-outline-variant px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-surface-container transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setConfirmDeleteBlogId(post.id)}
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
        {isBlogModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBlogModalOpen(false)}
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[40px] border border-outline-variant/30 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col p-8"
            >
              <div className="border-b border-outline-variant/20 flex items-center justify-between pb-6 mb-8">
                <h3 className="text-2xl font-headline font-bold">
                  {editingBlog?.id ? 'Edit Blog Post' : 'New Blog Post'}
                </h3>
                <button 
                  onClick={() => setIsBlogModalOpen(false)}
                  className="p-2 hover:bg-surface-container rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSaveBlog} className="flex-1 overflow-y-auto space-y-8 pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2 md:col-span-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Title</label>
                    <input 
                      type="text"
                      value={editingBlog?.title || ''}
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        setEditingBlog((prev: any) => {
                          const updates: any = { title: newTitle };
                          if (!isSlugManual) {
                            updates.slug = newTitle.toLowerCase()
                              .replace(/[^a-z0-9\s-]/g, '')
                              .replace(/\s+/g, '-')
                              .trim();
                          }
                          return { ...prev, ...updates };
                        });
                      }}
                      placeholder="Post title"
                      className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-sm"
                    />
                    {blogFormErrors.title && <p className="text-[9px] text-red-500 uppercase font-bold tracking-widest">{blogFormErrors.title}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Slug (URL)</label>
                    <input 
                      type="text"
                      value={editingBlog?.slug || ''}
                      onChange={(e) => {
                        setIsSlugManual(true);
                        setEditingBlog((prev: any) => ({ ...prev, slug: e.target.value }));
                      }}
                      placeholder="post-slug-here"
                      className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-sm"
                    />
                    {blogFormErrors.slug && <p className="text-[9px] text-red-500 uppercase font-bold tracking-widest">{blogFormErrors.slug}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Category Name</label>
                    <input 
                      type="text"
                      value={editingBlog?.category || ''}
                      onChange={(e) => setEditingBlog((prev: any) => ({ ...prev, category: e.target.value }))}
                      placeholder="e.g. Style Guides"
                      className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-sm"
                    />
                    {blogFormErrors.category && <p className="text-[9px] text-red-500 uppercase font-bold tracking-widest">{blogFormErrors.category}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Category Slug</label>
                    <select 
                      value={editingBlog?.categorySlug || ''}
                      onChange={(e) => setEditingBlog((prev: any) => ({ ...prev, categorySlug: e.target.value }))}
                      className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-sm appearance-none"
                    >
                      <option value="">Select Category Slug</option>
                      {blogCategories.map((c: any) => <option key={c.id} value={c.slug}>{c.title}</option>)}
                    </select>
                    {blogFormErrors.categorySlug && <p className="text-[9px] text-red-500 uppercase font-bold tracking-widest">{blogFormErrors.categorySlug}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Read Time</label>
                    <input 
                      type="text"
                      value={editingBlog?.readTime || ''}
                      onChange={(e) => setEditingBlog((prev: any) => ({ ...prev, readTime: e.target.value }))}
                      placeholder="e.g. 5 min read"
                      className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-sm"
                    />
                    {blogFormErrors.readTime && <p className="text-[9px] text-red-500 uppercase font-bold tracking-widest">{blogFormErrors.readTime}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Author Name</label>
                    <input 
                      type="text"
                      value={editingBlog?.author || ''}
                      onChange={(e) => setEditingBlog((prev: any) => ({ ...prev, author: e.target.value }))}
                      placeholder="Author name"
                      className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-sm"
                    />
                    {blogFormErrors.author && <p className="text-[9px] text-red-500 uppercase font-bold tracking-widest">{blogFormErrors.author}</p>}
                  </div>

                  <div className="space-y-2">
                    <ImageUpload 
                      label="Author Image (Optional)"
                      value={editingBlog?.authorImage || ''}
                      onChange={(url) => setEditingBlog((prev: any) => ({ ...prev, authorImage: url }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Date</label>
                    <input 
                      type="date"
                      value={formatDateForInput(editingBlog?.date)}
                      onChange={(e) => setEditingBlog((prev: any) => ({ ...prev, date: e.target.value }))}
                      className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-sm"
                    />
                    {blogFormErrors.date && <p className="text-[9px] text-red-500 uppercase font-bold tracking-widest">{blogFormErrors.date}</p>}
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <MultiImageUpload 
                      label="Post Images (First will be main cover)" 
                      value={editingBlog?.images || (editingBlog?.image ? [editingBlog.image] : [])} 
                      onChange={(urls) => setEditingBlog((prev: any) => ({ 
                        ...prev, 
                        images: urls,
                        image: urls[0] || '' 
                      }))} 
                    />
                    {blogFormErrors.image && <p className="text-[9px] text-red-500 uppercase font-bold tracking-widest">{blogFormErrors.image}</p>}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Excerpt</label>
                    <textarea 
                      rows={2}
                      value={editingBlog?.excerpt || ''}
                      onChange={(e) => setEditingBlog((prev: any) => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="1-3 sentences summary..."
                      className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-sm resize-none"
                    />
                    {blogFormErrors.excerpt && <p className="text-[9px] text-red-500 uppercase font-bold tracking-widest">{blogFormErrors.excerpt}</p>}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Post Content (Markdown supported)</label>
                    <textarea 
                      rows={12}
                      value={editingBlog?.content || ''}
                      onChange={(e) => setEditingBlog((prev: any) => ({ ...prev, content: e.target.value }))}
                      placeholder="Markdown content..."
                      className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-sm min-h-75"
                    />
                    {blogFormErrors.content && <p className="text-[9px] text-red-500 uppercase font-bold tracking-widest">{blogFormErrors.content}</p>}
                  </div>

                  <div className="space-y-6 md:col-span-2 border-t border-outline-variant/10 pt-8">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline flex items-center gap-2">
                      <Plus size={16} className="text-primary" /> Recommended Products Section
                    </label>
                    
                    {/* Section Content Customization */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-surface-container/30 rounded-3xl border border-outline-variant/20">
                      <div className="space-y-2">
                        <label className="font-label text-[10px] uppercase tracking-widest font-bold text-outline">Section Subheading (e.g. CURATED PICKS)</label>
                        <input 
                          type="text"
                          value={editingBlog?.sectionSubheading || ''}
                          onChange={(e) => setEditingBlog((prev: any) => ({ ...prev, sectionSubheading: e.target.value }))}
                          placeholder="CURATED PICKS"
                          className="px-4 py-2.5 rounded-xl bg-white border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-label text-[10px] uppercase tracking-widest font-bold text-outline">Section Heading (e.g. Complete the Look)</label>
                        <input 
                          type="text"
                          value={editingBlog?.sectionHeading || ''}
                          onChange={(e) => setEditingBlog((prev: any) => ({ ...prev, sectionHeading: e.target.value }))}
                          placeholder="Complete the Look"
                          className="px-4 py-2.5 rounded-xl bg-white border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-xs"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="font-label text-[10px] uppercase tracking-widest font-bold text-outline">Section Description</label>
                        <textarea 
                          rows={2}
                          value={editingBlog?.sectionDescription || ''}
                          onChange={(e) => setEditingBlog((prev: any) => ({ ...prev, sectionDescription: e.target.value }))}
                          placeholder="Hand-selected pieces that perfectly complement your current aesthetic..."
                          className="px-4 py-2.5 rounded-xl bg-white border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-xs resize-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-label text-[10px] uppercase tracking-widest font-bold text-outline">Section CTA Text</label>
                        <input 
                          type="text"
                          value={editingBlog?.sectionCtaText || ''}
                          onChange={(e) => setEditingBlog((prev: any) => ({ ...prev, sectionCtaText: e.target.value }))}
                          placeholder="VIEW ALL COLLECTION"
                          className="px-4 py-2.5 rounded-xl bg-white border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-75 overflow-y-auto p-4 border border-outline-variant/20 rounded-2xl bg-surface-container/20">
                      {allProducts.filter((p: any) => p.isActive).map((p: any) => {
                        const isSelected = editingBlog?.recommendedProducts?.includes(p.id);
                        return (
                          <label key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-outline-variant/20 cursor-pointer hover:border-primary transition-all">
                            <input 
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                const current = editingBlog?.recommendedProducts || [];
                                const next = e.target.checked 
                                  ? [...current, p.id] 
                                  : current.filter((id: any) => id !== p.id);
                                setEditingBlog((prev: any) => ({ ...prev, recommendedProducts: next }));
                              }}
                              className="w-4 h-4 rounded border-outline-variant/30 text-primary focus:ring-primary"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold truncate">{p.title}</p>
                              <p className="text-[9px] text-primary">{productPrices[p.id] || formatPrice(p.price)}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Related Blogs Section */}
                  <div className="space-y-6 md:col-span-2 border-t border-outline-variant/10 pt-8">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline flex items-center gap-2">
                      <Plus size={16} className="text-primary" /> Related Blogs Section (Bottom)
                    </label>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-75 overflow-y-auto p-4 border border-outline-variant/20 rounded-2xl bg-surface-container/20">
                      {allBlogPosts.filter((b: any) => b.id !== editingBlog?.id).map((b: any) => {
                        const isSelected = editingBlog?.relatedPosts?.includes(b.id);
                        return (
                          <label key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-outline-variant/20 cursor-pointer hover:border-primary transition-all">
                            <input 
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                const current = editingBlog?.relatedPosts || [];
                                const next = e.target.checked 
                                  ? [...current, b.id] 
                                  : current.filter((id: any) => id !== b.id);
                                setEditingBlog((prev: any) => ({ ...prev, relatedPosts: next }));
                              }}
                              className="w-4 h-4 rounded border-outline-variant/30 text-primary focus:ring-primary"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold truncate">{b.title}</p>
                              <p className="text-[9px] text-outline truncate">{b.category}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="border-t border-outline-variant/20 pt-8 mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="flex gap-4 w-full sm:w-auto ml-auto">
                    <button 
                      type="button"
                      onClick={() => setIsBlogModalOpen(false)}
                      className="border border-outline-variant px-4 py-2 rounded-xl font-label text-xs uppercase tracking-widest font-bold hover:bg-surface-container transition-all flex-1 sm:flex-none"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={isLoading}
                      className="bg-primary text-white px-6 py-3 rounded-2xl font-label text-xs uppercase tracking-widest font-bold hover:bg-primary-hover transition-all flex items-center justify-center gap-2 disabled:opacity-50 flex-1 sm:flex-none"
                    >
                      {isLoading ? <RefreshCw size={16} className="animate-spin" /> : <><Save size={16} /> Save Post</>}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
