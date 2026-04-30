'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl border border-red-200 p-10 max-w-md w-full text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-500 text-sm mb-6">
          An unexpected error occurred. Please try again.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-[#1E3A5F] hover:bg-[#162d4a] text-white rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
          >
            Try Again
          </button>
          <a
            href="/"
            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
