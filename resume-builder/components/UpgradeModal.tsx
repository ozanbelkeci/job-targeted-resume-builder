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

function Check() {
  return (
    <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CheckWhite() {
  return (
    <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
      </svg>
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
      <DialogContent className="max-w-3xl p-8">
        <DialogHeader className="mb-6 text-center">
          <DialogTitle className="text-[#1E3A5F] text-2xl font-bold">
            Unlock Your Optimized Resume
          </DialogTitle>
          <DialogDescription className="text-gray-500 mt-1">
            Your ATS score is ready. Get your optimized CV to start applying.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-5 items-start">

          {/* Starter */}
          <div className="relative bg-white rounded-2xl border border-gray-200 p-7 text-left overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-200/80 to-transparent" />
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Starter</div>
            <div className="text-4xl font-bold text-gray-900 mb-1">$5</div>
            <div className="text-sm text-gray-400 mb-6">one-time</div>
            <ul className="space-y-2.5 text-sm text-gray-600 mb-7">
              {['5 optimization credits', 'PDF download', 'Full CV access', 'ATS keyword analysis'].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Check />
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={onSelectStarter}
              className="block w-full text-center bg-[#1E3A5F] hover:bg-[#162d4a] text-white rounded-xl py-2.5 text-sm font-semibold transition-all shadow-sm hover:shadow-md"
            >
              Buy Starter
            </button>
          </div>

          {/* Pro — premium treatment */}
          <div className="relative bg-gradient-to-br from-[#1E3A5F] to-[#162d4a] rounded-2xl p-7 text-left ring-2 ring-[#1E3A5F] shadow-2xl shadow-[#1E3A5F]/30 overflow-hidden">
            {/* Glass reflection */}
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.07] to-transparent rounded-t-2xl pointer-events-none" />
            {/* Glow orbs */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />
            {/* Badge */}
            <div className="absolute top-4 right-4 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
              Most Popular
            </div>

            <div className="text-xs font-semibold text-blue-300 uppercase tracking-widest mb-3">Pro</div>
            <div className="text-4xl font-bold text-white mb-1">$12</div>
            <div className="text-sm text-blue-200/80 mb-6">per month · cancel anytime</div>
            <ul className="space-y-2.5 text-sm text-blue-100/90 mb-7">
              {['Unlimited optimizations', 'PDF download', 'Full CV access', 'Cover Letter Generator', 'LinkedIn Optimizer'].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckWhite />
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={onSelectPro}
              className="block w-full text-center bg-white hover:bg-blue-50 text-[#1E3A5F] rounded-xl py-2.5 text-sm font-bold transition-all shadow-lg shadow-black/10 hover:-translate-y-px hover:shadow-xl"
            >
              Go Pro
            </button>
          </div>

          {/* Lifetime */}
          <div className="relative bg-white rounded-2xl border border-gray-200 p-7 text-left overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-300/70 to-transparent" />
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Lifetime</span>
              <span className="text-[10px] bg-amber-50 border border-amber-200 text-amber-700 rounded-full px-2 py-0.5 font-semibold">Best Value</span>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">$79</div>
            <div className="text-sm text-gray-400 mb-6">forever · no subscription</div>
            <ul className="space-y-2.5 text-sm text-gray-600 mb-7">
              {['Unlimited optimizations', 'PDF download', 'Full CV access', 'Cover Letter Generator', 'LinkedIn Optimizer'].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Check />
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={onSelectLifetime}
              className="block w-full text-center border border-[#1E3A5F] text-[#1E3A5F] hover:bg-[#1E3A5F]/5 rounded-xl py-2.5 text-sm font-semibold transition-colors"
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
