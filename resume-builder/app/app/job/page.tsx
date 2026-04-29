'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { UpgradeModal } from '@/components/UpgradeModal';
import { JOB_DESCRIPTION_MIN_CHARS } from '@/lib/constants';

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
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8 text-sm text-gray-400">
          <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-bold">✓</span>
          <span className="text-gray-400">Upload Resume</span>
          <span className="mx-2">→</span>
          <span className="w-6 h-6 rounded-full bg-[#1E3A5F] text-white text-xs flex items-center justify-center font-bold">2</span>
          <span className="text-[#1E3A5F] font-medium">Job Details</span>
          <span className="mx-2">→</span>
          <span className="w-6 h-6 rounded-full bg-gray-200 text-xs flex items-center justify-center font-bold">3</span>
          <span>Results</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-[#1E3A5F] mb-2">Enter Job Details</h1>
          <p className="text-gray-500 text-sm mb-6">
            Copy it directly from LinkedIn, Indeed, or any job board.
          </p>

          <Textarea
            placeholder="Paste the job description here..."
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            rows={10}
            className="rounded-lg resize-none"
          />

          <div className="mt-2 flex items-center justify-between">
            {textValue.length > 0 && textValue.length < JOB_DESCRIPTION_MIN_CHARS ? (
              <p className="text-sm text-red-500">
                {JOB_DESCRIPTION_MIN_CHARS - textValue.length} more characters needed
              </p>
            ) : (
              <span />
            )}
            <p className="text-xs text-gray-400 ml-auto">{textValue.length} chars</p>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={isSubmitDisabled()}
            className="mt-4 w-full bg-[#1E3A5F] hover:bg-[#162d4a] text-white rounded-lg py-5 text-base font-medium disabled:opacity-40"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Checking...
              </span>
            ) : (
              'Analyze & Optimize →'
            )}
          </Button>
        </div>
      </div>

      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSelectStarter={() => setShowUpgradeModal(false)}
        onSelectPro={() => setShowUpgradeModal(false)}
      />
    </div>
  );
}
