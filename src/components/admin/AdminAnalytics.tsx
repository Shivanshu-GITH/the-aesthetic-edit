import React from 'react';
import { ExternalLink, Save, Mail } from 'lucide-react';
import { useAdminContext } from './AdminContext';

export const AdminAnalytics: React.FC = () => {
  const { 
    data, 
    updatingId, 
    handleUpdateAffiliateUrl 
  } = useAdminContext();

  if (!data) return null;

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Total Leads', value: data?.totalLeads || 0, icon: Mail, color: 'bg-blue-50 text-blue-600' },
          { label: 'Affiliate Clicks', value: data?.totalClicks || 0, icon: ExternalLink, color: 'bg-green-50 text-green-600' },
          { label: 'Pinterest Saves', value: data?.totalSaves || 0, icon: Save, color: 'bg-red-50 text-red-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-8 rounded-4xl border border-outline-variant/30 shadow-sm flex items-center gap-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-label uppercase tracking-widest text-outline font-bold">{stat.label}</p>
              <p className="text-4xl font-headline font-bold mt-1">{(stat.value || 0).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Products Table by Clicks */}
        <div className="bg-white rounded-[40px] border border-outline-variant/30 shadow-sm overflow-hidden flex flex-col max-h-[600px]">
          <div className="p-8 border-b border-outline-variant/20 flex items-center justify-between shrink-0">
            <h2 className="text-xl font-headline font-bold flex items-center gap-3">
              <ExternalLink size={20} className="text-primary" /> Products by Clicks
            </h2>
          </div>
          <div className="overflow-x-auto flex-1 overflow-y-auto">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-outline font-bold sticky top-0 z-10">
                  <th className="px-8 py-4 bg-[#f9f7f4]">Product</th>
                  <th className="px-8 py-4 bg-[#f9f7f4]">Clicks</th>
                  <th className="px-8 py-4 bg-[#f9f7f4]">Saves</th>
                  <th className="px-8 py-4 bg-[#f9f7f4]">Affiliate URL</th>
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
                    <td className="px-8 py-4 text-sm font-bold text-red-600">{p.saves}</td>
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

        {/* Products Table by Saves */}
        <div className="bg-white rounded-[40px] border border-outline-variant/30 shadow-sm overflow-hidden flex flex-col max-h-[600px]">
          <div className="p-8 border-b border-outline-variant/20 flex items-center justify-between shrink-0">
            <h2 className="text-xl font-headline font-bold flex items-center gap-3">
              <Save size={20} className="text-primary" /> Products by Pinterest Saves
            </h2>
          </div>
          <div className="overflow-x-auto flex-1 overflow-y-auto">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-outline font-bold sticky top-0 z-10">
                  <th className="px-8 py-4 bg-[#f9f7f4]">Product</th>
                  <th className="px-8 py-4 bg-[#f9f7f4]">Saves</th>
                  <th className="px-8 py-4 bg-[#f9f7f4]">Clicks</th>
                  <th className="px-8 py-4 bg-[#f9f7f4]">Affiliate URL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {data.topPinterestSaved.map((p) => (
                  <tr key={p.id} className="group hover:bg-surface-container/10 transition-colors">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <img src={p.image} className="w-10 h-10 rounded-lg object-cover" alt="" />
                        <span className="text-sm font-bold truncate max-w-37.5">{p.title}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-sm font-bold text-red-600">{p.saves}</td>
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
      </div>
    </div>
  );
};
