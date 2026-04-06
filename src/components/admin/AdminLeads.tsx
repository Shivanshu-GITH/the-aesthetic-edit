import React, { useState } from 'react';
import { Mail, Trash2, CheckCircle2, XCircle, Search, Download } from 'lucide-react';
import { useAdminContext } from './AdminContext';

export const AdminLeads: React.FC = () => {
  const { 
    allLeads,
    adminFetch,
    refreshLeads,
    isLoading,
    setIsLoading,
    showToast
  } = useAdminContext();

  const [confirmDeleteLeadId, setConfirmDeleteLeadId] = useState<string | null>(null);
  const [leadSearchQuery, setLeadSearchQuery] = useState('');

  const filteredLeads = allLeads.filter(lead => 
    (lead?.name || '').toLowerCase().includes(leadSearchQuery.toLowerCase()) || 
    (lead?.email || '').toLowerCase().includes(leadSearchQuery.toLowerCase())
  );

  const handleUpdateStatus = async (id: string, currentStatus: any) => {
    setIsLoading(true);
    // Be explicit about the boolean conversion
    const nextStatus = !Boolean(currentStatus);
    try {
      const res = await adminFetch(`/api/leads/admin/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_confirmed: nextStatus })
      });
      if (res.ok) {
        showToast('Lead status updated', 'success');
        refreshLeads();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to update status', 'error');
      }
    } catch (err) {
      showToast('Failed to update status', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLead = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await adminFetch(`/api/leads/admin/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setConfirmDeleteLeadId(null);
        showToast('Lead deleted', 'success');
        refreshLeads();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to delete lead', 'error');
      }
    } catch (err) {
      showToast('Failed to delete lead', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Source', 'Confirmed', 'Date'];
    const csvContent = [
      headers.join(','),
      ...allLeads.map(l => [
        `"${l.name}"`,
        `"${l.email}"`,
        `"${l.source || 'Newsletter'}"`,
        l.is_confirmed ? 'Yes' : 'No',
        new Date(l.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-3">
          <Mail size={24} className="text-primary" />
          <h2 className="text-3xl font-headline font-bold">Manage Leads</h2>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={18} />
            <input 
              type="text"
              placeholder="Search leads..."
              value={leadSearchQuery}
              onChange={(e) => setLeadSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-outline-variant/30 focus:outline-none focus:border-primary transition-all text-sm"
            />
          </div>
          <button 
            onClick={handleExportCSV}
            className="bg-surface-container text-primary px-6 py-3 rounded-2xl font-label text-xs uppercase tracking-widest font-bold flex items-center gap-2 hover:bg-accent-blush/20 transition-all border border-primary/10"
          >
            <Download size={18} /> Export
          </button>
        </div>
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
                <th className="px-8 py-4">Joined Date</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="group hover:bg-surface-container/10 transition-colors">
                  <td className="px-8 py-4 font-bold">{lead.name}</td>
                  <td className="px-8 py-4 text-sm text-on-surface-variant">{lead.email}</td>
                  <td className="px-8 py-4 text-[10px] uppercase tracking-widest text-outline font-bold">{lead.source || 'Newsletter'}</td>
                  <td className="px-8 py-4">
                    <button 
                      onClick={() => handleUpdateStatus(lead.id, lead.is_confirmed)}
                      disabled={isLoading}
                      className="flex items-center gap-2 group/status"
                    >
                      {lead.is_confirmed ? (
                        <span className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest group-hover/status:bg-green-100 transition-colors">
                          <CheckCircle2 size={12} /> Confirmed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest group-hover/status:bg-yellow-100 transition-colors">
                          <XCircle size={12} /> Pending
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="px-8 py-4 text-[10px] text-outline">{new Date(lead.created_at).toLocaleDateString()}</td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {confirmDeleteLeadId === lead.id ? (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleDeleteLead(lead.id)}
                            className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest"
                          >
                            Confirm
                          </button>
                          <button 
                            onClick={() => setConfirmDeleteLeadId(null)}
                            className="border border-outline-variant px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setConfirmDeleteLeadId(lead.id)}
                          className="p-2 text-outline hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-outline italic">No leads found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
