export const canDownloadPdf  = (plan: string): boolean => plan !== 'free';
export const canViewFullCv   = (plan: string): boolean => plan !== 'free';
export const canSaveHistory  = (plan: string): boolean => plan !== 'free';
export const isPro           = (plan: string): boolean => plan === 'pro' || plan === 'lifetime';
export const canOptimize     = (_plan: string, _credits: number): boolean => true;
// Determines if result gets saved to DB (requires non-free plan AND credits remaining or pro)
export const canSaveResult   = (plan: string, credits: number): boolean =>
  canSaveHistory(plan) && (isPro(plan) || credits > 0);
export const hasCredits      = (credits: number): boolean => credits > 0;
