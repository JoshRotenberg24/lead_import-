'use client';

import { useState } from 'react';
import LeadForm from '@/components/LeadForm';
import CSVPreview from '@/components/CSVPreview';
import { Contact, AgentWebsiteContact, CSV_TEMPLATE_HEADERS } from '@/types/contacts';
import { contactToAgentWebsite } from '@/lib/fieldMapping';
import Papa from 'papaparse';

export default function Home() {
  const [leads, setLeads] = useState<Contact[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleAddLead = (lead: Contact) => {
    // Basic validation
    if (!lead.name?.trim()) {
      setError('Name is required');
      return;
    }
    if (!lead.email?.trim()) {
      setError('Email is required');
      return;
    }

    // Check for duplicate email
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
      // Convert leads to AgentWebsite format
      const awLeads: AgentWebsiteContact[] = leads.map(contactToAgentWebsite);

      // Create CSV
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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Lead Import Tool
          </h1>
          <p className="text-gray-600">
            Add leads one at a time. Download as CSV when done.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Error Messages */}
          {error && (
            <div className="bg-white rounded-lg shadow-sm p-4 border border-red-200">
              <div className="flex items-center gap-2 text-red-600">
                <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="font-medium">{error}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Form */}
            <div className="lg:col-span-2">
              <LeadForm onAddLead={handleAddLead} />
            </div>

            {/* Right: Summary & Actions */}
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Leads</p>
                    <p className="text-3xl font-bold text-blue-600">{leads.length}</p>
                  </div>

                  {leads.length > 0 && (
                    <button
                      onClick={handleDownloadCSV}
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Download CSV
                    </button>
                  )}

                  {leads.length > 0 && (
                    <button
                      onClick={() => {
                        setLeads([]);
                        setError(null);
                      }}
                      className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">How it works</h3>
                <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Fill form & click "Add Lead"</li>
                  <li>Repeat for each lead</li>
                  <li>Click "Download CSV"</li>
                  <li>Upload in Control Panel</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Leads List */}
          {leads.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Added Leads ({leads.length})</h2>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Email</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Phone</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">City</th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead, idx) => (
                      <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900">{lead.name}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{lead.email}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{lead.phone || '-'}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{lead.city || '-'}</td>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => handleRemoveLead(idx)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
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
      </div>
    </main>
  );
}
