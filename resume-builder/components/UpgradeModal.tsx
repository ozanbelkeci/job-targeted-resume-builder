'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  onSelectStarter: () => void;
  onSelectPro: () => void;
  onSelectLifetime: () => void;
}

const CHECK = (
  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);

const DASH = (
  <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
  </svg>
);

function Feature({ available, label }: { available: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {available ? CHECK : DASH}
      <span className={`text-sm ${available ? 'text-gray-700' : 'text-gray-400'}`}>{label}</span>
    </div>
  );
}

export function UpgradeModal({
  open,
  onClose,
  onSelectStarter,
  onSelectPro,
  onSelectLifetime,
}: UpgradeModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-[#1E3A5F] text-xl">
            Unlock Your Optimized Resume
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Your ATS score is ready. Get your optimized CV to start applying.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3 mt-1">

          {/* Starter */}
          <div className="border border-gray-200 rounded-2xl p-5 flex flex-col">
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Starter</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">$5</span>
                <span className="text-sm text-gray-400">one-time</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">5 optimizations</p>
            </div>
            <div className="space-y-2 flex-1 mb-5">
              <Feature available label="PDF download" />
              <Feature available label="Full CV access" />
              <Feature available={false} label="Cover Letter" />
              <Feature available={false} label="LinkedIn Optimizer" />
            </div>
            <button
              onClick={onSelectStarter}
              className="w-full border border-[#1E3A5F] text-[#1E3A5F] rounded-xl py-2.5 text-sm font-semibold hover:bg-[#1E3A5F]/5 transition-colors"
            >
              Buy Starter
            </button>
          </div>

          {/* Pro — highlighted */}
          <div className="border-2 border-[#1E3A5F] rounded-2xl p-5 flex flex-col bg-blue-50/40 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-[#1E3A5F] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                Most Popular
              </span>
            </div>
            <div className="mb-4">
              <p className="text-xs font-semibold text-[#1E3A5F] uppercase tracking-widest mb-1">Pro</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">$12</span>
                <span className="text-sm text-gray-400">/month</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Unlimited optimizations</p>
            </div>
            <div className="space-y-2 flex-1 mb-5">
              <Feature available label="PDF download" />
              <Feature available label="Full CV access" />
              <Feature available label="Cover Letter" />
              <Feature available label="LinkedIn Optimizer" />
            </div>
            <button
              onClick={onSelectPro}
              className="w-full bg-[#1E3A5F] hover:bg-[#162d4a] text-white rounded-xl py-2.5 text-sm font-semibold transition-colors shadow-sm"
            >
              Go Pro
            </button>
          </div>

          {/* Lifetime */}
          <div className="border border-gray-200 rounded-2xl p-5 flex flex-col">
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Lifetime</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">$79</span>
                <span className="text-sm text-gray-400">forever</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Unlimited, no renewal</p>
            </div>
            <div className="space-y-2 flex-1 mb-5">
              <Feature available label="PDF download" />
              <Feature available label="Full CV access" />
              <Feature available label="Cover Letter" />
              <Feature available label="LinkedIn Optimizer" />
            </div>
            <button
              onClick={onSelectLifetime}
              className="w-full border border-gray-300 text-gray-700 rounded-xl py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Get Lifetime
            </button>
          </div>

        </div>

        <button
          onClick={onClose}
          className="mt-3 w-full text-center text-sm text-gray-400 hover:text-gray-600"
        >
          Maybe later
        </button>
      </DialogContent>
    </Dialog>
  );
}
