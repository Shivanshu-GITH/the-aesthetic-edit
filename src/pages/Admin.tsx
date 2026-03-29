import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, ExternalLink, MessageCircle, ArrowRight, Save, ShieldCheck, ShoppingBag, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { formatPrice } from '../lib/currency';
import { Product } from '../types';

interface AnalyticsData {
  totalLeads: number;
  totalClicks: number;
  totalSaves: number;
  topClickedProducts: (Product & { clicks: number })[];
  topPinterestSaved: (Product & { saves: number })[];
  recentLeads: { id: string; name: string; email: string; is_confirmed: number; created_at: string }[];
  allProducts: Product[];
}

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const auth = sessionStorage.getItem('ae_admin_auth');
    if (auth) {
      setIsAuthenticated(true);
      fetchDashboard(auth);
    }
  }, []);

  const fetchDashboard = async (pwd: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/analytics/summary', {
        headers: { 'ADMIN_PASSWORD': pwd }
      });
      if (response.ok) {
        const res = await response.json();
        setData(res.data);
        setIsAuthenticated(true);
        sessionStorage.setItem('ae_admin_auth', pwd);
      } else {
        setError('Unauthorized');
        sessionStorage.removeItem('ae_admin_auth');
      }
    } catch (err) {
      setError('Failed to fetch dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDashboard(password);
  };

  const handleUpdateAffiliateUrl = async (id: string, url: string) => {
    setUpdatingId(id);
    const pwd = sessionStorage.getItem('ae_admin_auth');
    try {
      await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'ADMIN_PASSWORD': pwd || ''
        },
        body: JSON.stringify({ affiliateUrl: url })
      });
      fetchDashboard(pwd || '');
    } catch (err) {
      alert('Failed to update URL');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleActive = async (id: string) => {
    setUpdatingId(id);
    const pwd = sessionStorage.getItem('ae_admin_auth');
    try {
      await fetch(`/api/products/${id}/toggle-active`, {
        method: 'PATCH',
        headers: { 'ADMIN_PASSWORD': pwd || '' }
      });
      fetchDashboard(pwd || '');
    } catch (err) {
      alert('Failed to toggle status');
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

  return (
    <div className="min-h-screen bg-surface-container-low p-8 md:p-12 font-body">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <span className="font-label text-xs uppercase tracking-[0.3em] text-primary font-bold">Internal Tools</span>
            <h1 className="text-4xl font-headline font-bold">Platform Dashboard</h1>
          </div>
          <button 
            onClick={() => {
              sessionStorage.removeItem('ae_admin_auth');
              window.location.reload();
            }}
            className="text-outline hover:text-primary font-label text-[10px] uppercase tracking-widest font-bold transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'Total Leads', value: data.totalLeads, icon: Mail, color: 'bg-blue-50 text-blue-600' },
            { label: 'Affiliate Clicks', value: data.totalClicks, icon: ExternalLink, color: 'bg-green-50 text-green-600' },
            { label: 'Pinterest Saves', value: data.totalSaves, icon: Save, color: 'bg-red-50 text-red-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white p-8 rounded-[32px] border border-outline-variant/30 shadow-sm flex items-center gap-6">
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
                          <span className="text-sm font-bold truncate max-w-[150px]">{p.title}</span>
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

          {/* Recent Leads */}
          <div className="bg-white rounded-[40px] border border-outline-variant/30 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-outline-variant/20 flex items-center justify-between">
              <h2 className="text-xl font-headline font-bold flex items-center gap-3">
                <Mail size={20} className="text-primary" /> Recent Leads
              </h2>
            </div>
            <div className="p-8 space-y-6">
              {data.recentLeads.map((lead) => (
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
            </div>
          </div>
        </div>

        {/* Product Manager */}
        <div className="bg-white rounded-[40px] border border-outline-variant/30 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-outline-variant/20 flex items-center justify-between">
            <h2 className="text-xl font-headline font-bold flex items-center gap-3">
              <ShoppingBag size={20} className="text-primary" /> Product Visibility Manager
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-8">
            {data.allProducts.map((p) => (
              <div key={p.id} className="p-4 rounded-[24px] border border-outline-variant/20 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={p.image} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" alt="" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">{p.title}</p>
                    <p className="text-[10px] text-primary">{formatPrice(p.price)}</p>
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
        </div>
      </div>
    </div>
  );
}
