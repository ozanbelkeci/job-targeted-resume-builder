'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, type Variants } from 'framer-motion';
import { AtsScoreGauge } from '@/components/AtsScoreGauge';
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

// ── score styling helpers (same as ResultsClient) ───────────
function barColor(score: number) {
  if (score < 50) return 'bg-red-400';
  if (score < 75) return 'bg-amber-400';
  return 'bg-green-500';
}
function txtColor(score: number) {
  if (score < 50) return 'text-red-500';
  if (score < 75) return 'text-amber-500';
  return 'text-green-600';
}

// ── ProgressBar (same as ResultsClient) ─────────────────────
function ProgressBar({ label, score }: { label: string; score: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const steps = 32;
    const duration = 900;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setDisplay(Math.round((score * step) / steps));
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [score]);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500">{label}</span>
        <span className={`text-xs font-semibold ${txtColor(score)}`}>{display}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all duration-[28ms] ${barColor(score)}`}
          style={{ width: `${display}%` }}
        />
      </div>
    </div>
  );
}

// ── ScoreBreakdown (same as ResultsClient) ───────────────────
function ScoreBreakdown({ atsScore, matched, missing }: { atsScore: number; matched: string[]; missing: string[] }) {
  const keywordMatch = Math.round((matched.length / Math.max(matched.length + missing.length, 1)) * 100);
  const expRelevance = Math.round(atsScore * 0.9);
  const skillsAlign  = Math.round(atsScore * 0.85);
  return (
    <div className="mt-4 space-y-2.5 pt-4 border-t border-gray-100">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Score Breakdown</p>
      <ProgressBar label="Keyword Match"          score={keywordMatch} />
      <ProgressBar label="Experience Relevance"   score={expRelevance} />
      <ProgressBar label="Skills Alignment"       score={skillsAlign}  />
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────
export default function FreeResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<FreeResult | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('freeOptimizationResult');
    if (!raw) { router.push('/app/upload'); return; }
    try {
      setResult(JSON.parse(raw) as FreeResult);
    } catch {
      router.push('/app/upload');
    }
  }, [router]);

  if (!result) return null;

  const { job_title, job_company, optimized_cv_json, ats_score, ats_keywords, tips } = result;
  const matched = ats_keywords.matched;
  const missing = ats_keywords.missing;

  const panelVariants: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AppNavbar userEmail={null} />

      {/* Warning banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5">
        <p className="max-w-6xl mx-auto text-xs text-amber-700 flex items-center gap-2">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Your results are not saved. Upgrade to save and access your results anytime.
        </p>
      </div>

      <div className="px-6 py-8">
        <motion.div
          className="max-w-6xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        >
          {/* ── Top bar ── */}
          <motion.div variants={panelVariants} className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-xl font-bold text-[#1E3A5F] leading-tight">
                {job_title}
                {job_company && (
                  <span className="text-gray-400 font-normal"> · {job_company}</span>
                )}
              </h1>
              <p className="text-gray-400 text-xs mt-1">Your optimized resume is ready</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="flex items-center gap-2 border border-[#1E3A5F]/40 text-[#1E3A5F] rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-blue-50/40 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Unlock to Download
              </button>
            </div>
          </motion.div>

          {/* ── Action bar ── */}
          <motion.div variants={panelVariants} className="flex flex-wrap items-center gap-2 mb-5 p-3 bg-white rounded-2xl border border-gray-200 shadow-sm">
            {/* Cover Letter — locked */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-400 text-sm font-medium cursor-not-allowed select-none">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Cover Letter
            </div>
            {/* LinkedIn — locked */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-400 text-sm font-medium cursor-not-allowed select-none">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              LinkedIn Optimizer
            </div>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold underline underline-offset-2 hover:no-underline transition-colors px-1"
            >
              Upgrade to Pro →
            </button>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => router.push('/app/upload')}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-500 hover:text-[#1E3A5F] border border-gray-200 bg-white rounded-lg hover:border-[#1E3A5F]/30 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                Start Over
              </button>
            </div>
          </motion.div>

          {/* ── Two-column layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-5">

            {/* ── Left panel ── */}
            <div className="space-y-4">
              {/* ATS Score */}
              <motion.div variants={panelVariants} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 pt-5 pb-3 border-b border-gray-100">
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">ATS Match Score</h2>
                </div>
                <div className="p-5">
                  <div className="flex justify-center mb-2">
                    <AtsScoreGauge score={ats_score} />
                  </div>

                  <ScoreBreakdown atsScore={ats_score} matched={matched} missing={missing} />

                  {/* Matched keywords */}
                  {matched.length > 0 && (
                    <div className="mt-5">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Matched Keywords</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {matched.map((kw) => (
                          <span key={kw} className="flex items-center gap-1 bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-md font-medium">
                            <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing keywords — badges only, no checkboxes */}
                  {missing.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Missing Keywords</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {missing.map((kw) => (
                          <span key={kw} className="flex items-center gap-1 bg-red-50 text-red-600 text-xs px-2.5 py-1 rounded-md font-medium border border-transparent">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tips — numbered, no expand textarea */}
                  {tips.length > 0 && (
                    <div className="mt-5">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Improvement Tips</h3>
                      <ul className="space-y-3">
                        {tips.map((tip, i) => (
                          <li key={i} className="flex gap-2.5 text-sm text-gray-600">
                            <span className="w-5 h-5 flex-shrink-0 rounded-full bg-blue-100 text-[#1E3A5F] text-xs flex items-center justify-center font-bold mt-0.5">
                              {i + 1}
                            </span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* ── Right panel — locked CV ── */}
            <motion.div variants={panelVariants} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              {/* Header */}
              <div className="px-5 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                <h2 className="text-sm font-semibold text-gray-700">Resume Preview</h2>
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button className="px-3 py-1 text-xs font-semibold rounded-md bg-white text-[#1E3A5F] shadow-sm">
                    Optimized
                  </button>
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md text-gray-400 cursor-pointer hover:text-gray-500 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Original
                  </button>
                </div>
              </div>

              {/* Locked CV body */}
              <div className="flex-1 overflow-hidden">
                <LockedCvPreview cv={optimized_cv_json} onUnlock={() => setShowUpgradeModal(true)} />
              </div>
            </motion.div>
          </div>

          {/* ── Upgrade banner ── */}
          <motion.div
            variants={panelVariants}
            className="mt-5 bg-gradient-to-r from-[#1E3A5F] to-[#162d4a] rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div>
              <p className="text-white font-semibold text-sm">Want to save your results and download your optimized CV?</p>
              <p className="text-blue-200/70 text-xs mt-0.5">Upgrade to Starter for $5 — save history, download PDF, full CV access.</p>
            </div>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="flex-shrink-0 bg-white text-[#1E3A5F] rounded-xl px-6 py-2.5 text-sm font-bold hover:bg-blue-50 transition-colors shadow-sm whitespace-nowrap"
            >
              Upgrade Now →
            </button>
          </motion.div>
        </motion.div>
      </div>

      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  );
}
