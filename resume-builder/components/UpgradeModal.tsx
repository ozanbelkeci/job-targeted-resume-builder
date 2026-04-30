'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PRICING } from '@/lib/constants';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  onSelectStarter: () => void;
  onSelectPro: () => void;
}

export function UpgradeModal({
  open,
  onClose,
  onSelectStarter,
  onSelectPro,
}: UpgradeModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#1E3A5F] text-xl">
            You&apos;re out of credits
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Upgrade to continue optimizing your resume for any job.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {/* Starter */}
          <div className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-900">Starter Pack</span>
              <span className="text-lg font-bold text-[#1E3A5F]">{PRICING.STARTER_PRICE}</span>
            </div>
            <p className="text-sm text-gray-500 mb-3">5 optimization credits, one-time payment</p>
            <Button
              onClick={onSelectStarter}
              variant="outline"
              className="w-full border-[#1E3A5F] text-[#1E3A5F] rounded-lg"
            >
              Buy Starter Pack
            </Button>
          </div>

          {/* Pro */}
          <div className="border-2 border-[#1E3A5F] rounded-xl p-4 bg-blue-50">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-900">Pro</span>
              <span className="text-lg font-bold text-[#1E3A5F]">{PRICING.PRO_PRICE}/mo</span>
            </div>
            <p className="text-sm text-gray-500 mb-3">Unlimited optimizations, cancel anytime</p>
            <Button
              onClick={onSelectPro}
              className="w-full bg-[#1E3A5F] hover:bg-[#162d4a] text-white rounded-lg"
            >
              Go Pro
            </Button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-2 w-full text-center text-sm text-gray-400 hover:text-gray-600"
        >
          Maybe later
        </button>
      </DialogContent>
    </Dialog>
  );
}
