import React, { Suspense, lazy } from 'react';
import { AdminProvider, useAdminContext } from '../components/admin/AdminContext';
import { AdminLayout } from '../components/admin/AdminLayout';
import SEOMeta from '../components/SEOMeta';
import { TabType } from '../components/admin/hooks/useAdmin';

const loadAdminAnalytics = () => import('../components/admin/AdminAnalytics');
const loadAdminProducts = () => import('../components/admin/AdminProducts');
const loadAdminBlogs = () => import('../components/admin/AdminBlogs');
const loadAdminBlogCategories = () => import('../components/admin/AdminBlogCategories');
const loadAdminShopCategories = () => import('../components/admin/AdminShopCategories');
const loadAdminHomeConfig = () => import('../components/admin/AdminHomeConfig');
const loadAdminSiteConfig = () => import('../components/admin/AdminSiteConfig');
const loadAdminLeads = () => import('../components/admin/AdminLeads');

const AdminAnalytics = lazy(() => loadAdminAnalytics().then((m) => ({ default: m.AdminAnalytics })));
const AdminProducts = lazy(() => loadAdminProducts().then((m) => ({ default: m.AdminProducts })));
const AdminBlogs = lazy(() => loadAdminBlogs().then((m) => ({ default: m.AdminBlogs })));
const AdminBlogCategories = lazy(() => loadAdminBlogCategories().then((m) => ({ default: m.AdminBlogCategories })));
const AdminShopCategories = lazy(() => loadAdminShopCategories().then((m) => ({ default: m.AdminShopCategories })));
const AdminHomeConfig = lazy(() => loadAdminHomeConfig().then((m) => ({ default: m.AdminHomeConfig })));
const AdminSiteConfig = lazy(() => loadAdminSiteConfig().then((m) => ({ default: m.AdminSiteConfig })));
const AdminLeads = lazy(() => loadAdminLeads().then((m) => ({ default: m.AdminLeads })));

const PREFETCH_MAP: Record<TabType, () => Promise<unknown>> = {
  analytics: loadAdminAnalytics,
  products: loadAdminProducts,
  blogs: loadAdminBlogs,
  categories: loadAdminBlogCategories,
  'shop-categories': loadAdminShopCategories,
  'home-config': loadAdminHomeConfig,
  'site-config': loadAdminSiteConfig,
  leads: loadAdminLeads,
};

const AdminContent: React.FC = () => {
  const { activeTab } = useAdminContext();
  const prefetchedTabsRef = React.useRef<Set<TabType>>(new Set());

  const prefetchTab = React.useCallback((tab: TabType) => {
    if (prefetchedTabsRef.current.has(tab)) return;
    prefetchedTabsRef.current.add(tab);
    void PREFETCH_MAP[tab]();
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const warmTabs: TabType[] =
      activeTab === 'analytics'
        ? ['products', 'site-config', 'blogs']
        : ['analytics', 'products', 'site-config'];

    const runtime = globalThis as typeof globalThis & {
      requestIdleCallback?: (callback: () => void) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (typeof runtime.requestIdleCallback === 'function' && typeof runtime.cancelIdleCallback === 'function') {
      const idleId = runtime.requestIdleCallback(() => {
        warmTabs.forEach(prefetchTab);
      });
      return () => runtime.cancelIdleCallback?.(idleId);
    }

    const timerId = globalThis.setTimeout(() => {
      warmTabs.forEach(prefetchTab);
    }, 350);
    return () => globalThis.clearTimeout(timerId);
  }, [activeTab, prefetchTab]);

  return (
    <AdminLayout onTabIntent={prefetchTab}>
      <Suspense fallback={<div className="h-64 rounded-3xl bg-white/60 border border-outline-variant/20 animate-pulse" />}>
        {activeTab === 'analytics' && <AdminAnalytics />}
        {activeTab === 'products' && <AdminProducts />}
        {activeTab === 'blogs' && <AdminBlogs />}
        {activeTab === 'categories' && <AdminBlogCategories />}
        {activeTab === 'shop-categories' && <AdminShopCategories />}
        {activeTab === 'home-config' && <AdminHomeConfig />}
        {activeTab === 'site-config' && <AdminSiteConfig />}
        {activeTab === 'leads' && <AdminLeads />}
      </Suspense>
    </AdminLayout>
  );
};

const Admin: React.FC = () => {
  return (
    <AdminProvider>
      <SEOMeta title="Admin Dashboard" description="Admin management portal." />
      <AdminContent />
    </AdminProvider>
  );
};

export default Admin;
