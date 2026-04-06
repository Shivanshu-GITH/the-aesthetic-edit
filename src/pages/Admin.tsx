import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, ExternalLink, MessageCircle, ArrowRight, Save, ShieldCheck, ShoppingBag, Eye, EyeOff, RefreshCw, LayoutDashboard, FileText, FolderTree, Users, LogOut, Pencil, Trash2, X, Plus, Check, Settings } from 'lucide-react';
import { formatPrice } from '../lib/currency';
import { Product } from '../types';
import { useToast } from '../context/ToastContext';
import ImageUpload from '../components/ImageUpload';
import MultiImageUpload from '../components/MultiImageUpload';
import { PRODUCT_CATEGORIES as CATEGORIES, SUB_CATEGORIES, VIBES } from '../lib/constants';
import { clearFetchCache } from '../hooks/useFetch';

interface AnalyticsData {
  totalLeads: number;
  totalClicks: number;
  totalSaves: number;
  topClickedProducts: (Product & { clicks: number })[];
  topPinterestSaved: (Product & { saves: number })[];
  recentLeads: { id: string; name: string; email: string; is_confirmed: number; created_at: string }[];
  allProducts: Product[];
}

type TabType = 'analytics' | 'products' | 'blogs' | 'categories' | 'shop-categories' | 'home-config' | 'site-config' | 'leads';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [productPrices, setProductPrices] = useState<Record<string, string>>({});
  
  const [activeTab, setActiveTab] = useState<TabType>('analytics');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allBlogPosts, setAllBlogPosts] = useState<any[]>([]);
  const [blogCategories, setBlogCategories] = useState<any[]>([]);
  const [allLeads, setAllLeads] = useState<any[]>([]);
  const [shopCategories, setShopCategories] = useState<any[]>([]);
  const [moods, setMoods] = useState<any[]>([]);
  const [findHereItems, setFindHereItems] = useState<any[]>([]);
  const [siteConfigs, setSiteConfigs] = useState<Record<string, string>>({});
  const { showToast } = useToast();

  useEffect(() => {
    const productsToFormat = [...(data?.topClickedProducts || []), ...allProducts];
    if (productsToFormat.length > 0) {
      const initialPrices: Record<string, string> = {};
      productsToFormat.forEach(p => {
        initialPrices[p.id] = formatPrice(p.price);
      });
      setProductPrices(prev => ({ ...prev, ...initialPrices }));

      import('../lib/currency').then(({ formatPriceAsync }) => {
        productsToFormat.forEach(p => {
          formatPriceAsync(p.price).then(price => {
            setProductPrices(prev => ({ ...prev, [p.id]: price }));
          });
        });
      });
    }
  }, [data?.topClickedProducts, allProducts]);

  // Product Form State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Blog Post Form State
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const initialBlogState = {
    title: '',
    slug: '',
    category: '',
    categorySlug: '',
    excerpt: '',
    content: '',
    image: '',
    images: [],
    author: '',
    date: new Date().toISOString().split('T')[0],
    readTime: '',
    recommendedProducts: [],
    relatedPosts: [],
    isPublished: true
  };
  const [editingBlog, setEditingBlog] = useState<any>(initialBlogState);
  const [blogFormErrors, setBlogFormErrors] = useState<Record<string, string>>({});
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [confirmDeleteBlogId, setConfirmDeleteBlogId] = useState<string | null>(null);

  // Helper to format date for input (Readable -> YYYY-MM-DD)
  const formatDateForInput = (dateStr: any) => {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    if (typeof dateStr !== 'string') return new Date().toISOString().split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return new Date().toISOString().split('T')[0];
      return date.toISOString().split('T')[0];
    } catch (e) {
      return new Date().toISOString().split('T')[0];
    }
  };

  // Helper to format date for display (YYYY-MM-DD -> Readable)
  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Blog Category Form State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>({
    title: '', slug: '', image: '', description: ''
  });
  const [categoryFormErrors, setCategoryFormErrors] = useState<Record<string, string>>({});
  const [isCategorySlugManual, setIsCategorySlugManual] = useState(false);
  const [confirmDeleteCategoryId, setConfirmDeleteCategoryId] = useState<string | null>(null);

  // Shop Category Form State
  const [isShopCategoryModalOpen, setIsShopCategoryModalOpen] = useState(false);
  const [editingShopCategory, setEditingShopCategory] = useState<any>({
    title: '', icon: '', sub_categories: []
  });
  const [shopCategoryFormErrors, setShopCategoryFormErrors] = useState<Record<string, string>>({});
  const [confirmDeleteShopCategoryId, setConfirmDeleteShopCategoryId] = useState<string | null>(null);

  // Home Mood Form State
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [editingMood, setEditingMood] = useState<any>({
    name: '', slug: '', vibe: '', image: '', count: '', linked_shop_category_id: ''
  });
  const [moodFormErrors, setMoodFormErrors] = useState<Record<string, string>>({});
  const [confirmDeleteMoodId, setConfirmDeleteMoodId] = useState<string | null>(null);

  // Home Find Here Form State
  const [isFindHereModalOpen, setIsFindHereModalOpen] = useState(false);
  const [editingFindHere, setEditingFindHere] = useState<any>({
    title: '', description: '', image: '', linked_blog_category_slug: ''
  });
  const [findHereFormErrors, setFindHereFormErrors] = useState<Record<string, string>>({});
  const [confirmDeleteFindHereId, setConfirmDeleteFindHereId] = useState<string | null>(null);

  const [customVibe, setCustomVibe] = useState('');

  useEffect(() => {
    if (confirmDeleteId) {
      const timer = setTimeout(() => setConfirmDeleteId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [confirmDeleteId]);

  useEffect(() => {
    if (confirmDeleteBlogId) {
      const timer = setTimeout(() => setConfirmDeleteBlogId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [confirmDeleteBlogId]);

  useEffect(() => {
    if (confirmDeleteCategoryId) {
      const timer = setTimeout(() => setConfirmDeleteCategoryId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [confirmDeleteCategoryId]);

  useEffect(() => {
    if (confirmDeleteShopCategoryId) {
      const timer = setTimeout(() => setConfirmDeleteShopCategoryId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [confirmDeleteShopCategoryId]);

  useEffect(() => {
    if (confirmDeleteMoodId) {
      const timer = setTimeout(() => setConfirmDeleteMoodId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [confirmDeleteMoodId]);

  useEffect(() => {
    if (confirmDeleteFindHereId) {
      const timer = setTimeout(() => setConfirmDeleteFindHereId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [confirmDeleteFindHereId]);

  const adminFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const pwd = sessionStorage.getItem('ae_admin_auth');
    const headers = {
      ...options.headers,
      'ADMIN_PASSWORD': pwd || '',
    };
    return fetch(url, { ...options, headers });
  }, []);

  const refreshProducts = async () => {
    const pwd = sessionStorage.getItem('ae_admin_auth');
    if (!pwd) return;
    try {
      const res = await fetch('/api/products/admin/all', { headers: { 'ADMIN_PASSWORD': pwd } });
      if (res.ok) {
        const data = await res.json();
        setAllProducts(data.data);
      }
    } catch (err) {
      console.error('Failed to refresh products', err);
    }
  };

  const refreshBlogPosts = async () => {
    const pwd = sessionStorage.getItem('ae_admin_auth');
    if (!pwd) return;
    try {
      const res = await fetch('/api/blog/admin/posts', { headers: { 'ADMIN_PASSWORD': pwd } });
      if (res.ok) {
        const data = await res.json();
        setAllBlogPosts(data.data);
      }
    } catch (err) {
      console.error('Failed to refresh blog posts', err);
    }
  };

  const refreshBlogCategories = async () => {
    const pwd = sessionStorage.getItem('ae_admin_auth');
    if (!pwd) return;
    try {
      const res = await fetch('/api/blog/admin/categories', { headers: { 'ADMIN_PASSWORD': pwd } });
      if (res.ok) {
        const data = await res.json();
        setBlogCategories(data.data);
      }
    } catch (err) {
      console.error('Failed to refresh blog categories', err);
    }
  };

  const refreshLeads = async () => {
    const pwd = sessionStorage.getItem('ae_admin_auth');
    if (!pwd) return;
    try {
      const res = await fetch('/api/leads/admin/all', { headers: { 'ADMIN_PASSWORD': pwd } });
      if (res.ok) {
        const data = await res.json();
        setAllLeads(data.data);
      }
    } catch (err) {
      console.error('Failed to refresh leads', err);
    }
  };

  const refreshShopCategories = async () => {
    const pwd = sessionStorage.getItem('ae_admin_auth');
    if (!pwd) return;
    try {
      const res = await fetch('/api/home-shop/admin/shop-categories', { headers: { 'ADMIN_PASSWORD': pwd } });
      if (res.ok) {
        const data = await res.json();
        setShopCategories(data.data);
      }
    } catch (err) {
      console.error('Failed to refresh shop categories', err);
    }
  };

  const refreshMoods = async () => {
    const pwd = sessionStorage.getItem('ae_admin_auth');
    if (!pwd) return;
    try {
      const res = await fetch('/api/home-shop/admin/moods', { headers: { 'ADMIN_PASSWORD': pwd } });
      if (res.ok) {
        const data = await res.json();
        setMoods(data.data);
      }
    } catch (err) {
      console.error('Failed to refresh moods', err);
    }
  };

  const refreshFindHere = async () => {
    const pwd = sessionStorage.getItem('ae_admin_auth');
    if (!pwd) return;
    try {
      const res = await fetch('/api/home-shop/admin/find-here', { headers: { 'ADMIN_PASSWORD': pwd } });
      if (res.ok) {
        const data = await res.json();
        setFindHereItems(data.data);
      }
    } catch (err) {
      console.error('Failed to refresh find-here items', err);
    }
  };

  const refreshSiteConfig = async () => {
    try {
      const res = await fetch('/api/home-shop/config');
      if (res.ok) {
        const data = await res.json();
        setSiteConfigs(data.data);
      }
    } catch (err) {
      console.error('Failed to refresh site config', err);
    }
  };

  const handleSaveSiteConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await adminFetch('/api/home-shop/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteConfigs)
      });
      if (res.ok) {
        showToast('Site configuration updated', 'success');
      } else {
        showToast('Failed to update site configuration', 'error');
      }
    } catch (err) {
      showToast('Failed to update site configuration', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDashboard = async (pwd: string) => {
    setIsLoading(true);
    setError(''); // Clear previous error
    try {
      const headers = { 'ADMIN_PASSWORD': pwd };
      const [analyticsRes, productsRes, blogPostsRes, blogCategoriesRes, leadsRes, shopCategoriesRes, moodsRes, findHereRes, configRes] = await Promise.all([
        fetch('/api/analytics/summary', { headers }),
        fetch('/api/products/admin/all', { headers }),
        fetch('/api/blog/admin/posts', { headers }),
        fetch('/api/blog/admin/categories', { headers }),
        fetch('/api/leads/admin/all', { headers }),
        fetch('/api/home-shop/admin/shop-categories', { headers }),
        fetch('/api/home-shop/admin/moods', { headers }),
        fetch('/api/home-shop/admin/find-here', { headers }),
        fetch('/api/home-shop/config')
      ]);

      if (analyticsRes.ok && productsRes.ok && blogPostsRes.ok && blogCategoriesRes.ok && leadsRes.ok && shopCategoriesRes.ok && moodsRes.ok && findHereRes.ok && configRes.ok) {
        const [analyticsData, productsData, blogPostsData, blogCategoriesData, leadsData, shopCategoriesData, moodsData, findHereData, configData] = await Promise.all([
          analyticsRes.json().catch(() => ({ data: null })),
          productsRes.json().catch(() => ({ data: [] })),
          blogPostsRes.json().catch(() => ({ data: [] })),
          blogCategoriesRes.json().catch(() => ({ data: [] })),
          leadsRes.json().catch(() => ({ data: [] })),
          shopCategoriesRes.json().catch(() => ({ data: [] })),
          moodsRes.json().catch(() => ({ data: [] })),
          findHereRes.json().catch(() => ({ data: [] })),
          configRes.json().catch(() => ({ data: {} }))
        ]);

        setData(analyticsData.data);
        setAllProducts(productsData.data || []);
        setAllBlogPosts(blogPostsData.data || []);
        setBlogCategories(blogCategoriesData.data || []);
        setAllLeads(leadsData.data || []);
        setShopCategories(shopCategoriesData.data || []);
        setMoods(moodsData.data || []);
        setFindHereItems(findHereData.data || []);
        setSiteConfigs(configData.data || {});
        
        setIsAuthenticated(true);
        sessionStorage.setItem('ae_admin_auth', pwd);
      } else {
        // Try to get error from any of the failed responses
        const failedRes = [analyticsRes, productsRes, blogPostsRes, blogCategoriesRes, leadsRes, shopCategoriesRes, moodsRes, findHereRes].find(r => !r.ok);
        const errorData = await failedRes?.json().catch(() => ({}));
        setError(errorData?.error || 'Unauthorized: Invalid password');
        sessionStorage.removeItem('ae_admin_auth');
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to fetch dashboard. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const auth = sessionStorage.getItem('ae_admin_auth');
    if (auth) {
      fetchDashboard(auth);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDashboard(password);
  };

  const handleUpdateAffiliateUrl = async (id: string, url: string) => {
    setUpdatingId(id);
    try {
      await adminFetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ affiliateUrl: url })
      });
      showToast('Product URL updated', 'success');
      clearFetchCache();
      refreshProducts();
    } catch (err) {
      showToast('Failed to update URL', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleActive = async (id: string) => {
    setUpdatingId(id);
    try {
      await adminFetch(`/api/products/${id}/toggle-active`, {
        method: 'PATCH'
      });
      showToast('Visibility updated', 'success');
      clearFetchCache();
      refreshProducts();
    } catch (err) {
      showToast('Failed to toggle status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    // Validation
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
        vibes: editingProduct.vibe // backend expects 'vibes' field in create/update
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
        setIsProductModalOpen(false);
        setEditingProduct(null);
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

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog) return;

    // Validation
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
        isPublished: editingBlog.isPublished ?? true
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
        setIsBlogModalOpen(false);
        setEditingBlog(null);
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
        setIsCategoryModalOpen(false);
        setEditingCategory(null);
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

  const handleSaveShopCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShopCategory) return;
    const errors: Record<string, string> = {};
    if (!editingShopCategory.title) errors.title = 'Title is required';
    if (!editingShopCategory.slug) errors.slug = 'Slug is required';
    if (Object.keys(errors).length > 0) { setShopCategoryFormErrors(errors); return; }
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
        showToast(`Shop category ${isEdit ? 'updated' : 'created'} successfully`, 'success');
        refreshShopCategories();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to save shop category', 'error');
      }
    } catch (err) { showToast('Failed to save shop category', 'error'); } finally { setIsLoading(false); }
  };

  const handleDeleteShopCategory = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await adminFetch(`/api/home-shop/admin/shop-categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Shop category deleted', 'success');
        refreshShopCategories();
      }
    } catch (err) { showToast('Failed to delete shop category', 'error'); } finally { setIsLoading(false); }
  };

  const handleSaveMood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMood) return;
    const errors: Record<string, string> = {};
    if (!editingMood.name) errors.name = 'Name is required';
    if (!editingMood.slug) errors.slug = 'Slug is required';
    if (!editingMood.image) errors.image = 'Image is required';
    if (Object.keys(errors).length > 0) { setMoodFormErrors(errors); return; }
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
        refreshMoods();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to save mood', 'error');
      }
    } catch (err) { showToast('Failed to save mood', 'error'); } finally { setIsLoading(false); }
  };

  const handleDeleteMood = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await adminFetch(`/api/home-shop/admin/moods/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Mood deleted', 'success');
        refreshMoods();
      }
    } catch (err) { showToast('Failed to delete mood', 'error'); } finally { setIsLoading(false); }
  };

  const handleSaveFindHere = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFindHere) return;
    const errors: Record<string, string> = {};
    if (!editingFindHere.title) errors.title = 'Title is required';
    if (!editingFindHere.image) errors.image = 'Image is required';
    if (Object.keys(errors).length > 0) { setFindHereFormErrors(errors); return; }
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
        refreshFindHere();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to save item', 'error');
      }
    } catch (err) { showToast('Failed to save item', 'error'); } finally { setIsLoading(false); }
  };

  const handleDeleteFindHere = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await adminFetch(`/api/home-shop/admin/find-here/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Item deleted', 'success');
        refreshFindHere();
      }
    } catch (err) { showToast('Failed to delete item', 'error'); } finally { setIsLoading(false); }
  };

  const handleToggleBlogPublished = async (id: string) => {
    setUpdatingId(id);
    try {
      const post = allBlogPosts.find(p => p.id === id);
      if (!post) return;

      const newStatus = !post.isPublished;
      
      // We need to send the full post data to the update endpoint as there's no dedicated toggle endpoint for blogs
      const body = {
        ...post,
        isPublished: newStatus
      };

      await adminFetch(`/api/blog/admin/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      showToast('Publish status updated', 'success');
      clearFetchCache();
      refreshBlogPosts();
    } catch (err) {
      showToast('Failed to update status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const maskEmail = (email: string) => {
    const [name, domain] = email.split('@');
    return `${name[0]}***@${domain}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-6">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[40px] border border-outline-variant/30 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-accent-blush rounded-2xl flex items-center justify-center mx-auto text-primary mb-4">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-3xl font-headline font-bold">Admin Portal</h1>
            <p className="text-on-surface-variant font-body">Enter your password to access the dashboard.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-6 py-4 rounded-2xl bg-surface-container/50 border border-outline-variant/30 focus:outline-none focus:border-primary transition-all font-mono"
              />
              {error && <p className="text-xs text-red-500 font-label uppercase tracking-widest ml-1">{error}</p>}
            </div>
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-4 rounded-2xl font-label text-sm uppercase tracking-widest font-bold hover:bg-primary-hover transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? <RefreshCw size={18} className="animate-spin" /> : 'Enter Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!data) return <div className="min-h-screen bg-surface flex items-center justify-center"><RefreshCw className="animate-spin text-primary" /></div>;

  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: ShoppingBag },
    { id: 'blogs', label: 'Blog Posts', icon: FileText },
    { id: 'categories', label: 'Blog Categories', icon: FolderTree },
    { id: 'shop-categories', label: 'Shop Categories', icon: FolderTree },
    { id: 'home-config', label: 'Home Config', icon: LayoutDashboard },
    { id: 'site-config', label: 'Site Config', icon: Settings },
    { id: 'leads', label: 'Leads', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-surface-container-low flex flex-col md:flex-row font-body">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 bg-white border-r border-outline-variant/30 p-6 flex flex-col gap-8">
        <div className="space-y-1">
          <span className="font-label text-[10px] uppercase tracking-[0.3em] text-primary font-bold">Admin Panel</span>
          <h2 className="text-xl font-headline font-bold">Aesthetic Edit</h2>
        </div>

        <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-4 md:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-label text-xs uppercase tracking-widest font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-outline hover:bg-surface-container/50 hover:text-primary'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-outline-variant/20 hidden md:block">
          <button 
            onClick={() => {
              sessionStorage.removeItem('ae_admin_auth');
              window.location.reload();
            }}
            className="flex items-center gap-3 px-4 py-3 w-full text-outline hover:text-primary font-label text-[10px] uppercase tracking-widest font-bold transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex justify-between items-center md:hidden mb-8">
            <h1 className="text-2xl font-headline font-bold capitalize">{activeTab}</h1>
            <button 
              onClick={() => {
                sessionStorage.removeItem('ae_admin_auth');
                window.location.reload();
              }}
              className="text-outline hover:text-primary"
            >
              <LogOut size={20} />
            </button>
          </div>

          {activeTab === 'analytics' && (
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { label: 'Total Leads', value: data.totalLeads, icon: Mail, color: 'bg-blue-50 text-blue-600' },
                  { label: 'Affiliate Clicks', value: data.totalClicks, icon: ExternalLink, color: 'bg-green-50 text-green-600' },
                  { label: 'Pinterest Saves', value: data.totalSaves, icon: Save, color: 'bg-red-50 text-red-600' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white p-8 rounded-4xl border border-outline-variant/30 shadow-sm flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.color}`}>
                      <stat.icon size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-label uppercase tracking-widest text-outline font-bold">{stat.label}</p>
                      <p className="text-4xl font-headline font-bold mt-1">{stat.value.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Top Products Table */}
                <div className="bg-white rounded-[40px] border border-outline-variant/30 shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-outline-variant/20 flex items-center justify-between">
                    <h2 className="text-xl font-headline font-bold flex items-center gap-3">
                      <ExternalLink size={20} className="text-primary" /> Top Products by Clicks
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-surface-container/30 text-[10px] uppercase tracking-widest text-outline font-bold">
                          <th className="px-8 py-4">Product</th>
                          <th className="px-8 py-4">Clicks</th>
                          <th className="px-8 py-4">Affiliate URL</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/10">
                        {data.topClickedProducts.map((p) => (
                          <tr key={p.id} className="group hover:bg-surface-container/10 transition-colors">
                            <td className="px-8 py-4">
                              <div className="flex items-center gap-4">
                                <img src={p.image} className="w-10 h-10 rounded-lg object-cover" alt="" />
                                <span className="text-sm font-bold truncate max-w-37.5">{p.title}</span>
                              </div>
                            </td>
                            <td className="px-8 py-4 text-sm font-bold text-primary">{p.clicks}</td>
                            <td className="px-8 py-4">
                              <div className="flex gap-2">
                                <input 
                                  type="text" 
                                  defaultValue={p.affiliateUrl}
                                  onBlur={(e) => handleUpdateAffiliateUrl(p.id, e.target.value)}
                                  className="bg-surface-container/50 border border-outline-variant/20 px-3 py-1.5 rounded-lg text-[10px] w-full focus:outline-none focus:border-primary"
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent Leads Summary */}
                <div className="bg-white rounded-[40px] border border-outline-variant/30 shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-outline-variant/20 flex items-center justify-between">
                    <h2 className="text-xl font-headline font-bold flex items-center gap-3">
                      <Mail size={20} className="text-primary" /> Recent Leads
                    </h2>
                  </div>
                  <div className="p-8 space-y-6">
                    {data.recentLeads.slice(0, 5).map((lead) => (
                      <div key={lead.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-accent-blush rounded-full flex items-center justify-center text-primary font-bold text-xs">
                            {lead.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold">{lead.name}</p>
                            <p className="text-[10px] text-outline">{maskEmail(lead.email)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded-full ${lead.is_confirmed ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                            {lead.is_confirmed ? 'Confirmed' : 'Pending'}
                          </span>
                          <p className="text-[9px] text-outline mt-1">{new Date(lead.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                    <button 
                      onClick={() => setActiveTab('leads')}
                      className="w-full text-center text-xs font-label uppercase tracking-widest text-primary font-bold hover:underline"
                    >
                      View All Leads
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Visibility Manager Summary */}
              <div className="bg-white rounded-[40px] border border-outline-variant/30 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-outline-variant/20 flex items-center justify-between">
                  <h2 className="text-xl font-headline font-bold flex items-center gap-3">
                    <ShoppingBag size={20} className="text-primary" /> Product Visibility Manager
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-8">
                  {data.allProducts.slice(0, 8).map((p) => (
                    <div key={p.id} className="p-4 rounded-3xl border border-outline-variant/20 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={p.image} className="w-12 h-12 rounded-xl object-cover shrink-0" alt="" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{p.title}</p>
                          <p className="text-[10px] text-primary">{productPrices[p.id] || formatPrice(p.price)}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleToggleActive(p.id)}
                        disabled={updatingId === p.id}
                        className={`p-2 rounded-lg transition-colors ${p.isActive ? 'text-green-600 bg-green-50' : 'text-outline bg-surface-container'}`}
                      >
                        {p.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                    </div>
                  ))}
                </div>
                <div className="p-8 pt-0 text-center">
                  <button 
                    onClick={() => setActiveTab('products')}
                    className="text-xs font-label uppercase tracking-widest text-primary font-bold hover:underline"
                  >
                    Manage All Products
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
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
            </div>
          )}

          {activeTab === 'blogs' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-headline font-bold">Blog Posts</h2>
                <button 
                  onClick={() => {
                    setEditingBlog({ 
                      isPublished: true, 
                      author: 'Elena Muse', 
                      date: new Date().toISOString().split('T')[0],
                      recommendedProducts: []
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
                                  setEditingBlog({ ...post });
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
            </div>
          )}

          {activeTab === 'categories' && (
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
            </div>
          )}

          {activeTab === 'shop-categories' && (
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
                      {shopCategories.map((cat) => (
                        <tr key={cat.id} className="group hover:bg-surface-container/10 transition-colors">
                          <td className="px-8 py-4 font-bold">{cat.title}</td>
                          <td className="px-8 py-4 text-sm text-outline">{cat.slug}</td>
                          <td className="px-8 py-4">
                            <div className="flex flex-wrap gap-1">
                              {cat.sub_categories?.map((sub: string) => (
                                <span key={sub} className="bg-surface-container px-2 py-0.5 rounded text-[9px] uppercase tracking-widest font-bold text-outline">
                                  {sub}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-8 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => {
                                  setEditingShopCategory(cat);
                                  setShopCategoryFormErrors({});
                                  setIsShopCategoryModalOpen(true);
                                }}
                                className="p-2 text-outline hover:text-primary transition-colors"
                              >
                                <Pencil size={18} />
                              </button>
                              {confirmDeleteShopCategoryId === cat.id ? (
                                <div className="flex gap-2">
                                  <button onClick={() => handleDeleteShopCategory(cat.id)} className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-[9px] font-bold uppercase">Confirm</button>
                                  <button onClick={() => setConfirmDeleteShopCategoryId(null)} className="border border-outline-variant px-3 py-1 rounded-lg text-[9px] font-bold uppercase">Cancel</button>
                                </div>
                              ) : (
                                <button onClick={() => setConfirmDeleteShopCategoryId(cat.id)} className="p-2 text-outline hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'home-config' && (
            <div className="space-y-12">
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-headline font-bold">Browse by Mood</h2>
                  <button 
                    onClick={() => {
                      setEditingMood({});
                      setMoodFormErrors({});
                      setIsMoodModalOpen(true);
                    }}
                    className="bg-primary text-white px-6 py-3 rounded-2xl font-label text-xs uppercase tracking-widest font-bold flex items-center gap-2 hover:bg-primary-hover transition-all"
                  >
                    <Plus size={18} /> Add Mood
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {moods.map((mood) => (
                    <div key={mood.id} className="bg-white p-6 rounded-4xl border border-outline-variant/30 shadow-sm space-y-4 group">
                      <div className="relative aspect-4/5 overflow-hidden rounded-2xl">
                        <img src={mood.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute top-4 right-4 bg-white/90 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-primary">{mood.count}</div>
                      </div>
                      <div>
                        <h3 className="text-lg font-headline font-bold">{mood.name}</h3>
                        <p className="text-xs text-outline uppercase tracking-widest">{mood.vibe}</p>
                        {mood.linked_shop_category_id && (
                          <div className="mt-2 text-[10px] text-primary font-bold uppercase tracking-widest">
                            Linked: {shopCategories.find(c => c.id === mood.linked_shop_category_id)?.title}
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/10">
                        <button 
                          onClick={() => { setEditingMood(mood); setMoodFormErrors({}); setIsMoodModalOpen(true); }}
                          className="p-2 text-outline hover:text-primary transition-colors"
                        >
                          <Pencil size={18} />
                        </button>
                        {confirmDeleteMoodId === mood.id ? (
                          <div className="flex gap-2">
                            <button onClick={() => handleDeleteMood(mood.id)} className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-[9px] font-bold uppercase">Confirm</button>
                            <button onClick={() => setConfirmDeleteMoodId(null)} className="border border-outline-variant px-3 py-1 rounded-lg text-[9px] font-bold uppercase">Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDeleteMoodId(mood.id)} className="p-2 text-outline hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-8 pt-12 border-t border-outline-variant/20">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-headline font-bold">What You'll Find Here</h2>
                  <button 
                    onClick={() => {
                      setEditingFindHere({});
                      setFindHereFormErrors({});
                      setIsFindHereModalOpen(true);
                    }}
                    className="bg-primary text-white px-6 py-3 rounded-2xl font-label text-xs uppercase tracking-widest font-bold flex items-center gap-2 hover:bg-primary-hover transition-all"
                  >
                    <Plus size={18} /> Add Item
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {findHereItems.map((item) => (
                    <div key={item.id} className="bg-white p-6 rounded-4xl border border-outline-variant/30 shadow-sm flex gap-6 group">
                      <div className="w-32 h-32 shrink-0 overflow-hidden rounded-2xl">
                        <img src={item.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="text-lg font-headline font-bold">{item.title}</h3>
                        <p className="text-sm text-on-surface-variant line-clamp-2">{item.description}</p>
                        {item.linked_blog_category_slug && (
                          <div className="text-[10px] text-primary font-bold uppercase tracking-widest">
                            Links to blog: {item.linked_blog_category_slug}
                          </div>
                        )}
                        <div className="flex justify-end gap-2 pt-2">
                          <button 
                            onClick={() => { setEditingFindHere(item); setFindHereFormErrors({}); setIsFindHereModalOpen(true); }}
                            className="p-2 text-outline hover:text-primary transition-colors"
                          >
                            <Pencil size={18} />
                          </button>
                          {confirmDeleteFindHereId === item.id ? (
                            <div className="flex gap-2">
                              <button onClick={() => handleDeleteFindHere(item.id)} className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-[9px] font-bold uppercase">Confirm</button>
                              <button onClick={() => setConfirmDeleteFindHereId(null)} className="border border-outline-variant px-3 py-1 rounded-lg text-[9px] font-bold uppercase">Cancel</button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmDeleteFindHereId(item.id)} className="p-2 text-outline hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'site-config' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-headline font-bold">Site Configuration</h2>
                <button 
                  onClick={handleSaveSiteConfig}
                  className="bg-primary text-white px-6 py-3 rounded-2xl font-label text-xs uppercase tracking-widest font-bold flex items-center gap-2 hover:bg-primary-hover transition-all"
                >
                  <Save size={18} /> Save Changes
                </button>
              </div>

              <div className="bg-white rounded-[40px] border border-outline-variant/30 shadow-sm p-10">
                <form className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Home Hero Title Line 1</label>
                      <input 
                        type="text" 
                        value={siteConfigs.home_hero_title_line1 || ''} 
                        onChange={(e) => setSiteConfigs(prev => ({ ...prev, home_hero_title_line1: e.target.value }))}
                        className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Home Hero Title Line 2 (Italic)</label>
                      <input 
                        type="text" 
                        value={siteConfigs.home_hero_title_line2 || ''} 
                        onChange={(e) => setSiteConfigs(prev => ({ ...prev, home_hero_title_line2: e.target.value }))}
                        className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Home Hero Subtitle</label>
                      <input 
                        type="text" 
                        value={siteConfigs.home_hero_subtitle || ''} 
                        onChange={(e) => setSiteConfigs(prev => ({ ...prev, home_hero_subtitle: e.target.value }))}
                        className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Home Hero Description</label>
                      <textarea 
                        rows={3}
                        value={siteConfigs.home_hero_description || ''} 
                        onChange={(e) => setSiteConfigs(prev => ({ ...prev, home_hero_description: e.target.value }))}
                        className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Mood Section Title</label>
                      <input 
                        type="text" 
                        value={siteConfigs.home_mood_title || ''} 
                        onChange={(e) => setSiteConfigs(prev => ({ ...prev, home_mood_title: e.target.value }))}
                        className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Journal Section Title</label>
                      <input 
                        type="text" 
                        value={siteConfigs.home_journal_title || ''} 
                        onChange={(e) => setSiteConfigs(prev => ({ ...prev, home_journal_title: e.target.value }))}
                        className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">"Find Here" Section Title</label>
                      <input 
                        type="text" 
                        value={siteConfigs.home_find_here_title || ''} 
                        onChange={(e) => setSiteConfigs(prev => ({ ...prev, home_find_here_title: e.target.value }))}
                        className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">"Find Here" Section Subtitle</label>
                      <input 
                        type="text" 
                        value={siteConfigs.home_find_here_subtitle || ''} 
                        onChange={(e) => setSiteConfigs(prev => ({ ...prev, home_find_here_subtitle: e.target.value }))}
                        className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm"
                      />
                    </div>

                    {/* About Page Config */}
                    <div className="md:col-span-2 pt-8 border-t border-outline-variant/20">
                      <h3 className="text-xl font-headline font-bold mb-6">About Page</h3>
                    </div>
                    <div className="space-y-2">
                      <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">About Hero Title</label>
                      <input 
                        type="text" 
                        value={siteConfigs.about_hero_title || ''} 
                        onChange={(e) => setSiteConfigs(prev => ({ ...prev, about_hero_title: e.target.value }))}
                        className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">About Signature Name</label>
                      <input 
                        type="text" 
                        value={siteConfigs.about_hero_signature || ''} 
                        onChange={(e) => setSiteConfigs(prev => ({ ...prev, about_hero_signature: e.target.value }))}
                        className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">About Hero Subtitle</label>
                      <input 
                        type="text" 
                        value={siteConfigs.about_hero_subtitle || ''} 
                        onChange={(e) => setSiteConfigs(prev => ({ ...prev, about_hero_subtitle: e.target.value }))}
                        className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">About Hero Description</label>
                      <textarea 
                        rows={3}
                        value={siteConfigs.about_hero_description || ''} 
                        onChange={(e) => setSiteConfigs(prev => ({ ...prev, about_hero_description: e.target.value }))}
                        className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm resize-none"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <ImageUpload 
                        label="About Hero Image" 
                        value={siteConfigs.about_hero_image || ''} 
                        onChange={(val) => setSiteConfigs(prev => ({ ...prev, about_hero_image: val }))} 
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <ImageUpload 
                        label="Home Hero Image" 
                        value={siteConfigs.home_hero_image || ''} 
                        onChange={(val) => setSiteConfigs(prev => ({ ...prev, home_hero_image: val }))} 
                      />
                    </div>

                    <div className="md:col-span-2 pt-8 border-t border-outline-variant/20">
                      <h3 className="text-xl font-headline font-bold mb-6">Newsletter Section</h3>
                    </div>
                    <div className="space-y-2">
                      <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Newsletter Title</label>
                      <input 
                        type="text" 
                        value={siteConfigs.newsletter_title || ''} 
                        onChange={(e) => setSiteConfigs(prev => ({ ...prev, newsletter_title: e.target.value }))}
                        className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Newsletter CTA Button</label>
                      <input 
                        type="text" 
                        value={siteConfigs.newsletter_cta || ''} 
                        onChange={(e) => setSiteConfigs(prev => ({ ...prev, newsletter_cta: e.target.value }))}
                        className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Newsletter Subtitle</label>
                      <textarea 
                        rows={2}
                        value={siteConfigs.newsletter_subtitle || ''} 
                        onChange={(e) => setSiteConfigs(prev => ({ ...prev, newsletter_subtitle: e.target.value }))}
                        className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm resize-none"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Newsletter Disclaimer</label>
                      <input 
                        type="text" 
                        value={siteConfigs.newsletter_disclaimer || ''} 
                        onChange={(e) => setSiteConfigs(prev => ({ ...prev, newsletter_disclaimer: e.target.value }))}
                        className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm"
                      />
                    </div>

                    <div className="md:col-span-2 pt-8 border-t border-outline-variant/20">
                      <h3 className="text-xl font-headline font-bold mb-6">About Page CTA</h3>
                    </div>
                    <div className="space-y-2">
                      <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">CTA Title</label>
                      <input 
                        type="text" 
                        value={siteConfigs.about_cta_title || ''} 
                        onChange={(e) => setSiteConfigs(prev => ({ ...prev, about_cta_title: e.target.value }))}
                        className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">CTA Button Text</label>
                      <input 
                        type="text" 
                        value={siteConfigs.about_cta_button || ''} 
                        onChange={(e) => setSiteConfigs(prev => ({ ...prev, about_cta_button: e.target.value }))}
                        className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">CTA Subtitle</label>
                      <textarea 
                        rows={2}
                        value={siteConfigs.about_cta_subtitle || ''} 
                        onChange={(e) => setSiteConfigs(prev => ({ ...prev, about_cta_subtitle: e.target.value }))}
                        className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm resize-none"
                      />
                    </div>

                    <div className="md:col-span-2 pt-8 border-t border-outline-variant/20">
                      <h3 className="text-xl font-headline font-bold mb-6">Shop Page Extras</h3>
                    </div>
                    <div className="space-y-2">
                      <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Sidebar Title</label>
                      <input 
                        type="text" 
                        value={siteConfigs.shop_sidebar_title || ''} 
                        onChange={(e) => setSiteConfigs(prev => ({ ...prev, shop_sidebar_title: e.target.value }))}
                        className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Empty Results Message</label>
                      <input 
                        type="text" 
                        value={siteConfigs.shop_empty_message || ''} 
                        onChange={(e) => setSiteConfigs(prev => ({ ...prev, shop_empty_message: e.target.value }))}
                        className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm"
                      />
                    </div>

                    <div className="md:col-span-2 pt-8 border-t border-outline-variant/20">
                      <h3 className="text-xl font-headline font-bold mb-6">Footer</h3>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Footer About Text</label>
                      <textarea 
                        rows={3}
                        value={siteConfigs.footer_about || ''} 
                        onChange={(e) => setSiteConfigs(prev => ({ ...prev, footer_about: e.target.value }))}
                        className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm resize-none"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Footer Copyright Text</label>
                      <input 
                        type="text" 
                        value={siteConfigs.footer_copyright || ''} 
                        onChange={(e) => setSiteConfigs(prev => ({ ...prev, footer_copyright: e.target.value }))}
                        className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm"
                      />
                    </div>

                    <div className="md:col-span-2 pt-8 border-t border-outline-variant/20">
                      <h3 className="text-xl font-headline font-bold mb-6">Product Options</h3>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Preset Vibes (Comma separated)</label>
                      <textarea 
                        rows={3}
                        value={siteConfigs.vibes_preset || ''} 
                        onChange={(e) => setSiteConfigs(prev => ({ ...prev, vibes_preset: e.target.value }))}
                        className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm resize-none"
                        placeholder="Minimal, Cozy, Pinteresty, etc."
                      />
                    </div>

                    <div className="md:col-span-2 pt-8 border-t border-outline-variant/20">
                      <h3 className="text-xl font-headline font-bold mb-6">Shop Page</h3>
                    </div>
                    <div className="space-y-2">
                      <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Shop Hero Title Line 1</label>
                      <input 
                        type="text" 
                        value={siteConfigs.shop_hero_title_line1 || ''} 
                        onChange={(e) => setSiteConfigs(prev => ({ ...prev, shop_hero_title_line1: e.target.value }))}
                        className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Shop Hero Title Line 2 (Italic)</label>
                      <input 
                        type="text" 
                        value={siteConfigs.shop_hero_title_line2 || ''} 
                        onChange={(e) => setSiteConfigs(prev => ({ ...prev, shop_hero_title_line2: e.target.value }))}
                        className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Shop Hero Subtitle</label>
                      <textarea 
                        rows={3}
                        value={siteConfigs.shop_hero_subtitle || ''} 
                        onChange={(e) => setSiteConfigs(prev => ({ ...prev, shop_hero_subtitle: e.target.value }))}
                        className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm resize-none"
                      />
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'leads' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-headline font-bold">Waitlist Leads</h2>
                <button 
                  onClick={refreshLeads}
                  className="p-2 text-outline hover:text-primary transition-colors"
                  title="Refresh Leads"
                >
                  <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                </button>
              </div>
              <div className="bg-white rounded-[40px] border border-outline-variant/30 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-surface-container/30 text-[10px] uppercase tracking-widest text-outline font-bold">
                        <th className="px-8 py-4">Name</th>
                        <th className="px-8 py-4">Email</th>
                        <th className="px-8 py-4">Source</th>
                        <th className="px-8 py-4">Status</th>
                        <th className="px-8 py-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {allLeads.map((lead) => (
                        <tr key={lead.id} className="group hover:bg-surface-container/10 transition-colors">
                          <td className="px-8 py-4 font-bold text-sm">{lead.name}</td>
                          <td className="px-8 py-4 text-sm text-on-surface-variant">{lead.email}</td>
                          <td className="px-8 py-4 text-[10px] text-outline uppercase tracking-widest">{lead.source || 'Unknown'}</td>
                          <td className="px-8 py-4">
                            <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded-full ${lead.is_confirmed ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                              {lead.is_confirmed ? 'Confirmed' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-8 py-4 text-[10px] text-outline">
                            {new Date(lead.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Product Modal */}
      <AnimatePresence>
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
                      onChange={(e) => setEditingProduct(prev => ({ ...prev, title: e.target.value }))}
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
                      onChange={(e) => setEditingProduct(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
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
                      onChange={(urls) => setEditingProduct(prev => ({ 
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
                      onChange={(e) => setEditingProduct(prev => ({ ...prev, category: e.target.value, subCategory: '' }))}
                      className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-sm appearance-none"
                    >
                      <option value="">Select Category</option>
                      {shopCategories.map(c => <option key={c.id} value={c.title}>{c.title}</option>)}
                    </select>
                    {formErrors.category && <p className="text-[9px] text-red-500 uppercase font-bold tracking-widest">{formErrors.category}</p>}
                  </div>

                  {/* SubCategory */}
                  <div className="space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Sub-Category</label>
                    <select 
                      value={editingProduct?.subCategory || ''}
                      disabled={!editingProduct?.category}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev, subCategory: e.target.value }))}
                      className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-sm appearance-none disabled:opacity-50"
                    >
                      <option value="">Select Sub-Category</option>
                      {shopCategories.find(c => c.title === editingProduct?.category)?.sub_categories?.map((s: string) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {formErrors.subCategory && <p className="text-[9px] text-red-500 uppercase font-bold tracking-widest">{formErrors.subCategory}</p>}
                  </div>

                  {/* Vibes */}
                  <div className="space-y-3 md:col-span-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Vibes</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {(siteConfigs.vibes_preset || VIBES.join(', ')).split(',').map(v => v.trim()).filter(Boolean).map(vibe => {
                        const isSelected = editingProduct?.vibe?.includes(vibe);
                        return (
                          <button
                            key={vibe}
                            type="button"
                            onClick={() => {
                              const currentVibes = editingProduct?.vibe || [];
                              const newVibes = isSelected 
                                ? currentVibes.filter(v => v !== vibe)
                                : [...currentVibes, vibe];
                              setEditingProduct(prev => ({ ...prev, vibe: newVibes }));
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
                                  setEditingProduct(prev => ({ ...prev, vibe: [...currentVibes, customVibe.trim()] }));
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
                              setEditingProduct(prev => ({ ...prev, vibe: [...currentVibes, customVibe.trim()] }));
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
                      {editingProduct?.vibe?.filter(v => !((siteConfigs.vibes_preset || VIBES.join(', ')).split(',').map(vp => vp.trim()).includes(v))).map(v => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setEditingProduct(prev => ({ ...prev, vibe: (prev.vibe || []).filter(vibe => vibe !== v) }))}
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
                      onChange={(e) => setEditingProduct(prev => ({ ...prev, affiliateUrl: e.target.value }))}
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
                      onChange={(e) => setEditingProduct(prev => ({ ...prev, retailer: e.target.value }))}
                      placeholder="Amazon, ASOS, etc."
                      className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-sm"
                    />
                  </div>

                  {/* Is Active */}
                  <div className="space-y-2 flex flex-col justify-end">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline mb-3">Visibility</label>
                    <button
                      type="button"
                      onClick={() => setEditingProduct(prev => ({ ...prev, isActive: !prev?.isActive }))}
                      className={`flex items-center gap-3 w-fit px-4 py-3 rounded-xl transition-all border ${
                        editingProduct?.isActive 
                          ? 'bg-green-50 border-green-200 text-green-600' 
                          : 'bg-surface-container border-outline-variant/30 text-outline'
                      }`}
                    >
                      {editingProduct?.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                      <span className="text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded-full">
                        {editingProduct?.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </button>
                  </div>

                  {/* Description */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Description (Optional)</label>
                    <textarea 
                      rows={4}
                      value={editingProduct?.description || ''}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the product..."
                      className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-sm resize-none"
                    />
                  </div>
                </div>
              </form>

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
                    onClick={handleSaveProduct}
                    disabled={isLoading}
                    className="bg-primary text-white px-6 py-3 rounded-2xl font-label text-xs uppercase tracking-widest font-bold hover:bg-primary-hover transition-all flex items-center justify-center gap-2 disabled:opacity-50 flex-1 sm:flex-none"
                  >
                    {isLoading ? <RefreshCw size={16} className="animate-spin" /> : <><Save size={16} /> Save Product</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
 
         {/* Shop Category Modal */}
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
                    <input type="text" value={editingShopCategory?.title || ''} onChange={(e) => setEditingShopCategory(prev => ({ ...prev, title: e.target.value, slug: e.target.id ? prev.slug : e.target.value.toLowerCase().replace(/\s+/g, '-') }))} className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm" />
                    {shopCategoryFormErrors.title && <p className="text-[9px] text-red-500 uppercase font-bold">{shopCategoryFormErrors.title}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Slug</label>
                    <input type="text" value={editingShopCategory?.slug || ''} onChange={(e) => setEditingShopCategory(prev => ({ ...prev, slug: e.target.value }))} className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm" />
                    {shopCategoryFormErrors.slug && <p className="text-[9px] text-red-500 uppercase font-bold">{shopCategoryFormErrors.slug}</p>}
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Sub-categories (comma separated)</label>
                    <input type="text" value={editingShopCategory?.sub_categories?.join(', ') || ''} onChange={(e) => setEditingShopCategory(prev => ({ ...prev, sub_categories: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm" placeholder="Clothing, Accessories, etc." />
                  </div>
                </div>
                <div className="flex justify-end gap-4 pt-8">
                  <button type="button" onClick={() => setIsShopCategoryModalOpen(false)} className="border border-outline-variant px-4 py-2 rounded-xl font-label text-xs uppercase font-bold">Cancel</button>
                  <button type="submit" disabled={isLoading} className="bg-primary text-white px-6 py-3 rounded-2xl font-label text-xs uppercase font-bold flex items-center gap-2">{isLoading ? <RefreshCw className="animate-spin" /> : <Save size={16} />} Save</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

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
                    <input type="text" value={editingMood?.name || ''} onChange={(e) => setEditingMood(prev => ({ ...prev, name: e.target.value, slug: prev.id ? prev.slug : e.target.value.toLowerCase().replace(/\s+/g, '-') }))} className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Slug</label>
                    <input type="text" value={editingMood?.slug || ''} onChange={(e) => setEditingMood(prev => ({ ...prev, slug: e.target.value }))} className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Vibe (Tag)</label>
                    <input type="text" value={editingMood?.vibe || ''} onChange={(e) => setEditingMood(prev => ({ ...prev, vibe: e.target.value }))} className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm" placeholder="e.g. Clean Girl" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Item Count Tag</label>
                    <input type="text" value={editingMood?.count || ''} onChange={(e) => setEditingMood(prev => ({ ...prev, count: e.target.value }))} className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm" placeholder="e.g. 1.2k" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <ImageUpload 
                      label="Mood Image" 
                      value={editingMood?.image || ''} 
                      onChange={(val) => setEditingMood(prev => ({ ...prev, image: val }))} 
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Linked Shop Category</label>
                    <select value={editingMood?.linked_shop_category_id || ''} onChange={(e) => setEditingMood(prev => ({ ...prev, linked_shop_category_id: e.target.value }))} className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm">
                      <option value="">None</option>
                      {shopCategories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-4 pt-8">
                  <button type="button" onClick={() => setIsMoodModalOpen(false)} className="border border-outline-variant px-4 py-2 rounded-xl font-label text-xs uppercase font-bold">Cancel</button>
                  <button type="submit" disabled={isLoading} className="bg-primary text-white px-6 py-3 rounded-2xl font-label text-xs uppercase font-bold flex items-center gap-2">Save</button>
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
                    <input type="text" value={editingFindHere?.title || ''} onChange={(e) => setEditingFindHere(prev => ({ ...prev, title: e.target.value }))} className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Description</label>
                    <textarea value={editingFindHere?.description || ''} onChange={(e) => setEditingFindHere(prev => ({ ...prev, description: e.target.value }))} rows={3} className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm resize-none" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <ImageUpload 
                      label="Item Image" 
                      value={editingFindHere?.image || ''} 
                      onChange={(val) => setEditingFindHere(prev => ({ ...prev, image: val }))} 
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Linked Blog Category</label>
                    <select value={editingFindHere?.linked_blog_category_slug || ''} onChange={(e) => setEditingFindHere(prev => ({ ...prev, linked_blog_category_slug: e.target.value }))} className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 w-full text-sm">
                      <option value="">None</option>
                      {blogCategories.map(c => <option key={c.slug} value={c.slug}>{c.title}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-4 pt-8">
                  <button type="button" onClick={() => setIsFindHereModalOpen(false)} className="border border-outline-variant px-4 py-2 rounded-xl font-label text-xs uppercase font-bold">Cancel</button>
                  <button type="submit" disabled={isLoading} className="bg-primary text-white px-6 py-3 rounded-2xl font-label text-xs uppercase font-bold flex items-center gap-2">Save</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Blog Post Modal */}
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
                  {/* Title */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Title</label>
                    <input 
                      type="text"
                      value={editingBlog?.title || ''}
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        setEditingBlog(prev => {
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

                  {/* Slug */}
                  <div className="space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Slug (URL)</label>
                    <input 
                      type="text"
                      value={editingBlog?.slug || ''}
                      onChange={(e) => {
                        setIsSlugManual(true);
                        setEditingBlog(prev => ({ ...prev, slug: e.target.value }));
                      }}
                      placeholder="post-slug-here"
                      className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-sm"
                    />
                    {blogFormErrors.slug && <p className="text-[9px] text-red-500 uppercase font-bold tracking-widest">{blogFormErrors.slug}</p>}
                  </div>

                  {/* Category Display Name */}
                  <div className="space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Category Name</label>
                    <input 
                      type="text"
                      value={editingBlog?.category || ''}
                      onChange={(e) => setEditingBlog(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="e.g. Style Guides"
                      className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-sm"
                    />
                    {blogFormErrors.category && <p className="text-[9px] text-red-500 uppercase font-bold tracking-widest">{blogFormErrors.category}</p>}
                  </div>

                  {/* Category Slug Select */}
                  <div className="space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Category Slug</label>
                    <select 
                      value={editingBlog?.categorySlug || ''}
                      onChange={(e) => setEditingBlog(prev => ({ ...prev, categorySlug: e.target.value }))}
                      className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-sm appearance-none"
                    >
                      <option value="">Select Category Slug</option>
                      {blogCategories.map(c => <option key={c.id} value={c.slug}>{c.title}</option>)}
                    </select>
                    {blogFormErrors.categorySlug && <p className="text-[9px] text-red-500 uppercase font-bold tracking-widest">{blogFormErrors.categorySlug}</p>}
                  </div>

                  {/* Read Time */}
                  <div className="space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Read Time</label>
                    <input 
                      type="text"
                      value={editingBlog?.readTime || ''}
                      onChange={(e) => setEditingBlog(prev => ({ ...prev, readTime: e.target.value }))}
                      placeholder="e.g. 5 min read"
                      className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-sm"
                    />
                    {blogFormErrors.readTime && <p className="text-[9px] text-red-500 uppercase font-bold tracking-widest">{blogFormErrors.readTime}</p>}
                  </div>

                  {/* Author */}
                  <div className="space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Author</label>
                    <input 
                      type="text"
                      value={editingBlog?.author || ''}
                      onChange={(e) => setEditingBlog(prev => ({ ...prev, author: e.target.value }))}
                      className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-sm"
                    />
                    {blogFormErrors.author && <p className="text-[9px] text-red-500 uppercase font-bold tracking-widest">{blogFormErrors.author}</p>}
                  </div>

                  {/* Date */}
                  <div className="space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Date</label>
                    <input 
                      type="date"
                      value={formatDateForInput(editingBlog?.date)}
                      onChange={(e) => setEditingBlog(prev => ({ ...prev, date: e.target.value }))}
                      className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-sm"
                    />
                    {blogFormErrors.date && <p className="text-[9px] text-red-500 uppercase font-bold tracking-widest">{blogFormErrors.date}</p>}
                  </div>

                  {/* Cover and Additional Images */}
                  <div className="md:col-span-2 space-y-2">
                    <MultiImageUpload 
                      label="Post Images (First will be main cover)" 
                      value={editingBlog?.images || (editingBlog?.image ? [editingBlog.image] : [])} 
                      onChange={(urls) => setEditingBlog(prev => ({ 
                        ...prev, 
                        images: urls,
                        image: urls[0] || '' 
                      }))} 
                    />
                    {blogFormErrors.image && <p className="text-[9px] text-red-500 uppercase font-bold tracking-widest">{blogFormErrors.image}</p>}
                  </div>

                  {/* Excerpt */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Excerpt</label>
                    <textarea 
                      rows={2}
                      value={editingBlog?.excerpt || ''}
                      onChange={(e) => setEditingBlog(prev => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="1-3 sentences summary..."
                      className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-sm resize-none"
                    />
                    {blogFormErrors.excerpt && <p className="text-[9px] text-red-500 uppercase font-bold tracking-widest">{blogFormErrors.excerpt}</p>}
                  </div>

                  {/* Content */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Post Content (Markdown supported)</label>
                    <textarea 
                      rows={12}
                      value={editingBlog?.content || ''}
                      onChange={(e) => setEditingBlog(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Markdown content..."
                      className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-sm min-h-75"
                    />
                    {blogFormErrors.content && <p className="text-[9px] text-red-500 uppercase font-bold tracking-widest">{blogFormErrors.content}</p>}
                  </div>

                  {/* Recommended Products */}
                  <div className="space-y-4 md:col-span-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Recommended Products</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-75 overflow-y-auto p-4 border border-outline-variant/20 rounded-2xl bg-surface-container/20">
                      {allProducts.filter(p => p.isActive).map(p => {
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
                                  : current.filter(id => id !== p.id);
                                setEditingBlog(prev => ({ ...prev, recommendedProducts: next }));
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

                  {/* Related Blog Posts */}
                  <div className="space-y-4 md:col-span-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Related Blog Posts (You Might Also Love)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-75 overflow-y-auto p-4 border border-outline-variant/20 rounded-2xl bg-surface-container/20">
                      {allBlogPosts.filter(post => post.id !== editingBlog?.id).map(post => {
                        const isSelected = editingBlog?.relatedPosts?.includes(post.id);
                        return (
                          <label key={post.id} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-outline-variant/20 cursor-pointer hover:border-primary transition-all">
                            <input 
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                const current = editingBlog?.relatedPosts || [];
                                const next = e.target.checked 
                                  ? [...current, post.id] 
                                  : current.filter(id => id !== post.id);
                                setEditingBlog(prev => ({ ...prev, relatedPosts: next }));
                              }}
                              className="w-4 h-4 rounded border-outline-variant/30 text-primary focus:ring-primary"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold truncate">{post.title}</p>
                              <p className="text-[9px] text-primary uppercase font-label tracking-widest">{post.category}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Visibility Toggle */}
                  <div className="space-y-2 flex flex-col justify-end md:col-span-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline mb-3">Publish Status</label>
                    <button
                      type="button"
                      onClick={() => setEditingBlog(prev => ({ ...prev, isPublished: !prev?.isPublished }))}
                      className={`flex items-center gap-3 w-fit px-4 py-3 rounded-xl transition-all border ${
                        editingBlog?.isPublished 
                          ? 'bg-green-50 border-green-200 text-green-600' 
                          : 'bg-surface-container border-outline-variant/30 text-outline'
                      }`}
                    >
                      {editingBlog?.isPublished ? <Check size={18} /> : <FileText size={18} />}
                      <span className="text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded-full">
                        {editingBlog?.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </button>
                  </div>
                </div>
              </form>

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
                    onClick={handleSaveBlog}
                    disabled={isLoading}
                    className="bg-primary text-white px-6 py-3 rounded-2xl font-label text-xs uppercase tracking-widest font-bold hover:bg-primary-hover transition-all flex items-center justify-center gap-2 disabled:opacity-50 flex-1 sm:flex-none"
                  >
                    {isLoading ? <RefreshCw size={16} className="animate-spin" /> : <><Save size={16} /> {editingBlog?.isPublished ? 'Save & Publish' : 'Save as Draft'}</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Blog Category Modal */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] border border-outline-variant/30 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col p-8"
            >
              <div className="border-b border-outline-variant/20 flex items-center justify-between pb-6 mb-8">
                <h3 className="text-2xl font-headline font-bold">
                  {editingCategory?.id ? 'Edit Category' : 'New Category'}
                </h3>
                <button 
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="p-2 hover:bg-surface-container rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSaveCategory} className="flex-1 overflow-y-auto space-y-8 pr-2">
                <div className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Title</label>
                    <input 
                      type="text"
                      value={editingCategory?.title || ''}
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        setEditingCategory(prev => {
                          const updates: any = { title: newTitle };
                          if (!isCategorySlugManual) {
                            updates.slug = newTitle.toLowerCase()
                              .replace(/[^a-z0-9\s-]/g, '')
                              .replace(/\s+/g, '-')
                              .trim();
                          }
                          return { ...prev, ...updates };
                        });
                      }}
                      placeholder="e.g. Style Guides"
                      className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-sm"
                    />
                    {categoryFormErrors.title && <p className="text-[9px] text-red-500 uppercase font-bold tracking-widest">{categoryFormErrors.title}</p>}
                  </div>

                  {/* Slug */}
                  <div className="space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Slug (URL)</label>
                    <input 
                      type="text"
                      value={editingCategory?.slug || ''}
                      onChange={(e) => {
                        setIsCategorySlugManual(true);
                        setEditingCategory(prev => ({ ...prev, slug: e.target.value }));
                      }}
                      placeholder="style-guides"
                      className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-sm"
                    />
                    {categoryFormErrors.slug && <p className="text-[9px] text-red-500 uppercase font-bold tracking-widest">{categoryFormErrors.slug}</p>}
                  </div>

                  {/* Image */}
                  <div className="space-y-2">
                    <ImageUpload 
                      label="Category Image" 
                      value={editingCategory?.image || ''} 
                      onChange={(val) => setEditingCategory(prev => ({ ...prev, image: val }))} 
                    />
                    {categoryFormErrors.image && <p className="text-[9px] text-red-500 uppercase font-bold tracking-widest">{categoryFormErrors.image}</p>}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="font-label text-xs uppercase tracking-widest font-bold text-outline">Description</label>
                    <textarea 
                      rows={4}
                      value={editingCategory?.description || ''}
                      onChange={(e) => setEditingCategory(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Category description..."
                      className="px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/30 focus:outline-none focus:border-primary transition-all w-full text-sm resize-none"
                    />
                    {categoryFormErrors.description && <p className="text-[9px] text-red-500 uppercase font-bold tracking-widest">{categoryFormErrors.description}</p>}
                  </div>
                </div>
              </form>

              <div className="border-t border-outline-variant/20 pt-8 mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex gap-4 w-full sm:w-auto ml-auto">
                  <button 
                    type="button"
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="border border-outline-variant px-4 py-2 rounded-xl font-label text-xs uppercase tracking-widest font-bold hover:bg-surface-container transition-all flex-1 sm:flex-none"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    onClick={handleSaveCategory}
                    disabled={isLoading}
                    className="bg-primary text-white px-6 py-3 rounded-2xl font-label text-xs uppercase tracking-widest font-bold hover:bg-primary-hover transition-all flex items-center justify-center gap-2 disabled:opacity-50 flex-1 sm:flex-none"
                  >
                    {isLoading ? <RefreshCw size={16} className="animate-spin" /> : <><Save size={16} /> Save Category</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
