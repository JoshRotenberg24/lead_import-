'use client';

import { useState } from 'react';
import LeadForm from '@/components/LeadForm';
import { Contact, AgentWebsiteContact, CSV_TEMPLATE_HEADERS } from '@/types/contacts';
import { contactToAgentWebsite } from '@/lib/fieldMapping';
import Papa from 'papaparse';

export default function Home() {
  const [leads, setLeads] = useState<Contact[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleAddLead = (lead: Contact) => {
    if (!lead.name?.trim()) {
      setError('Name is required');
      return;
    }
    if (!lead.email?.trim()) {
      setError('Email is required');
      return;
    }

    if (leads.some((l) => l.email?.toLowerCase() === lead.email?.toLowerCase())) {
      setError(`Email "${lead.email}" already added`);
      return;
    }

    setLeads((prev) => [...prev, lead]);
    setError(null);
  };

  const handleRemoveLead = (index: number) => {
    setLeads((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDownloadCSV = () => {
    if (leads.length === 0) {
      setError('No leads to download');
      return;
    }

    try {
      const awLeads: AgentWebsiteContact[] = leads.map(contactToAgentWebsite);

      const rows = [CSV_TEMPLATE_HEADERS];
      awLeads.forEach((lead) => {
        rows.push([
          lead.Name || '',
          lead.Email || '',
          lead.Phone || '',
          lead.Address || '',
          lead.City || '',
          lead.State || '',
          lead.Zip || '',
          lead.Birthday || '',
          lead.Type || '',
          lead.Anniversary || '',
          lead.Pipeline || '',
          lead.Texting || '',
          lead.Tags || '',
          lead.CampaignIDs || '',
          lead.MarketIDs || '',
          lead.Note || '',
          lead.Source || '',
        ]);
      });

      const csv = Papa.unparse(rows);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download CSV');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="max-w-5xl mx-auto mb-12 text-center">
          <div className="inline-block mb-4">
            <span className="text-5xl">🚀</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-3">
            Lead Import Tool
          </h1>
          <p className="text-xl text-gray-300">
            Add leads one by one and download as CSV for AgentWebsite
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="max-w-5xl mx-auto mb-8">
            <div className="bg-red-900/50 border-l-4 border-red-500 p-4 rounded-lg backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <p className="text-red-200 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Form - 2/3 width */}
            <div className="lg:col-span-2">
              <LeadForm onAddLead={handleAddLead} />
            </div>

            {/* Right: Summary - 1/3 width */}
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl shadow-xl p-8 text-white">
                <div className="mb-6">
                  <h2 className="text-sm font-semibold text-indigo-100 mb-2">TOTAL LEADS</h2>
                  <p className="text-5xl font-bold">{leads.length}</p>
                </div>

                {leads.length > 0 && (
                  <>
                    <button
                      onClick={handleDownloadCSV}
                      className="w-full px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-all mb-3 active:scale-95"
                    >
                      ⬇️ Download CSV
                    </button>

                    <button
                      onClick={() => {
                        setLeads([]);
                        setError(null);
                      }}
                      className="w-full px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-all active:scale-95"
                    >
                      🗑️ Clear All
                    </button>
                  </>
                )}

                {leads.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-indigo-100 text-sm">Add leads to get started</p>
                  </div>
                )}
              </div>

              {/* Help Card */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <span>💡</span> Quick Start
                </h3>
                <ol className="text-sm space-y-3 text-gray-300">
                  <li className="flex gap-3">
                    <span className="font-bold text-indigo-400">1</span>
                    <span>Fill in the form</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-indigo-400">2</span>
                    <span>Click "Add Lead"</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-indigo-400">3</span>
                    <span>Repeat as needed</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-indigo-400">4</span>
                    <span>Download CSV</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* Leads Table */}
          {leads.length > 0 && (
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-8 py-6 border-b border-white/10">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span>📋</span> Your Leads ({leads.length})
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-gray-300">#</th>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-gray-300">Name</th>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-gray-300">Phone</th>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-gray-300">City</th>
                      <th className="px-8 py-4 text-center text-sm font-semibold text-gray-300">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {leads.map((lead, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="px-8 py-4 text-sm text-gray-400">{idx + 1}</td>
                        <td className="px-8 py-4 text-sm text-white font-medium">{lead.name}</td>
                        <td className="px-8 py-4 text-sm text-gray-300">{lead.email}</td>
                        <td className="px-8 py-4 text-sm text-gray-400">{lead.phone || '—'}</td>
                        <td className="px-8 py-4 text-sm text-gray-400">{lead.city || '—'}</td>
                        <td className="px-8 py-4 text-center">
                          <button
                            onClick={() => handleRemoveLead(idx)}
                            className="text-red-400 hover:text-red-300 text-sm font-semibold transition-colors"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="max-w-5xl mx-auto mt-16 text-center text-gray-500 text-sm">
          <p>Prepare your leads for AgentWebsite with ease ✨</p>
        </div>
      </div>
    </main>
  );
}
