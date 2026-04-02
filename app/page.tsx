'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import CSVPreview from '@/components/CSVPreview';
import ValidationErrors from '@/components/ValidationErrors';
import { UploadResult } from '@/types/contacts';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile);
    setResult(null);
    setError(null);
  };

  const handleProcess = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fileContent = await file.text();

      const response = await fetch('/api/process-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: fileContent,
          filename: file.name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process file');
      }

      const data = (await response.json()) as UploadResult;
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadClean = async () => {
    if (!result) return;

    try {
      const response = await fetch('/api/download-clean-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: result.cleanedData }),
      });

      if (!response.ok) {
        throw new Error('Failed to download cleaned file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cleaned-leads-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download file');
    }
  };

  const handleDownloadErrors = async () => {
    if (!result || result.invalidRows.length === 0) return;

    try {
      const response = await fetch('/api/download-error-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ errors: result.invalidRows }),
      });

      if (!response.ok) {
        throw new Error('Failed to download error file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `error-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download file');
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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Lead Import Tool
          </h1>
          <p className="text-gray-600">
            Upload a CSV file with your leads. We'll validate, clean, and format it for AgentWebsite.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Step 1: Download Template */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Step 1: Download Template</h2>
            <p className="text-sm text-gray-600 mb-4">
              Get the CSV template to see the exact format needed for import.
            </p>
            <button
              onClick={handleDownloadTemplate}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Download Template
            </button>
          </div>

          {/* Step 2: Upload File */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 2: Upload Your CSV</h2>
            <FileUpload onFileSelected={handleFileSelected} />

            {file && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">{file.name}</p>
                  <p className="text-xs text-blue-700">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Step 3: Process & Review */}
          {file && !result && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 3: Validate & Format</h2>
              <button
                onClick={handleProcess}
                disabled={loading}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
              >
                {loading ? 'Processing...' : 'Validate & Format'}
              </button>
            </div>
          )}

          {/* Error Messages */}
          {error && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-red-200">
              <div className="flex items-center gap-2 text-red-600">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
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

          {/* Results */}
          {result && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Processing Summary</h2>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700 font-medium">Total Rows</p>
                    <p className="text-2xl font-bold text-blue-900">{result.totalRows}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700 font-medium">Valid Rows</p>
                    <p className="text-2xl font-bold text-green-900">{result.validRows}</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-700 font-medium">Errors</p>
                    <p className="text-2xl font-bold text-red-900">{result.invalidRows.length}</p>
                  </div>
                </div>

                {result.duplicateEmails.length > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                    <p className="text-sm font-medium text-yellow-800">
                      Found {result.duplicateEmails.length} duplicate email{result.duplicateEmails.length !== 1 ? 's' : ''} in your file
                    </p>
                  </div>
                )}

                {result.validRows > 0 && (
                  <button
                    onClick={handleDownloadClean}
                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Download Cleaned CSV ({result.validRows} rows)
                  </button>
                )}
              </div>

              {/* Validation Errors */}
              {result.invalidRows.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Validation Errors</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Fix these errors and try again
                    </p>
                  </div>

                  <ValidationErrors errors={result.invalidRows} maxErrors={15} />

                  <button
                    onClick={handleDownloadErrors}
                    className="mt-4 w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Download Error Report
                  </button>
                </div>
              )}

              {/* Data Preview */}
              {result.validRows > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview (First 5 rows)</h3>
                  <CSVPreview data={result.cleanedData} maxRows={5} />
                </div>
              )}

              {/* Next Steps */}
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Next Steps</h3>
                <ol className="list-decimal list-inside space-y-2 text-blue-900 text-sm">
                  <li>Download the cleaned CSV file above</li>
                  <li>Log into AgentWebsite Control Panel</li>
                  <li>Go to Contacts and use the Import function</li>
                  <li>Select the cleaned CSV file and upload</li>
                </ol>
              </div>

              {/* Start Over */}
              <button
                onClick={() => {
                  setFile(null);
                  setResult(null);
                  setError(null);
                }}
                className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                Process Another File
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
