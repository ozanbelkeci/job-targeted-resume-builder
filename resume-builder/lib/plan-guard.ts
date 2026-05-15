export const isPro = (is_pro: boolean): boolean => is_pro;
export const hasCredits = (credits: number): boolean => credits > 0;
export const canDownloadPdf = (is_pro: boolean, credits: number): boolean => is_pro || credits > 0;
export const canViewFullCv  = (is_pro: boolean): boolean => is_pro;
