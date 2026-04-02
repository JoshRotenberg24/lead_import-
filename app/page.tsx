'use client';

import { useState, useEffect } from 'react';
import LeadForm from '@/components/LeadForm';
import FileUpload from '@/components/FileUpload';
import CSVPreview from '@/components/CSVPreview';
import ValidationErrors from '@/components/ValidationErrors';
import { Contact, AgentWebsiteContact, CSV_TEMPLATE_HEADERS, UploadResult } from '@/types/contacts';
import { contactToAgentWebsite } from '@/lib/fieldMapping';
import Papa from 'papaparse';

export default function Home() {
  const [leads, setLeads] = useState<Contact[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'form' | 'csv'>('form'); // Toggle between form and CSV modes
  const [csvResult, setCsvResult] = useState<UploadResult | null>(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);

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

  const handleCSVFileSelected = (file: File) => {
    setCsvFile(file);
    setCsvResult(null);
    setError(null);
  };

  const handleProcessCSV = async () => {
    if (!csvFile) {
      setError('Please select a file');
      return;
    }

    setCsvLoading(true);
    setError(null);

    try {
      const fileContent = await csvFile.text();

      const response = await fetch('/api/process-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: fileContent,
          filename: csvFile.name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process file');
      }

      const data = (await response.json()) as UploadResult;
      setCsvResult(data);

      // Add valid leads to the list
      if (data.cleanedData.length > 0) {
        const newLeads = data.cleanedData.map((awLead) => ({
          name: awLead.Name,
          email: awLead.Email,
          phone: awLead.Phone,
          address: awLead.Address,
          city: awLead.City,
          state: awLead.State,
          zip: awLead.Zip,
          birthday: awLead.Birthday,
          type: awLead.Type,
          anniversary: awLead.Anniversary,
          pipeline: awLead.Pipeline,
          texting: awLead.Texting,
          tags: awLead.Tags?.split(',').map((t) => t.trim()),
          campaignIds: awLead.CampaignIDs?.split(',').map((c) => c.trim()),
          marketIds: awLead.MarketIDs?.split(',').map((m) => m.trim()),
          note: awLead.Note,
          source: awLead.Source,
          engagementRating: awLead.EngagementRating,
          dateMet: awLead.DateMet,
          dateCreated: awLead.DateCreated,
          leadSource: awLead.LeadSource,
        } as Contact));

        setLeads((prev) => [...prev, ...newLeads]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setCsvLoading(false);
    }
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
          lead.LeadSource || '',
          lead.EngagementRating || '',
          lead.DateMet || '',
          lead.DateCreated || '',
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

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/template');
      if (!response.ok) {
        throw new Error('Failed to download template');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'contact-template.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download template');
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
            Add leads one by one or bulk import CSV files
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="max-w-5xl mx-auto mb-8 flex justify-center gap-4">
          <button
            onClick={() => {
              setMode('form');
              setError(null);
            }}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              mode === 'form'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            📝 Add Single Lead
          </button>
          <button
            onClick={() => {
              setMode('csv');
              setError(null);
            }}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              mode === 'csv'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            📂 Bulk Import CSV
          </button>
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
            {/* Left: Form or CSV Upload - 2/3 width */}
            <div className="lg:col-span-2">
              {mode === 'form' ? (
                <LeadForm onAddLead={handleAddLead} />
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">📂 Bulk Import CSV</h2>
                    <p className="text-gray-600 mt-2 text-sm">
                      Upload a CSV file with multiple leads. We'll validate and clean the data.
                    </p>
                  </div>

                  {/* Template Download */}
                  <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100">
                    <p className="text-sm text-blue-900 mb-3">
                      Need a template? Download one to see the correct format.
                    </p>
                    <button
                      onClick={handleDownloadTemplate}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      📥 Download Template
                    </button>
                  </div>

                  {/* File Upload */}
                  <div className="mb-6">
                    <FileUpload onFileSelected={handleCSVFileSelected} />

                    {csvFile && (
                      <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-indigo-900">{csvFile.name}</p>
                          <p className="text-xs text-indigo-700">
                            {(csvFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setCsvFile(null);
                            setCsvResult(null);
                          }}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Process Button */}
                  {csvFile && !csvResult && (
                    <button
                      onClick={handleProcessCSV}
                      disabled={csvLoading}
                      className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold rounded-lg transition-all shadow-lg"
                    >
                      {csvLoading ? '⏳ Processing...' : '✨ Validate & Import'}
                    </button>
                  )}

                  {/* Results */}
                  {csvResult && (
                    <div className="space-y-4 mt-6">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs text-blue-700 font-medium">Total Rows</p>
                          <p className="text-2xl font-bold text-blue-900">{csvResult.totalRows}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-xs text-green-700 font-medium">Valid</p>
                          <p className="text-2xl font-bold text-green-900">{csvResult.validRows}</p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg">
                          <p className="text-xs text-red-700 font-medium">Errors</p>
                          <p className="text-2xl font-bold text-red-900">{csvResult.invalidRows.length}</p>
                        </div>
                      </div>

                      {csvResult.invalidRows.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <p className="text-sm text-red-800 font-medium mb-2">
                            ⚠️ {csvResult.invalidRows.length} rows with errors
                          </p>
                          <ValidationErrors errors={csvResult.invalidRows} maxErrors={5} />
                        </div>
                      )}

                      <button
                        onClick={() => {
                          setCsvFile(null);
                          setCsvResult(null);
                        }}
                        className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Import Another File
                      </button>
                    </div>
                  )}
                </div>
              )}
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
                  <span>💡</span> Next Steps
                </h3>
                <ol className="text-sm space-y-2 text-gray-300">
                  <li className="flex gap-3">
                    <span className="font-bold text-indigo-400">1</span>
                    <span>Add leads (form or CSV)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-indigo-400">2</span>
                    <span>Review in table below</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-indigo-400">3</span>
                    <span>Download CSV</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-indigo-400">4</span>
                    <span>Upload in Control Panel</span>
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
                      <th className="px-8 py-4 text-left text-sm font-semibold text-gray-300">Source</th>
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
                        <td className="px-8 py-4 text-sm text-gray-400">{lead.leadSource || '—'}</td>
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
