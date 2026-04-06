import React from 'react';
import { AdminProvider, useAdminContext } from '../components/admin/AdminContext';
import { AdminLayout } from '../components/admin/AdminLayout';
import { AdminAnalytics } from '../components/admin/AdminAnalytics';
import { AdminProducts } from '../components/admin/AdminProducts';
import { AdminBlogs } from '../components/admin/AdminBlogs';
import { AdminBlogCategories } from '../components/admin/AdminBlogCategories';
import { AdminShopCategories } from '../components/admin/AdminShopCategories';
import { AdminHomeConfig } from '../components/admin/AdminHomeConfig';
import { AdminSiteConfig } from '../components/admin/AdminSiteConfig';
import { AdminLeads } from '../components/admin/AdminLeads';
import SEOMeta from '../components/SEOMeta';

const AdminContent: React.FC = () => {
  const { activeTab } = useAdminContext();

  return (
    <AdminLayout>
      {activeTab === 'analytics' && <AdminAnalytics />}
      {activeTab === 'products' && <AdminProducts />}
      {activeTab === 'blogs' && <AdminBlogs />}
      {activeTab === 'categories' && <AdminBlogCategories />}
      {activeTab === 'shop-categories' && <AdminShopCategories />}
      {activeTab === 'home-config' && <AdminHomeConfig />}
      {activeTab === 'site-config' && <AdminSiteConfig />}
      {activeTab === 'leads' && <AdminLeads />}
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
