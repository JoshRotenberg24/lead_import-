'use client';

import { AgentWebsiteContact } from '@/types/contacts';

interface CSVPreviewProps {
  data: AgentWebsiteContact[];
  maxRows?: number;
}

export default function CSVPreview({ data, maxRows = 5 }: CSVPreviewProps) {
  if (data.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500 text-center">No data to preview</p>
      </div>
    );
  }

  const displayData = data.slice(0, maxRows);
  const hasMore = data.length > maxRows;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-100 border-b border-gray-200">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Email</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Phone</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">City</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">State</th>
          </tr>
        </thead>
        <tbody>
          {displayData.map((row, idx) => (
            <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-4 py-2 text-sm text-gray-900">{row.Name}</td>
              <td className="px-4 py-2 text-sm text-gray-900">{row.Email}</td>
              <td className="px-4 py-2 text-sm text-gray-500">{row.Phone || '-'}</td>
              <td className="px-4 py-2 text-sm text-gray-500">{row.City || '-'}</td>
              <td className="px-4 py-2 text-sm text-gray-500">{row.State || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {hasMore && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-600">
          Showing {displayData.length} of {data.length} records
        </div>
      )}
    </div>
  );
}
