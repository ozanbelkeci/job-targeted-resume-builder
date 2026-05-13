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

function CheckGreen({ label }: { label: string }) {
  return (
    <li className="flex items-center gap-2.5 text-sm text-gray-600">
      <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
      {label}
    </li>
  );
}

function CheckWhite({ label }: { label: string }) {
  return (
    <li className="flex items-center gap-2.5 text-sm text-blue-100/90">
      <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      {label}
    </li>
  );
}

function XGray({ label }: { label: string }) {
  return (
    <li className="flex items-center gap-2.5 text-sm text-gray-300">
      <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
      </svg>
      {label}
    </li>
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
      <DialogContent className="sm:max-w-3xl w-full p-8">
        <DialogHeader className="mb-5 text-center">
          <DialogTitle className="text-[#1E3A5F] text-2xl font-bold">
            Unlock Your Optimized Resume
          </DialogTitle>
          <DialogDescription className="text-gray-500 mt-1">
            Your ATS score is ready. Get your optimized CV to start applying.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 items-stretch">

          {/* ── Starter ── */}
          <div className="relative bg-white rounded-2xl border border-gray-200 p-6 flex flex-col overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-200/80 to-transparent" />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Starter</p>
            <div className="mb-5">
              <span className="text-4xl font-bold text-gray-900">$5</span>
              <span className="text-sm text-gray-400 ml-1.5">one-time</span>
            </div>
            <ul className="space-y-2.5 mb-6 flex-1">
              <CheckGreen label="5 optimization credits" />
              <CheckGreen label="PDF download" />
              <CheckGreen label="Full CV access" />
              <XGray label="Cover Letter" />
              <XGray label="LinkedIn Optimizer" />
            </ul>
            <button
              onClick={onSelectStarter}
              className="w-full bg-[#1E3A5F] hover:bg-[#162d4a] text-white rounded-xl py-2.5 text-sm font-semibold transition-all shadow-sm hover:shadow-md"
            >
              Buy Starter
            </button>
          </div>

          {/* ── Pro (featured) ── */}
          <div className="relative bg-gradient-to-br from-[#1E3A5F] to-[#162d4a] rounded-2xl p-6 flex flex-col ring-2 ring-[#1E3A5F] shadow-xl shadow-[#1E3A5F]/20 overflow-hidden">
            {/* Glass sheen */}
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.07] to-transparent pointer-events-none" />
            {/* Glow orbs */}
            <div className="absolute -top-6 -right-6 w-28 h-28 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />
            {/* Badge */}
            <div className="absolute top-4 right-4 bg-white/15 border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
              Most Popular
            </div>

            <p className="text-xs font-semibold text-blue-300 uppercase tracking-widest mb-2">Pro</p>
            <div className="mb-1">
              <span className="text-4xl font-bold text-white">$12</span>
              <span className="text-sm text-blue-200/80 ml-1.5">/month</span>
            </div>
            <p className="text-xs text-blue-200/60 mb-5">Cancel anytime</p>
            <ul className="space-y-2.5 mb-6 flex-1">
              <CheckWhite label="Unlimited optimizations" />
              <CheckWhite label="PDF download" />
              <CheckWhite label="Full CV access" />
              <CheckWhite label="Cover Letter Generator" />
              <CheckWhite label="LinkedIn Optimizer" />
            </ul>
            <button
              onClick={onSelectPro}
              className="w-full bg-white hover:bg-blue-50 text-[#1E3A5F] rounded-xl py-2.5 text-sm font-bold transition-all shadow-lg shadow-black/10 hover:-translate-y-px"
            >
              Go Pro
            </button>
          </div>

          {/* ── Lifetime ── */}
          <div className="relative bg-white rounded-2xl border border-gray-200 p-6 flex flex-col overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-300/70 to-transparent" />
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Lifetime</p>
              <span className="text-[10px] bg-amber-50 border border-amber-200 text-amber-700 rounded-full px-2 py-0.5 font-semibold">Best Value</span>
            </div>
            <div className="mb-1">
              <span className="text-4xl font-bold text-gray-900">$79</span>
              <span className="text-sm text-gray-400 ml-1.5">one-time</span>
            </div>
            <p className="text-xs text-gray-400 mb-5">No subscription, ever</p>
            <ul className="space-y-2.5 mb-6 flex-1">
              <CheckGreen label="Unlimited optimizations" />
              <CheckGreen label="PDF download" />
              <CheckGreen label="Full CV access" />
              <CheckGreen label="Cover Letter Generator" />
              <CheckGreen label="LinkedIn Optimizer" />
            </ul>
            <button
              onClick={onSelectLifetime}
              className="w-full border border-[#1E3A5F] text-[#1E3A5F] hover:bg-[#1E3A5F]/5 rounded-xl py-2.5 text-sm font-semibold transition-colors"
            >
              Get Lifetime →
            </button>
          </div>

        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Maybe later
        </button>
      </DialogContent>
    </Dialog>
  );
}
