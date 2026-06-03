export const canDownloadPdf  = (plan: string): boolean => plan !== 'free';
export const canViewFullCv   = (plan: string): boolean => plan !== 'free';
export const canSaveHistory  = (plan: string): boolean => plan !== 'free';
export const isPro           = (plan: string): boolean => plan === 'pro' || plan === 'lifetime';
export const canOptimize     = (plan: string, credits: number): boolean => {
  if (plan === 'free') return false;
  return isPro(plan) || credits > 0;
};
export const hasCredits      = (credits: number): boolean => credits > 0;
