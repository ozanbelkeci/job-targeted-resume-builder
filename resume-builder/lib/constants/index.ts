export const APP_NAME = 'Coversume';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const ATS_SCORE_THRESHOLDS = {
  LOW: 50,
  MEDIUM: 75,
} as const;

export const CREDIT_LIMITS = {
  FREE_INITIAL: 1,
  STARTER_PACK: 5,
  RATE_LIMIT_PER_MINUTE: 3,
} as const;

export const PRICING = {
  STARTER_PRICE: '$5',
  PRO_PRICE: '$12',
} as const;

export const JOB_DESCRIPTION_MAX_CHARS = 5000;
export const JOB_DESCRIPTION_MIN_CHARS = 100;
export const SCRAPE_TIMEOUT_MS = 10000;
export const PDF_DOWNLOAD_FILENAME = 'optimized-resume.pdf';

export const POLAR_PRODUCT_IDS = {
  STARTER:  process.env.POLAR_PRODUCT_STARTER  ?? '',
  PRO:      process.env.POLAR_PRODUCT_PRO      ?? '',
  LIFETIME: process.env.POLAR_PRODUCT_LIFETIME ?? '',
} as const;
