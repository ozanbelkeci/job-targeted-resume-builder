'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MorphingSquare } from '@/components/morphing-square';

const STEPS = [
  'Reading your resume...',
  'Analyzing the job description...',
  'Identifying key skills and keywords...',
  'Rewriting your experience...',
  'Calculating ATS match score...',
];

export default function ProcessingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const resumeId = sessionStorage.getItem('resumeId');
    const jobDescription = sessionStorage.getItem('jobDescription');
    const jobInputType = sessionStorage.getItem('jobInputType');
    const jobUrl = sessionStorage.getItem('jobUrl');

    if (!resumeId || !jobDescription || !jobInputType) {
      router.push('/app/upload');
      return;
    }

    // Warn user before leaving
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Animate steps
    let stepIndex = 0;
    const stepInterval = setInterval(() => {
      stepIndex = Math.min(stepIndex + 1, STEPS.length - 1);
      setCurrentStep(stepIndex);
    }, 2500);

    // Call optimize API
    fetch('/api/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resumeId,
        jobDescription,
        jobInputType,
        jobUrl: jobUrl ?? null,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        clearInterval(stepInterval);
        window.removeEventListener('beforeunload', handleBeforeUnload);

        if (result.error) {
          if (result.error === 'Insufficient credits') {
            sessionStorage.setItem('showUpgradeModal', 'true');
            router.push('/app/upload');
            return;
          }
          setError(result.error);
          return;
        }

        // Clear session data
        sessionStorage.removeItem('jobDescription');
        sessionStorage.removeItem('jobInputType');
        sessionStorage.removeItem('jobUrl');

        router.push(`/app/results/${result.data.optimizationId}`);
      })
      .catch(() => {
        clearInterval(stepInterval);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        setError('Something went wrong. Your credit has not been used. Please try again.');
      });

    return () => {
      clearInterval(stepInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-6">
        <motion.div
          className="bg-white rounded-2xl border border-red-200 p-10 max-w-md w-full text-center shadow-sm"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <button
            onClick={() => router.push('/app/job')}
            className="bg-[#1E3A5F] hover:bg-[#162d4a] text-white rounded-lg px-6 py-2.5 text-sm font-medium"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-6">
      <motion.div
        className="bg-white rounded-2xl border border-gray-200 p-10 max-w-md w-full text-center shadow-sm"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        {/* MorphingSquare loader */}
        <div className="flex justify-center mb-8">
          <MorphingSquare className="w-14 h-14 bg-[#1E3A5F]" />
        </div>

        <h2 className="text-xl font-semibold text-[#1E3A5F] mb-2">Optimizing Your Resume</h2>
        <p className="text-gray-400 text-sm mb-8">This usually takes 15-30 seconds</p>

        {/* Steps */}
        <motion.div
          className="space-y-3 text-left"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }}
        >
          {STEPS.map((step, i) => (
            <motion.div
              key={step}
              variants={{
                hidden: { opacity: 0, x: -8 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
              }}
              className={`flex items-center gap-3 text-sm transition-all duration-500 ${
                i < currentStep
                  ? 'text-green-600'
                  : i === currentStep
                  ? 'text-[#1E3A5F] font-medium'
                  : 'text-gray-300'
              }`}
            >
              <span className="w-5 h-5 flex-shrink-0">
                {i < currentStep ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : i === currentStep ? (
                  <svg className="animate-spin w-4 h-4 mt-0.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <span className="w-5 h-5 rounded-full border-2 border-gray-200 block" />
                )}
              </span>
              {step}
            </motion.div>
          ))}
        </motion.div>

        <p className="mt-8 text-xs text-gray-400">
          Please don&apos;t close this tab — your optimization is in progress.
        </p>
      </motion.div>
    </div>
  );
}
