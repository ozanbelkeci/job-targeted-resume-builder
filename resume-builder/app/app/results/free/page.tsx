'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AtsScoreRing } from '@/components/AtsScoreRing';
import { LockedCvPreview } from '@/components/LockedCvPreview';
import { UpgradeModal } from '@/components/UpgradeModal';
import { AppNavbar } from '@/components/AppNavbar';
import type { OptimizedCv } from '@/types';

interface FreeResult {
  job_title: string;
  job_company: string | null;
  optimized_cv_json: OptimizedCv;
  ats_score: number;
  ats_keywords: { matched: string[]; missing: string[] };
  tips: string[];
}

export default function FreeResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<FreeResult | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('freeOptimizationResult');
    if (!raw) {
      router.push('/app/upload');
      return;
    }
    try {
      setResult(JSON.parse(raw) as FreeResult);
    } catch {
      router.push('/app/upload');
    }
  }, [router]);

  if (!result) return null;

  const matched = result.ats_keywords.matched;
  const missing = result.ats_keywords.missing;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AppNavbar userEmail={null} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-[#1E3A5F]">{result.job_title}</h1>
            {result.job_company && (
              <p className="text-sm text-gray-500 mt-0.5">{result.job_company}</p>
            )}
          </div>
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="flex items-center gap-2 border border-[#1E3A5F]/40 text-[#1E3A5F] rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-blue-50/40 transition-colors"
          >
            🔒 Unlock to Download
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left panel — ATS analysis */}
          <div className="space-y-5">
            {/* ATS Score */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">ATS Score</h2>
              <div className="flex justify-center">
                <AtsScoreRing score={result.ats_score} />
              </div>
            </div>

            {/* Keywords */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Keywords</h2>
              {matched.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-green-700 mb-2">Matched ({matched.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {matched.map((kw) => (
                      <span key={kw} className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2.5 py-1">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {missing.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-red-600 mb-2">Missing ({missing.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {missing.map((kw) => (
                      <span key={kw} className="text-xs bg-red-50 text-red-600 border border-red-200 rounded-full px-2.5 py-1">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tips */}
            {result.tips.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Improvement Tips</h2>
                <ul className="space-y-2.5">
                  {result.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <span className="w-5 h-5 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5 text-blue-500 text-xs font-bold">
                        {i + 1}
                      </span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right panel — Locked CV */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden" style={{ minHeight: '500px' }}>
            <LockedCvPreview cv={result.optimized_cv_json} onUnlock={() => setShowUpgradeModal(true)} />
          </div>
        </div>

        {/* Upgrade banner */}
        <div className="mt-6 bg-gradient-to-r from-[#1E3A5F] to-[#162d4a] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white font-semibold">Want to save your results and download your optimized CV?</p>
            <p className="text-blue-200/80 text-sm mt-0.5">Upgrade to Starter for just $5 — save history, download PDF, full CV access.</p>
          </div>
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="flex-shrink-0 bg-white text-[#1E3A5F] rounded-xl px-6 py-2.5 text-sm font-bold hover:bg-blue-50 transition-colors shadow-sm whitespace-nowrap"
          >
            Upgrade Now →
          </button>
        </div>
      </div>

      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  );
}
