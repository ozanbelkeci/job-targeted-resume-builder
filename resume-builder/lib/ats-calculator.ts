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
 * Default strategy (reEvaluateAll = false):
 * - originalMatched keywords → stay matched (not re-evaluated).
 *   Prevents false drops when the client-side matcher can't reproduce
 *   the AI's more sophisticated fuzzy logic for text edits.
 * - originalMissing keywords → re-evaluated against current CV content.
 *
 * Immediate strategy (reEvaluateAll = true):
 * - ALL keywords re-evaluated against updated CV content.
 * - Used when the user explicitly adds or removes a skill chip, so the
 *   score and keyword lists reflect the actual current state of the CV.
 */
export function calculateLiveScore(
  editedCv: OptimizedCv,
  originalMatched: string[],
  originalMissing: string[],
  reEvaluateAll = false,
): LiveScoreResult {
  const allKeywords = [...originalMatched, ...originalMissing];
  if (allKeywords.length === 0) return { score: 0, matched: [], missing: [] };

  const searchableText = buildSearchableText(editedCv);

  const newMatched: string[] = [];
  const newMissing: string[] = [];

  if (reEvaluateAll) {
    // Re-evaluate every keyword (both matched and missing) against updated CV.
    allKeywords.forEach((keyword) => {
      if (isTechnicalKeyword(keyword) && keywordMatchesText(keyword, searchableText)) {
        newMatched.push(keyword);
      } else {
        newMissing.push(keyword);
      }
    });
  } else {
    // originalMatched: fixed — don't re-evaluate (prevents false drops for text edits)
    newMatched.push(...originalMatched);

    // Only originalMissing keywords are re-evaluated
    originalMissing.forEach((keyword) => {
      if (isTechnicalKeyword(keyword) && keywordMatchesText(keyword, searchableText)) {
        newMatched.push(keyword);
      } else {
        newMissing.push(keyword);
      }
    });
  }

  const score = Math.round((newMatched.length / allKeywords.length) * 100);
  return { score, matched: newMatched, missing: newMissing };
}
