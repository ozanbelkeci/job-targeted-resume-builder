'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CoverLetterPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [coverLetter, setCoverLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (force = false) => {
      if (!force && coverLetter) return;
      setIsGenerating(true);
      setError(null);
      try {
        const res = await fetch('/api/cover-letter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ optimizationId: id }),
        });
        const data = await res.json();
        if (!res.ok) {
          if (data.error === 'upgrade_required') {
            router.push(`/app/results/${id}`);
            return;
          }
          throw new Error(data.error ?? 'Failed to generate');
        }
        setCoverLetter(data.data.coverLetter);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      } finally {
        setIsGenerating(false);
      }
    },
    [id, coverLetter, router],
  );

  useEffect(() => {
    void generate();
  }, [generate]);

  async function handleCopy() {
    await navigator.clipboard.writeText(coverLetter);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href={`/app/results/${id}`}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#1E3A5F]">Cover Letter</h1>
            <p className="text-sm text-gray-400 mt-0.5">AI-generated, tailored to this job</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <svg className="animate-spin h-8 w-8 text-[#1E3A5F]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <p className="text-sm text-gray-500">Writing your cover letter...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Your Cover Letter
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => generate(true)}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#1E3A5F] border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Regenerate
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs text-white bg-[#1E3A5F] hover:bg-[#162d4a] rounded-lg px-3 py-1.5 transition-colors"
                  >
                    {isCopied ? (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={20}
                className="w-full border border-gray-200 rounded-xl p-4 text-sm text-gray-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] resize-none font-sans"
              />
              <p className="mt-2 text-xs text-gray-400">You can edit the text above before copying.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
