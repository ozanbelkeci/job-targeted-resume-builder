export const canDownloadPdf  = (plan: string): boolean => plan !== 'free';
export const canViewFullCv   = (plan: string): boolean => plan !== 'free';
export const canSaveHistory  = (plan: string): boolean => plan !== 'free';
export const isPro           = (plan: string): boolean => plan === 'pro' || plan === 'lifetime';
// Free users can optimize (→ /results/free preview), starter users need credits > 0
export const canOptimize     = (plan: string, credits: number): boolean => {
  if (plan === 'free') return true;
  return isPro(plan) || credits > 0;
};
export const hasCredits      = (credits: number): boolean => credits > 0;
