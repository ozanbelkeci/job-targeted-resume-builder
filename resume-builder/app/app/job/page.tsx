'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { UpgradeModal } from '@/components/UpgradeModal';
import { JOB_DESCRIPTION_MIN_CHARS } from '@/lib/constants';

function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: 'Upload Resume' },
    { n: 2, label: 'Job Details' },
    { n: 3, label: 'Results' },
  ];
  return (
    <div className="flex items-center gap-0 mb-10">
      {steps.map((s, i) => {
        const done = s.n < current;
        const active = s.n === current;
        return (
          <div key={s.n} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  done
                    ? 'bg-green-500 text-white shadow-sm shadow-green-200'
                    : active
                      ? 'bg-[#1E3A5F] text-white shadow-sm shadow-[#1E3A5F]/30'
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                {done ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  s.n
                )}
              </div>
              <span
                className={`text-sm font-medium transition-colors ${
                  active ? 'text-[#1E3A5F]' : done ? 'text-gray-400' : 'text-gray-300'
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`mx-3 h-px w-8 transition-colors ${done ? 'bg-green-300' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function JobPage() {
  const router = useRouter();
  const [textValue, setTextValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    const resumeId = sessionStorage.getItem('resumeId');
    if (!resumeId) {
      router.push('/app/upload');
    }
  }, [router]);

  function isSubmitDisabled() {
    if (isLoading) return true;
    return textValue.length < JOB_DESCRIPTION_MIN_CHARS;
  }

  const charsNeeded = Math.max(0, JOB_DESCRIPTION_MIN_CHARS - textValue.length);
  const progressPct = Math.min(100, (textValue.length / JOB_DESCRIPTION_MIN_CHARS) * 100);

  async function handleSubmit() {
    setIsLoading(true);
    setError(null);

    const resumeId = sessionStorage.getItem('resumeId');
    if (!resumeId) {
      router.push('/app/upload');
      return;
    }

    try {
      const creditsRes = await fetch('/api/credits/check');
      const creditsData = await creditsRes.json();

      if (creditsRes.ok) {
        const { credits, is_pro } = creditsData.data as { credits: number; is_pro: boolean };
        if (!is_pro && credits <= 0) {
          setShowUpgradeModal(true);
          setIsLoading(false);
          return;
        }
      }

      sessionStorage.setItem('jobDescription', textValue);
      sessionStorage.setItem('jobInputType', 'text');

      router.push('/app/processing');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden bg-gradient-to-b from-[#F0F4F8] via-white to-white">
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(at 50% 0%, rgba(30,58,95,0.06) 0%, transparent 60%)' }}
      />
      <div className="absolute inset-0 bg-dot-grid opacity-40 pointer-events-none" />

      <div className="relative w-full max-w-xl">
        <StepIndicator current={2} />

        <motion.div
          className="relative bg-white rounded-2xl border border-gray-200/80 p-8 shadow-lg glow-ring-navy overflow-hidden"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          {/* Top gradient accent */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-blue-300/60 to-transparent" />

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-lg bg-[#1E3A5F]/8 border border-[#1E3A5F]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-[#1E3A5F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-[#1E3A5F]">Paste Job Description</h1>
            </div>
            <p className="text-gray-400 text-sm ml-0">
              Copy directly from LinkedIn, Indeed, or any job board.
            </p>
          </div>

          {/* Textarea */}
          <div className="relative">
            <Textarea
              placeholder="Paste the full job description here…&#10;&#10;Include the role title, responsibilities, requirements, and any skills mentioned."
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              rows={11}
              className="rounded-xl resize-none border-gray-200 focus:border-[#1E3A5F] focus:ring-[#1E3A5F]/15 text-sm leading-relaxed"
            />
          </div>

          {/* Progress bar + char count */}
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between">
              {textValue.length > 0 && charsNeeded > 0 ? (
                <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {charsNeeded} more characters needed
                </p>
              ) : textValue.length >= JOB_DESCRIPTION_MIN_CHARS ? (
                <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Ready to optimize
                </p>
              ) : (
                <span />
              )}
              <p className="text-xs text-gray-400 ml-auto">{textValue.length} chars</p>
            </div>

            {textValue.length > 0 && textValue.length < JOB_DESCRIPTION_MIN_CHARS && (
              <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-2.5">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={isSubmitDisabled()}
            className="mt-5 w-full bg-[#1E3A5F] hover:bg-[#162d4a] text-white rounded-xl py-5 text-base font-semibold disabled:opacity-40 shadow-md shadow-[#1E3A5F]/20 hover:shadow-lg hover:shadow-[#1E3A5F]/25 transition-all hover:-translate-y-px"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Checking credits…
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Analyze & Optimize →
              </span>
            )}
          </Button>

          {/* Tip */}
          <div className="mt-4 flex items-start gap-2.5 px-1">
            <div className="w-5 h-5 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              <span className="font-medium text-gray-500">Tip:</span> Include the full job posting — requirements, responsibilities, and preferred skills — for the best optimization results.
            </p>
          </div>
        </motion.div>
      </div>

      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  );
}
