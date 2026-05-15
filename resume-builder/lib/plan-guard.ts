export const isPro = (is_pro: boolean): boolean => is_pro;
export const hasCredits = (credits: number): boolean => credits > 0;
export const canDownloadPdf = (plan: string, is_pro: boolean): boolean =>
  is_pro || plan === 'starter' || plan === 'pro';
export const canViewFullCv = (is_pro: boolean): boolean => is_pro;
