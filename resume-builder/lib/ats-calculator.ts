import type { OptimizedCv, CvSkills, LiveScoreResult } from '@/types';
import { GENERIC_WORDS } from '@/lib/constants/ats-config';

function isGenericOrNumeric(w: string): boolean {
  return GENERIC_WORDS.has(w) || /^\d+\+?$/.test(w);
}

function isTechnicalKeyword(keyword: string): boolean {
  const trimmed = keyword.trim().toLowerCase();
  if (/^\d+$/.test(trimmed)) return false;
  if (trimmed.length <= 2) return false;
  const words = trimmed.split(/\s+/);
  if (words.every(isGenericOrNumeric)) return false;
  return true;
}

/**
 * Fuzzy match — R1 + R2 from server-side gemini.ts.
 * R1: direct substring ("docker" in "docker-compose")
 * R2: every significant word (≥4 chars) appears in text
 *     ("REST API" → "rest" in "restful" ✓ and "api" in text ✓)
 */
function keywordMatchesText(keyword: string, text: string): boolean {
  const kw = keyword.toLowerCase().trim();
  if (text.includes(kw)) return true;
  const parts = kw.split(/\s+/).filter((w) => w.length >= 4);
  if (parts.length > 0 && parts.every((w) => text.includes(w))) return true;
  return false;
}

function buildSearchableText(cv: OptimizedCv): string {
  const skillsText = Array.isArray(cv.skills)
    ? (cv.skills as string[]).join(' ')
    : Object.values(cv.skills as CvSkills).flat().join(' ');
  const bulletsText = cv.experience.flatMap((e) => e.bullets).join(' ');
  return [skillsText, cv.summary ?? '', bulletsText].join(' ').toLowerCase();
}

/**
 * Live ATS score calculator.
 *
 * Strategy:
 * - originalMatched keywords → always stay matched (never re-evaluated).
 *   Re-evaluating them causes false drops because our simple check ≠ AI fuzzy logic.
 * - originalMissing keywords → checked against current CV content.
 *   If a missing keyword is now found → moves to matched → score goes up.
 *
 * Result: score only changes when the user adds/removes a keyword
 * that was in the missing list. Editing unrelated text has no effect.
 */
export function calculateLiveScore(
  editedCv: OptimizedCv,
  originalMatched: string[],
  originalMissing: string[],
): LiveScoreResult {
  const allKeywords = [...originalMatched, ...originalMissing];
  if (allKeywords.length === 0) return { score: 0, matched: [], missing: [] };

  const searchableText = buildSearchableText(editedCv);

  // originalMatched: fixed — don't re-evaluate
  const newMatched = [...originalMatched];
  const newMissing: string[] = [];

  // Only originalMissing keywords are re-evaluated
  originalMissing.forEach((keyword) => {
    if (isTechnicalKeyword(keyword) && keywordMatchesText(keyword, searchableText)) {
      newMatched.push(keyword);
    } else {
      newMissing.push(keyword);
    }
  });

  const score = Math.round((newMatched.length / allKeywords.length) * 100);
  return { score, matched: newMatched, missing: newMissing };
}
