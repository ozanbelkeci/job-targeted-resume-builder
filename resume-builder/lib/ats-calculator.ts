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
 * Word-boundary-aware substring check — prevents "java" from matching
 * inside "javascript" when both appear as separate skills.
 */
function hasWholeWord(text: string, term: string): boolean {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|[^a-z0-9])${escaped}(?:[^a-z0-9]|$)`).test(text);
}

/**
 * Fuzzy match — R1 (word-boundary aware) + R2 (all significant words present).
 *
 * R1: whole-word match — "java" chip matches "java" keyword but NOT "javascript"
 * R2: every significant word (≥4 chars) must appear as a whole word
 *     ("REST API" → "rest" AND "api" both found as standalone words)
 *
 * Note: isTechnicalKeyword is NOT called here — callers decide whether to apply
 * that gate. This lets short but valid tech terms like "C#" match correctly.
 */
function keywordMatchesText(keyword: string, text: string): boolean {
  const kw = keyword.toLowerCase().trim();
  if (hasWholeWord(text, kw)) return true;
  const parts = kw.split(/\s+/).filter((w) => w.length >= 4);
  if (parts.length > 0 && parts.every((w) => hasWholeWord(text, w))) return true;
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
 * - originalMatched keywords → stay matched (not re-evaluated), preventing
 *   false drops when the client matcher can't reproduce AI fuzzy logic.
 * - originalMissing keywords → re-evaluated; isTechnicalKeyword gate applied
 *   to skip generic/numeric words from the missing list.
 *
 * Immediate strategy (reEvaluateAll = true):
 * - ALL keywords re-evaluated using keywordMatchesText (word-boundary aware).
 * - isTechnicalKeyword gate is NOT applied — these keywords were already
 *   validated by the server, and skipping the gate allows short but valid
 *   tech terms like "C#" to match correctly via hasWholeWord().
 * - Used when the user explicitly adds or removes a skill chip.
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
    // Re-evaluate ALL keywords purely via keywordMatchesText (no isTechnicalKeyword gate).
    // Word-boundary matching prevents "java" falsely matching inside "javascript".
    // "C#" and other short-but-valid tech terms match correctly via hasWholeWord().
    allKeywords.forEach((keyword) => {
      if (keywordMatchesText(keyword, searchableText)) {
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
