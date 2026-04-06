import { useState, useEffect, useCallback } from 'react';
import { Product } from '../../../types';
import { clearFetchCache } from '../../../hooks/useFetch';
import { formatPrice } from '../../../lib/currency';
import { useToast } from '../../../context/ToastContext';

export interface AnalyticsData {
  totalLeads: number;
  totalClicks: number;
  totalSaves: number;
  topClickedProducts: (Product & { clicks: number; saves: number })[];
  topPinterestSaved: (Product & { clicks: number; saves: number })[];
  recentLeads: { id: string; name: string; email: string; is_confirmed: number; created_at: string }[];
  allProducts: (Product & { clicks: number; saves: number })[];
}

export type TabType = 'analytics' | 'products' | 'blogs' | 'categories' | 'shop-categories' | 'home-config' | 'site-config' | 'leads';

export function useAdmin() {
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

      import('../../../lib/currency').then(({ formatPriceAsync }) => {
        productsToFormat.forEach(p => {
          formatPriceAsync(p.price).then(price => {
            setProductPrices(prev => ({ ...prev, [p.id]: price }));
          });
        });
      });
    }
  }, [data?.topClickedProducts, allProducts]);

  const adminFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    return fetch(url, {
      ...options,
      credentials: options.credentials || 'include',
    });
  }, []);

  const refreshProducts = async () => {
    try {
      const res = await fetch('/api/products/admin/all', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setAllProducts(data.data || []);
      }
    } catch (err) {
      console.error('Failed to refresh products', err);
    }
  };

  const refreshBlogPosts = async () => {
    try {
      const res = await fetch('/api/blog/admin/posts', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setAllBlogPosts(data.data || []);
      }
    } catch (err) {
      console.error('Failed to refresh blog posts', err);
    }
  };

  const refreshBlogCategories = async () => {
    try {
      const res = await fetch('/api/blog/admin/categories', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setBlogCategories(data.data || []);
      }
    } catch (err) {
      console.error('Failed to refresh blog categories', err);
    }
  };

  const refreshLeads = async () => {
    try {
      const res = await fetch('/api/leads/admin/all', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setAllLeads(data.data || []);
      }
    } catch (err) {
      console.error('Failed to refresh leads', err);
    }
  };

  const refreshShopCategories = async () => {
    try {
      const res = await fetch('/api/home-shop/admin/shop-categories', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setShopCategories(data.data || []);
      }
    } catch (err) {
      console.error('Failed to refresh shop categories', err);
    }
  };

  const refreshMoods = async () => {
    try {
      const res = await fetch('/api/home-shop/admin/moods', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setMoods(data.data || []);
      }
    } catch (err) {
      console.error('Failed to refresh moods', err);
    }
  };

  const refreshFindHere = async () => {
    try {
      const res = await fetch('/api/home-shop/admin/find-here', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setFindHereItems(data.data || []);
      }
    } catch (err) {
      console.error('Failed to refresh find-here items', err);
    }
  };

  const refreshSiteConfig = async () => {
    try {
      const res = await fetch('/api/home-shop/config', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setSiteConfigs(data.data || {});
      }
    } catch (err) {
      console.error('Failed to refresh site config', err);
    }
  };

  const fetchDashboard = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [analyticsRes, productsRes, blogPostsRes, blogCategoriesRes, leadsRes, shopCategoriesRes, moodsRes, findHereRes, configRes] = await Promise.all([
        fetch('/api/analytics/summary', { credentials: 'include' }),
        fetch('/api/products/admin/all', { credentials: 'include' }),
        fetch('/api/blog/admin/posts', { credentials: 'include' }),
        fetch('/api/blog/admin/categories', { credentials: 'include' }),
        fetch('/api/leads/admin/all', { credentials: 'include' }),
        fetch('/api/home-shop/admin/shop-categories', { credentials: 'include' }),
        fetch('/api/home-shop/admin/moods', { credentials: 'include' }),
        fetch('/api/home-shop/admin/find-here', { credentials: 'include' }),
        fetch('/api/home-shop/config', { credentials: 'include' })
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
      } else {
        const failedRes = [analyticsRes, productsRes, blogPostsRes, blogCategoriesRes, leadsRes, shopCategoriesRes, moodsRes, findHereRes, configRes].find(r => !r.ok);
        const errorData = await failedRes?.json().catch(() => ({}));
        setError(errorData?.error || 'Unauthorized');
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
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/admin/me');
        if (res.ok) {
          fetchDashboard();
        } else {
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      } catch {
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (res.ok) {
        fetchDashboard();
      } else {
        const data = await res.json();
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/admin/logout', { method: 'POST' });
      setIsAuthenticated(false);
      setData(null);
      setPassword('');
    } catch (err) {
      console.error('Logout failed', err);
    }
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

  return {
    isAuthenticated,
    password,
    setPassword,
    error,
    isLoading,
    data,
    activeTab,
    setActiveTab,
    allProducts,
    allBlogPosts,
    blogCategories,
    allLeads,
    shopCategories,
    moods,
    findHereItems,
    siteConfigs,
    setSiteConfigs,
    updatingId,
    setUpdatingId,
    productPrices,
    adminFetch,
    refreshProducts,
    refreshBlogPosts,
    refreshBlogCategories,
    refreshLeads,
    refreshShopCategories,
    refreshMoods,
    refreshFindHere,
    refreshSiteConfig,
    login,
    logout,
    handleUpdateAffiliateUrl,
    handleToggleActive,
    showToast,
    setIsLoading
  };
}
