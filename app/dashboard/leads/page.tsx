'use client';

import { useState, useEffect } from 'react';
import AutomationEnrollmentModal from '@/components/AutomationEnrollmentModal';
import { Lead } from '@/generated/prisma/client';

interface LeadFilters {
  search: string;
  engagement: string;
  source: string;
  pipeline: string;
}

interface LeadStats {
  total: number;
  byEngagement: Record<string, number>;
  bySource: Record<string, number>;
  byPipeline: Record<string, number>;
}

export default function LeadsDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<LeadFilters>({
    search: '',
    engagement: '',
    source: '',
    pipeline: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'created' | 'engagement'>('created');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  // Mock userId - in real app, get from auth
  const userId = 'test-user-1';

  // Fetch leads and stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [leadsRes, statsRes] = await Promise.all([
          fetch(`/api/leads?userId=${userId}&skip=0&take=100`),
          fetch(`/api/leads/stats?userId=${userId}`),
        ]);

        if (!leadsRes.ok) throw new Error('Failed to fetch leads');
        if (!statsRes.ok) throw new Error('Failed to fetch stats');

        const leadsData = await leadsRes.json();
        const statsData = await statsRes.json();

        setLeads(leadsData.leads || []);
        setStats(statsData.stats || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...leads];

    // Search filter
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (lead) =>
          lead.name.toLowerCase().includes(q) ||
          lead.email.toLowerCase().includes(q) ||
          lead.phone?.toLowerCase().includes(q)
      );
    }

    // Other filters
    if (filters.engagement) {
      result = result.filter((lead) => lead.engagementRating === filters.engagement);
    }
    if (filters.source) {
      result = result.filter((lead) => lead.source === filters.source);
    }
    if (filters.pipeline) {
      result = result.filter((lead) => lead.pipeline === filters.pipeline);
    }

    // Sorting
    result.sort((a, b) => {
      let aVal: any = '';
      let bVal: any = '';

      switch (sortBy) {
        case 'name':
          aVal = a.name;
          bVal = b.name;
          break;
        case 'email':
          aVal = a.email;
          bVal = b.email;
          break;
        case 'engagement':
          aVal = a.engagementRating || '';
          bVal = b.engagementRating || '';
          break;
        case 'created':
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
      }

      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredLeads(result);
  }, [leads, filters, sortBy, sortDir]);

  const handleSelectLead = (leadId: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(new Set(filteredLeads.map((l) => l.id)));
    } else {
      setSelectedLeads(new Set());
    }
  };

  const handleDeleteLeads = async () => {
    if (selectedLeads.size === 0) return;

    if (!confirm(`Delete ${selectedLeads.size} lead(s)?`)) return;

    try {
      const response = await fetch('/api/leads/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          leadIds: Array.from(selectedLeads),
        }),
      });

      if (!response.ok) throw new Error('Failed to delete leads');

      setLeads((prev) => prev.filter((l) => !selectedLeads.has(l.id)));
      setSelectedLeads(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete leads');
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading leads...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Lead Management</h1>
          <p className="text-slate-400">Manage your leads, filter by criteria, and enroll in automations</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
              <div className="text-sm text-slate-400">Total Leads</div>
              <div className="text-3xl font-bold">{stats.total}</div>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
              <div className="text-sm text-slate-400">Hot</div>
              <div className="text-3xl font-bold text-red-400">{stats.byEngagement['Hot'] || 0}</div>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
              <div className="text-sm text-slate-400">Warm</div>
              <div className="text-3xl font-bold text-yellow-400">{stats.byEngagement['Warm'] || 0}</div>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
              <div className="text-sm text-slate-400">Cold</div>
              <div className="text-3xl font-bold text-blue-400">{stats.byEngagement['Cold'] || 0}</div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-8 text-red-200">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-slate-900 rounded-lg p-6 mb-8 border border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white placeholder-slate-500"
            />
            <select
              value={filters.engagement}
              onChange={(e) => setFilters({ ...filters, engagement: e.target.value })}
              className="bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
            >
              <option value="">All Engagement</option>
              <option value="Hot">Hot</option>
              <option value="Warm">Warm</option>
              <option value="Cold">Cold</option>
            </select>
            <select
              value={filters.source}
              onChange={(e) => setFilters({ ...filters, source: e.target.value })}
              className="bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
            >
              <option value="">All Sources</option>
              {stats &&
                Object.keys(stats.bySource).map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
            </select>
            <select
              value={filters.pipeline}
              onChange={(e) => setFilters({ ...filters, pipeline: e.target.value })}
              className="bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
            >
              <option value="">All Pipelines</option>
              {stats &&
                Object.keys(stats.byPipeline).map((pipeline) => (
                  <option key={pipeline} value={pipeline}>
                    {pipeline}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-slate-400">
            {selectedLeads.size > 0 ? (
              <>
                {selectedLeads.size} of {filteredLeads.length} selected
              </>
            ) : (
              <>
                Showing {filteredLeads.length} of {leads.length}
              </>
            )}
          </div>
          {selectedLeads.size > 0 && (
            <div className="flex gap-2">
              <button
                onClick={handleDeleteLeads}
                className="bg-red-900/30 hover:bg-red-900/50 border border-red-700 text-red-200 px-4 py-2 rounded transition"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setShowEnrollModal(true)}
                className="bg-blue-900/30 hover:bg-blue-900/50 border border-blue-700 text-blue-200 px-4 py-2 rounded transition"
              >
                Add to Automation
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-800 border-b border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      filteredLeads.length > 0 &&
                      selectedLeads.size === filteredLeads.length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 cursor-pointer"
                  />
                </th>
                <th
                  className="px-6 py-3 text-left cursor-pointer hover:bg-slate-700"
                  onClick={() => {
                    if (sortBy === 'name') {
                      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy('name');
                      setSortDir('asc');
                    }
                  }}
                >
                  Name {sortBy === 'name' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="px-6 py-3 text-left cursor-pointer hover:bg-slate-700"
                  onClick={() => {
                    if (sortBy === 'email') {
                      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy('email');
                      setSortDir('asc');
                    }
                  }}
                >
                  Email {sortBy === 'email' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left">Phone</th>
                <th className="px-6 py-3 text-left">Source</th>
                <th className="px-6 py-3 text-left">Engagement</th>
                <th className="px-6 py-3 text-left">Pipeline</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-slate-800 hover:bg-slate-800/50 transition"
                >
                  <td className="px-6 py-3">
                    <input
                      type="checkbox"
                      checked={selectedLeads.has(lead.id)}
                      onChange={() => handleSelectLead(lead.id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-3">{lead.name}</td>
                  <td className="px-6 py-3 text-slate-400">{lead.email}</td>
                  <td className="px-6 py-3 text-slate-400">{lead.phone || '—'}</td>
                  <td className="px-6 py-3 text-slate-400">{lead.source || '—'}</td>
                  <td className="px-6 py-3">
                    {lead.engagementRating ? (
                      <span
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          lead.engagementRating === 'Hot'
                            ? 'bg-red-900/30 text-red-200'
                            : lead.engagementRating === 'Warm'
                            ? 'bg-yellow-900/30 text-yellow-200'
                            : 'bg-blue-900/30 text-blue-200'
                        }`}
                      >
                        {lead.engagementRating}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-6 py-3 text-slate-400">{lead.pipeline || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredLeads.length === 0 && (
            <div className="px-6 py-12 text-center text-slate-400">
              No leads found
            </div>
          )}
        </div>

        {/* Automation Enrollment Modal */}
        <AutomationEnrollmentModal
          isOpen={showEnrollModal}
          onClose={() => setShowEnrollModal(false)}
          selectedLeadIds={Array.from(selectedLeads)}
          userId={userId}
          onEnroll={() => {
            setSelectedLeads(new Set());
            // Refresh leads
            window.location.reload();
          }}
        />
      </div>
    </div>
  );
}
