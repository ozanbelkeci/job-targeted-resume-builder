'use client';

import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { LinkedInSuggestions } from '@/types';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#1E3A5F] border border-gray-200 rounded-lg px-2.5 py-1.5 transition-colors flex-shrink-0"
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
  );
}

export default function LinkedInPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<LinkedInSuggestions | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/linkedin-optimize', {
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
      setSuggestions(data.data.suggestions as LinkedInSuggestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [id, router]);

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
            <h1 className="text-2xl font-bold text-[#1E3A5F]">LinkedIn Profile Optimizer</h1>
            <p className="text-sm text-gray-400 mt-0.5">Tailored suggestions for this job</p>
          </div>
        </div>

        {!suggestions && !isGenerating && (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 shadow-sm flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#1E3A5F]/10 flex items-center justify-center">
              <svg className="w-7 h-7 text-[#1E3A5F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-800 mb-1">Ready to optimize your LinkedIn profile?</p>
              <p className="text-sm text-gray-400">We&apos;ll generate a headline, about section, and skills list tailored to this job.</p>
            </div>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            <button
              onClick={generate}
              className="bg-[#1E3A5F] hover:bg-[#162d4a] text-white rounded-lg px-6 py-2.5 text-sm font-medium transition-colors"
            >
              Generate Suggestions
            </button>
          </div>
        )}

        {isGenerating && (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 shadow-sm flex flex-col items-center gap-4">
            <svg className="animate-spin h-8 w-8 text-[#1E3A5F]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <p className="text-sm text-gray-500">Optimizing your LinkedIn profile...</p>
          </div>
        )}

        {suggestions && (
          <div className="space-y-5">
            {/* Headlines */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Headline Suggestions
              </h2>
              <div className="space-y-3">
                {suggestions.headlines.map((headline, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 p-3 border border-gray-100 rounded-xl bg-gray-50"
                  >
                    <p className="text-sm text-gray-700 font-medium">{headline}</p>
                    <CopyButton text={headline} />
                  </div>
                ))}
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  About / Summary
                </h2>
                <CopyButton text={suggestions.about} />
              </div>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {suggestions.about}
              </p>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Recommended Skills
                </h2>
                <CopyButton text={suggestions.skills.join(', ')} />
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs bg-[#1E3A5F]/10 text-[#1E3A5F] px-2.5 py-1 rounded-md font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={generate}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1E3A5F] border border-gray-200 rounded-lg px-4 py-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Regenerate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
