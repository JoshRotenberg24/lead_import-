'use client';

import { ValidationError } from '@/types/validation';

interface ValidationErrorsProps {
  errors: ValidationError[];
  maxErrors?: number;
}

export default function ValidationErrors({ errors, maxErrors = 10 }: ValidationErrorsProps) {
  if (errors.length === 0) {
    return null;
  }

  const displayErrors = errors.slice(0, maxErrors);
  const hasMore = errors.length > maxErrors;

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <svg
          className="h-5 w-5 text-red-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        <h3 className="font-medium text-red-800">
          {errors.length} validation error{errors.length !== 1 ? 's' : ''}
        </h3>
      </div>

      <div className="space-y-2 text-sm">
        {displayErrors.map((error, idx) => (
          <div key={idx} className="text-red-700">
            <strong>Row {error.rowIndex + 1}, {error.field}:</strong> {error.error}
            {error.value && (
              <div className="text-red-600 text-xs mt-1">Value: "{error.value}"</div>
            )}
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="mt-3 text-sm text-red-700">
          ... and {errors.length - maxErrors} more error{errors.length - maxErrors !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
