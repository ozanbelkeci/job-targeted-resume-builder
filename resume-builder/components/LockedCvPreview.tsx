'use client';

import type { OptimizedCv } from '@/types';

interface LockedCvPreviewProps {
  cv: OptimizedCv;
  onUnlock: () => void;
}

const SKELETON_LINES = [
  { w: 'w-full' }, { w: 'w-5/6' }, { w: 'w-full' }, { w: 'w-4/5' },
  { w: 'w-3/4' }, { w: 'w-full' }, { w: 'w-2/3' }, { w: 'w-full' },
  { w: 'w-5/6' }, { w: 'w-full' }, { w: 'w-4/5' }, { w: 'w-3/4' },
];

export function LockedCvPreview({ cv, onUnlock }: LockedCvPreviewProps) {
  const contactLine = [cv.email, cv.phone, cv.location]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="relative flex flex-col h-full min-h-[520px]">
      {/* ── Visible header (no blur) ── */}
      <div className="px-6 py-5 border-b border-gray-100 flex-shrink-0">
        <h1 className="text-xl font-bold text-gray-900 leading-tight">{cv.name}</h1>
        {cv.job_title && (
          <p className="text-sm text-gray-500 mt-0.5">{cv.job_title}</p>
        )}
        {contactLine && (
          <p className="text-xs text-gray-400 mt-1">{contactLine}</p>
        )}
      </div>

      {/* ── Blurred body + overlay ── */}
      <div className="relative flex-1 overflow-hidden">
        {/* Skeleton lines — blurred */}
        <div
          className="p-6 space-y-2.5 pointer-events-none select-none"
          style={{ filter: 'blur(6px)', opacity: 0.6 }}
          aria-hidden
        >
          <div className="h-2.5 bg-gray-300 rounded w-24 mb-4" />
          {SKELETON_LINES.map((l, i) => (
            <div key={i} className={`h-2 bg-gray-200 rounded ${l.w}`} />
          ))}
          <div className="h-2.5 bg-gray-300 rounded w-32 mt-5 mb-3" />
          {SKELETON_LINES.slice(0, 6).map((l, i) => (
            <div key={i + 20} className={`h-2 bg-gray-200 rounded ${l.w}`} />
          ))}
        </div>

        {/* Upgrade overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="bg-white/96 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-xl px-8 py-7 max-w-xs w-full text-center">
            {/* Lock icon */}
            <div className="w-11 h-11 rounded-xl bg-[#1E3A5F]/8 flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-[#1E3A5F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            <h3 className="font-bold text-gray-900 text-base mb-2">
              Unlock Your Optimized Resume
            </h3>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
              Your resume has been optimized for this role. Purchase a plan to download your ATS-ready CV.
            </p>

            <button
              onClick={onUnlock}
              className="w-full bg-[#1E3A5F] hover:bg-[#162d4a] text-white rounded-xl py-2.5 text-sm font-semibold transition-colors shadow-sm mb-3"
            >
              View Plans →
            </button>

            <div className="flex items-center justify-center gap-3 text-xs text-gray-400">
              <span>✓ Download PDF</span>
              <span>✓ Full CV</span>
              <span>✓ Cover Letter</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
