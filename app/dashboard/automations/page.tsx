'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Automation, EmailTemplate } from '@/generated/prisma/client';

interface AutomationWithTemplate extends Automation {
  template: EmailTemplate;
  enrolledCount?: number;
}

export default function AutomationsDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [automations, setAutomations] = useState<AutomationWithTemplate[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'birthday',
    templateId: '',
    description: '',
    daysBefore: '0',
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const userId = (session?.user as any)?.id || '';

  // Fetch automations and templates
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [autoRes, temRes] = await Promise.all([
          fetch(`/api/automations?userId=${userId}`),
          fetch(`/api/templates?userId=${userId}`),
        ]);

        if (!autoRes.ok) throw new Error('Failed to fetch automations');
        if (!temRes.ok) throw new Error('Failed to fetch templates');

        const autoData = await autoRes.json();
        const temData = await temRes.json();

        setAutomations(autoData || []);
        setTemplates(temData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleCreateAutomation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.templateId) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: formData.name,
          type: formData.type,
          templateId: formData.templateId,
          description: formData.description,
          daysBefore: parseInt(formData.daysBefore),
        }),
      });

      if (!response.ok) throw new Error('Failed to create automation');

      const newAutomation = await response.json();
      setAutomations([newAutomation, ...automations]);
      setShowForm(false);
      setFormData({
        name: '',
        type: 'birthday',
        templateId: '',
        description: '',
        daysBefore: '0',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create automation');
    }
  };

  const handleDeleteAutomation = async (automationId: string) => {
    if (!confirm('Delete this automation?')) return;

    try {
      const response = await fetch(`/api/automations/${automationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete automation');

      setAutomations((prev) => prev.filter((a) => a.id !== automationId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete automation');
    }
  };

  const getAutomationIcon = (type: string) => {
    switch (type) {
      case 'birthday':
        return '🎂';
      case 'anniversary':
        return '💑';
      case 'holiday':
        return '🎉';
      default:
        return '⚙️';
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading automations...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Automations & Cadences</h1>
            <p className="text-slate-400">Create and manage automated email sequences</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition"
          >
            + New Automation
          </button>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-8 text-red-200">
            {error}
          </div>
        )}

        {/* Create Form */}
        {showForm && (
          <div className="bg-slate-900 rounded-lg p-6 mb-8 border border-slate-800">
            <h2 className="text-2xl font-bold mb-6">Create New Automation</h2>
            <form onSubmit={handleCreateAutomation} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Automation Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Birthday Email Sequence"
                    className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                  >
                    <option value="birthday">Birthday</option>
                    <option value="anniversary">Anniversary</option>
                    <option value="holiday">Holiday</option>
                    <option value="manual_trigger">Manual Trigger</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email Template *</label>
                <select
                  value={formData.templateId}
                  onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                >
                  <option value="">Select a template...</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What is this automation for?"
                  className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white placeholder-slate-500 h-20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Send Days Before Event</label>
                <input
                  type="number"
                  value={formData.daysBefore}
                  onChange={(e) => setFormData({ ...formData, daysBefore: e.target.value })}
                  min="0"
                  className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
                />
                <p className="text-xs text-slate-400 mt-1">
                  0 = send on the event date, 1 = send 1 day before, etc.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition"
                >
                  Create Automation
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-6 py-2 rounded transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Automations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {automations.length === 0 ? (
            <div className="col-span-full bg-slate-900 rounded-lg p-12 text-center border border-slate-800">
              <p className="text-slate-400 mb-4">No automations created yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition"
              >
                Create Your First Automation
              </button>
            </div>
          ) : (
            automations.map((automation) => (
              <div
                key={automation.id}
                className="bg-slate-900 rounded-lg p-6 border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{getAutomationIcon(automation.type)}</div>
                    <div>
                      <h3 className="font-bold text-lg">{automation.name}</h3>
                      <p className="text-sm text-slate-400 capitalize">{automation.type}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteAutomation(automation.id)}
                    className="text-slate-400 hover:text-red-400 transition"
                  >
                    ✕
                  </button>
                </div>

                {automation.description && (
                  <p className="text-sm text-slate-400 mb-4">{automation.description}</p>
                )}

                <div className="space-y-2 mb-4 p-3 bg-slate-800 rounded">
                  <div className="text-sm">
                    <span className="text-slate-400">Template:</span>
                    <span className="ml-2 text-white">{automation.template.name}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-slate-400">Send:</span>
                    <span className="ml-2 text-white">
                      {automation.daysBefore === 0 ? 'On the day' : `${automation.daysBefore} day(s) before`}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-slate-400">Status:</span>
                    <span
                      className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                        automation.isActive
                          ? 'bg-green-900/30 text-green-200'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {automation.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <button className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2 rounded transition text-sm">
                  View Details
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
