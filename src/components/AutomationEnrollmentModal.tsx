'use client';

import { useState, useEffect } from 'react';
import { Automation } from '@/generated/prisma/client';

interface AutomationEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLeadIds: string[];
  userId: string;
  onEnroll: () => void;
}

export default function AutomationEnrollmentModal({
  isOpen,
  onClose,
  selectedLeadIds,
  userId,
  onEnroll,
}: AutomationEnrollmentModalProps) {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [selectedAutomation, setSelectedAutomation] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch automations
  useEffect(() => {
    if (!isOpen) return;

    const fetchAutomations = async () => {
      try {
        const res = await fetch(`/api/automations?userId=${userId}`);
        if (!res.ok) throw new Error('Failed to fetch automations');
        const data = await res.json();
        setAutomations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch automations');
      }
    };

    fetchAutomations();
  }, [isOpen, userId]);

  const handleEnroll = async () => {
    if (!selectedAutomation) {
      setError('Please select an automation');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Enroll each lead in the selected automation
      const results = await Promise.allSettled(
        selectedLeadIds.map((leadId) =>
          fetch('/api/leads/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'update',
              leadIds: [leadId],
              updateData: {
                automations: {
                  connect: { id: selectedAutomation },
                },
              },
            }),
          })
        )
      );

      const failed = results.filter((r) => r.status === 'rejected').length;

      if (failed > 0) {
        setError(`${failed} lead(s) failed to enroll`);
      } else {
        onEnroll();
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enrollment failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4 text-white">Add to Automation</h2>

        <div className="mb-6">
          <p className="text-slate-400 text-sm mb-4">
            Enroll {selectedLeadIds.length} lead(s) in a cadence or automation
          </p>

          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded p-3 mb-4 text-red-200 text-sm">
              {error}
            </div>
          )}

          {automations.length === 0 ? (
            <div className="bg-blue-900/30 border border-blue-700 rounded p-3 text-blue-200 text-sm">
              No automations set up yet.{' '}
              <a href="/dashboard/automations" className="underline hover:no-underline">
                Create one first
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {automations.map((automation) => (
                <label
                  key={automation.id}
                  className="flex items-start p-3 bg-slate-800 border border-slate-700 rounded cursor-pointer hover:bg-slate-700/50 transition"
                >
                  <input
                    type="radio"
                    name="automation"
                    value={automation.id}
                    checked={selectedAutomation === automation.id}
                    onChange={(e) => setSelectedAutomation(e.target.value)}
                    className="w-4 h-4 mt-1 mr-3 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-white">{automation.name}</div>
                    <div className="text-sm text-slate-400">{automation.description}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Type: {automation.type} • Enrolled: TBD
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2 rounded transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleEnroll}
            disabled={loading || !selectedAutomation}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition disabled:opacity-50"
          >
            {loading ? 'Enrolling...' : 'Enroll'}
          </button>
        </div>
      </div>
    </div>
  );
}
