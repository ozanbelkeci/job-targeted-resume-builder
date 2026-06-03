'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, type Variants } from 'framer-motion';
import debounce from 'lodash.debounce';
import { AtsScoreGauge } from '@/components/AtsScoreGauge';
import { EditableCvPreview } from '@/components/EditableCvPreview';
import { LockedCvPreview } from '@/components/LockedCvPreview';
import { UpgradeModal } from '@/components/UpgradeModal';
import { calculateLiveScore } from '@/lib/ats-calculator';
import type { Optimization, ChecklistState, OptimizedCv, CvSkills, LiveScoreResult, CvTheme, TemplateId } from '@/types';
import { DEFAULT_THEME, COLOR_PALETTES } from '@/lib/cv-templates';
import { TemplateSelector } from '@/components/TemplateSelector';

// ─── helpers ────────────────────────────────────────────────

function addIdsToExperience(cv: OptimizedCv): OptimizedCv {
  return {
    ...cv,
    experience: cv.experience.map((exp, i) => ({
      ...exp,
      id: exp.id ?? `exp-${i}`,
    })),
  };
}

function formatCvAsText(cv: OptimizedCv): string {
  const lines: string[] = [];
  lines.push(cv.name);
  if (cv.job_title) lines.push(cv.job_title);
  const contact = [cv.email, cv.phone, cv.location, cv.linkedin, cv.github, cv.website, cv.portfolio]
    .filter(Boolean)
    .join(' | ');
  if (contact) lines.push(contact);

  if (cv.summary) {
    lines.push('');
    lines.push('PROFESSIONAL SUMMARY');
    lines.push(cv.summary);
  }

  if (cv.experience.length > 0) {
    lines.push('');
    lines.push('EXPERIENCE');
    cv.experience.forEach((exp) => {
      lines.push('');
      lines.push(`${exp.title} — ${exp.company} | ${exp.duration}`);
      exp.bullets.forEach((b) => lines.push(`• ${b}`));
    });
  }

  if (cv.education.length > 0) {
    lines.push('');
    lines.push('EDUCATION');
    cv.education.forEach((edu) => {
      lines.push(`${edu.degree} — ${edu.school} | ${edu.year}`);
    });
  }

  if (Array.isArray(cv.skills)) {
    if ((cv.skills as string[]).length > 0) {
      lines.push('');
      lines.push('SKILLS');
      lines.push((cv.skills as string[]).join(', '));
    }
  } else {
    const skillObj = cv.skills as CvSkills;
    const cats = ['languages', 'frameworks', 'databases', 'tools', 'methodologies'] as const;
    const labels: Record<string, string> = { languages: 'Languages', frameworks: 'Frameworks', databases: 'Databases', tools: 'Tools', methodologies: 'Methodologies' };
    const hasAny = cats.some((c) => (skillObj[c] ?? []).length > 0);
    if (hasAny) {
      lines.push('');
      lines.push('SKILLS');
      for (const cat of cats) {
        const arr = skillObj[cat] ?? [];
        if (arr.length > 0) lines.push(`${labels[cat]}: ${arr.join(', ')}`);
      }
    }
  }

  if (cv.references && cv.references.length > 0) {
    lines.push('');
    lines.push('REFERENCES');
    cv.references.forEach((ref) => {
      lines.push(`${ref.name} — ${ref.title} | ${ref.contact}`);
    });
  }

  return lines.join('\n');
}

function barColor(score: number) {
  if (score >= 75) return 'bg-green-500';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}
function txtColor(score: number) {
  if (score >= 75) return 'text-green-600';
  if (score >= 50) return 'text-amber-600';
  return 'text-red-600';
}

// ─── Original CV display — smart section detection ──────────

function OriginalCvDisplay({ text }: { text: string }) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 max-h-[72vh] overflow-y-auto space-y-1">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3 pb-2 border-b border-gray-100">
        Original CV · extracted from PDF
      </p>
      {lines.map((line, i) => {
        const isHeader =
          /^[A-ZĞÜŞÖÇIa-zğüşöçı\s]{3,35}$/.test(line) &&
          line === line.toUpperCase() &&
          line.length < 36 &&
          !/\d/.test(line);
        const isJobLine =
          /\|\s*\d{4}/.test(line) ||
          /\d{4}\s*[-–]\s*(?:\d{4}|Present|Now|Current)/i.test(line);
        const isContact =
          /@/.test(line) ||
          /^\+?\d[\d\s()-]{6,}$/.test(line) ||
          /https?:\/\//.test(line) ||
          /linkedin\.com|github\.com/i.test(line);
        const isBullet = /^[-•·▪]/.test(line);

        if (isHeader) {
          return (
            <h2
              key={i}
              className="text-xs font-bold text-[#1E3A5F] uppercase tracking-wider pt-4 pb-1 border-b border-gray-200"
            >
              {line}
            </h2>
          );
        }
        if (isJobLine) {
          return (
            <p key={i} className="font-semibold text-gray-900 text-xs pt-2">
              {line}
            </p>
          );
        }
        if (isContact) {
          return (
            <p key={i} className="text-gray-400 text-xs">
              {line}
            </p>
          );
        }
        if (isBullet) {
          return (
            <p key={i} className="text-gray-700 text-xs pl-3 leading-relaxed">
              {line}
            </p>
          );
        }
        return (
          <p key={i} className="text-gray-700 text-xs leading-relaxed">
            {line}
          </p>
        );
      })}
    </div>
  );
}

// ─── sub-components ─────────────────────────────────────────

function ProgressBar({ label, score }: { label: string; score: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const steps = 32;
    const duration = 900;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setDisplay(Math.round((score * step) / steps));
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [score]);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500">{label}</span>
        <span className={`text-xs font-semibold ${txtColor(score)}`}>{display}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all duration-[28ms] ${barColor(score)}`}
          style={{ width: `${display}%` }}
        />
      </div>
    </div>
  );
}

function ScoreBreakdown({
  atsScore,
  matched,
  missing,
}: {
  atsScore: number;
  matched: string[];
  missing: string[];
}) {
  const keywordMatch = Math.round(
    (matched.length / Math.max(matched.length + missing.length, 1)) * 100,
  );
  const expRelevance = Math.round(atsScore * 0.9);
  const skillsAlign = Math.round(atsScore * 0.85);

  return (
    <div className="mt-4 space-y-2.5 pt-4 border-t border-gray-100">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Score Breakdown</p>
      <ProgressBar label="Keyword Match" score={keywordMatch} />
      <ProgressBar label="Experience Relevance" score={expRelevance} />
      <ProgressBar label="Skills Alignment" score={skillsAlign} />
    </div>
  );
}

function ChecklistRow({
  done,
  label,
  interactive,
  onClick,
}: {
  done: boolean;
  label: string;
  interactive?: boolean;
  onClick?: () => void;
}) {
  const base = 'flex items-center gap-3 py-2';
  if (interactive) {
    return (
      <button onClick={onClick} className={`${base} w-full text-left cursor-pointer group`}>
        <span
          className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors border ${
            done
              ? 'bg-green-500 border-green-500'
              : 'border-gray-300 group-hover:border-[#1E3A5F]'
          }`}
        >
          {done && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </span>
        <span className={`text-sm ${done ? 'text-gray-500 line-through' : 'text-gray-700'}`}>{label}</span>
      </button>
    );
  }
  return (
    <div className={base}>
      <span
        className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border ${
          done ? 'bg-green-500 border-green-500' : 'border-gray-200 bg-gray-50'
        }`}
      >
        {done && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
      <span className={`text-sm ${done ? 'text-gray-400 line-through' : 'text-gray-600'}`}>{label}</span>
    </div>
  );
}

// ─── main component ──────────────────────────────────────────

const DEFAULT_CHECKLIST: ChecklistState = {
  coverLetterGenerated: false,
  linkedInUpdated: false,
  appliedToJob: false,
};

export function ResultsClient({
  initialOptimization,
  plan,
  isPro,
  isFree,
  originalResumeText,
}: {
  initialOptimization: Optimization;
  plan: string;
  isPro: boolean;
  isFree: boolean;
  originalResumeText: string;
}) {
  const isPlanPro     = plan === 'pro' || plan === 'lifetime';
  const isPlanFree    = plan === 'free';

  const router = useRouter();
  const [optimization, setOptimization] = useState<Optimization>(initialOptimization);

  // Inline editing state
  const [editedCv, setEditedCv] = useState<OptimizedCv>(() =>
    addIdsToExperience(initialOptimization.optimized_cv_json),
  );
  const [liveScore, setLiveScore] = useState(initialOptimization.ats_score);
  const [liveMatched, setLiveMatched] = useState(
    initialOptimization.ats_keywords?.matched ?? [],
  );
  const [liveMissing, setLiveMissing] = useState(
    initialOptimization.ats_keywords?.missing ?? [],
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [editingExperienceIdx, setEditingExperienceIdx] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Refs for stable closures in debounced recalc
  const originalMatchedRef = useRef(initialOptimization.ats_keywords?.matched ?? []);
  const originalMissingRef = useRef(initialOptimization.ats_keywords?.missing ?? []);
  const liveScoreRef = useRef(initialOptimization.ats_score);
  liveScoreRef.current = liveScore;

  function showToast(msg: string, type: 'success' | 'error') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2000);
  }

  function applyScoreResult(result: LiveScoreResult, prevScore: number) {
    if (result.score > prevScore) showToast('↑ Score improved', 'success');
    setLiveScore(result.score);
    setLiveMatched(result.matched);
    setLiveMissing(result.missing);
    // Uncheck keywords that moved from missing → matched via manual editing
    const newMissingLower = new Set(result.missing.map((k) => k.toLowerCase()));
    setSelected((prev) => {
      const filtered = Array.from(prev).filter((kw) => newMissingLower.has(kw.toLowerCase()));
      return new Set(filtered);
    });
  }

  function recalcScoreNow(cv: OptimizedCv) {
    const result = calculateLiveScore(cv, originalMatchedRef.current, originalMissingRef.current);
    applyScoreResult(result, liveScoreRef.current);
  }

  const recalcScoreDebounced = useRef(
    debounce((cv: OptimizedCv) => {
      const result = calculateLiveScore(cv, originalMatchedRef.current, originalMissingRef.current);
      applyScoreResult(result, liveScoreRef.current);
    }, 600),
  ).current;

  function handleCvChange(updated: OptimizedCv, immediate = false) {
    setEditedCv(updated);
    setHasUnsavedChanges(true);
    if (immediate) {
      recalcScoreNow(updated);
    } else {
      recalcScoreDebounced(updated);
    }
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/optimizations/${optimization.id}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          optimized_cv_json: editedCv,
          ats_score: liveScore,
          ats_keywords: { matched: liveMatched, missing: liveMissing },
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      setOptimization((prev) => ({
        ...prev,
        optimized_cv_json: editedCv,
        ats_score: liveScore,
        ats_keywords: { matched: liveMatched, missing: liveMissing },
      }));
      setHasUnsavedChanges(false);
      showToast('Changes saved', 'success');
    } catch {
      showToast('Could not save. Try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  }

  function handleNavigate(path: string) {
    if (
      hasUnsavedChanges &&
      !window.confirm('You have unsaved changes.\nLeave without saving?')
    ) return;
    router.push(path);
  }

  // Browser back / tab close guard
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  // Feature 1: keyword checkboxes + regenerate
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerateError, setRegenerateError] = useState<string | null>(null);
  const [regenerateSuccess, setRegenerateSuccess] = useState(false);

  // Tip expand inputs
  const [tipExpanded, setTipExpanded] = useState<Record<number, boolean>>({});
  const [tipInputs, setTipInputs] = useState<Record<number, string>>({});
  const [previousTipInputs, setPreviousTipInputs] = useState<Array<{ tip_text: string; user_input: string }>>([]);

  // General context
  const [generalContext, setGeneralContext] = useState('');

  // Feature 2: before/after toggle
  const [cvView, setCvView] = useState<'optimized' | 'original'>('optimized');
  const [isViewTransitioning, setIsViewTransitioning] = useState(false);
  const [displayView, setDisplayView] = useState<'optimized' | 'original'>('optimized');

  // PDF viewer for Original tab
  type PdfState = 'idle' | 'loading' | 'no-pdf' | 'error' | string; // string = signed URL
  const [pdfState, setPdfState] = useState<PdfState>('idle');
  const hasFetchedPdf = pdfState !== 'idle';

  // Feature 3: copy as text
  const [isCopied, setIsCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  // Feature 4: checklist (localStorage)
  const [checklist, setChecklist] = useState<ChecklistState>(DEFAULT_CHECKLIST);

  useEffect(() => {
    const stored = localStorage.getItem(`checklist_${optimization.id}`);
    if (stored) {
      try { setChecklist(JSON.parse(stored) as ChecklistState); } catch { /* ignore */ }
    }
  }, [optimization.id]);

  // Template + color selection (localStorage)
  const [cvTheme, setCvTheme] = useState<CvTheme>(DEFAULT_THEME);

  useEffect(() => {
    const stored = localStorage.getItem('cv_theme');
    if (!stored) return;
    try { setCvTheme(JSON.parse(stored) as CvTheme); } catch { /* ignore */ }
  }, []);

  const updateChecklist = useCallback(
    (key: keyof ChecklistState, value: boolean) => {
      setChecklist((prev) => {
        const next = { ...prev, [key]: value };
        localStorage.setItem(`checklist_${optimization.id}`, JSON.stringify(next));
        return next;
      });
    },
    [optimization.id],
  );

  function handleTemplateChange(templateId: TemplateId) {
    const accentColor = COLOR_PALETTES[templateId][0];
    const next: CvTheme = { templateId, accentColor };
    setCvTheme(next);
    localStorage.setItem('cv_theme', JSON.stringify(next));
  }

  function handleColorChange(accentColor: string) {
    const next: CvTheme = { ...cvTheme, accentColor };
    setCvTheme(next);
    localStorage.setItem('cv_theme', JSON.stringify(next));
  }

  // Feature 1: toggle keyword selection
  function toggleKeyword(kw: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(kw)) next.delete(kw);
      else next.add(kw);
      return next;
    });
  }

  // Feature 1: regenerate
  async function handleRegenerate() {
    setIsRegenerating(true);
    setRegenerateError(null);
    setRegenerateSuccess(false);
    try {
      const filledTipContexts = tips
        .map((tip, i) => ({
          tip_index: i,
          tip_text: tip,
          user_input: tipInputs[i] ?? '',
        }))
        .filter((tc) => tc.user_input.trim());

      const res = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          optimizationId: optimization.id,
          selectedKeywords: Array.from(selected),
          tipContexts: filledTipContexts,
          generalContext: generalContext.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data as { error: string }).error ?? 'Failed to regenerate');
      const newOpt = (data as { data: { optimization: Optimization } }).data.optimization;
      setOptimization(newOpt);
      const newCv = addIdsToExperience(newOpt.optimized_cv_json);
      setEditedCv(newCv);
      setLiveScore(newOpt.ats_score);
      setLiveMatched(newOpt.ats_keywords?.matched ?? []);
      setLiveMissing(newOpt.ats_keywords?.missing ?? []);
      originalMatchedRef.current = newOpt.ats_keywords?.matched ?? [];
      originalMissingRef.current = newOpt.ats_keywords?.missing ?? [];
      setHasUnsavedChanges(false);
      setPreviousTipInputs(filledTipContexts.map((tc) => ({ tip_text: tc.tip_text, user_input: tc.user_input })));
      setSelected(new Set());
      setTipInputs({});
      setTipExpanded({});
      setGeneralContext('');
      setRegenerateSuccess(true);
      setTimeout(() => setRegenerateSuccess(false), 3000);
    } catch (err) {
      setRegenerateError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsRegenerating(false);
    }
  }

  // Feature 2: switch view with fade + lazy PDF fetch
  function switchView(view: 'optimized' | 'original') {
    if (view === cvView) return;

    // Kick off PDF URL fetch on first switch to Original
    if (view === 'original' && !hasFetchedPdf) {
      setPdfState('loading');
      fetch(`/api/resumes/${optimization.resume_id}/pdf-url`)
        .then((r) => r.json())
        .then((data: { data?: { url: string | null }; error?: string }) => {
          const url = data.data?.url ?? null;
          setPdfState(url ?? 'no-pdf');
        })
        .catch(() => setPdfState('error'));
    }

    setIsViewTransitioning(true);
    setCvView(view);
    setTimeout(() => {
      setDisplayView(view);
      setIsViewTransitioning(false);
    }, 180);
  }

  function retryPdfFetch() {
    setPdfState('loading');
    fetch(`/api/resumes/${optimization.resume_id}/pdf-url`)
      .then((r) => r.json())
      .then((data: { data?: { url: string | null }; error?: string }) => {
        const url = data.data?.url ?? null;
        setPdfState(url ?? 'no-pdf');
      })
      .catch(() => setPdfState('error'));
  }

  // Feature 3: copy as text
  async function handleCopy() {
    const text = formatCvAsText(optimization.optimized_cv_json);
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 3000);
    }
  }

  // Navigation + checklist update
  function handleCoverLetterClick() {
    updateChecklist('coverLetterGenerated', true);
    router.push(`/app/results/${optimization.id}/cover-letter`);
  }
  function handleLinkedInClick() {
    updateChecklist('linkedInUpdated', true);
    router.push(`/app/results/${optimization.id}/linkedin`);
  }

  const matched = liveMatched;
  const missing = liveMissing;
  const tips = optimization.tips ?? [];
  const allChecked = checklist.coverLetterGenerated && checklist.linkedInUpdated && checklist.appliedToJob;

  function isSimilarTip(newTip: string, oldTip: string): boolean {
    const words = (s: string) =>
      s.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
    const oldWords = words(oldTip);
    if (oldWords.length === 0) return false;
    const newText = newTip.toLowerCase();
    const matches = oldWords.filter((w) => newText.includes(w)).length;
    return matches / oldWords.length >= 0.5;
  }

  function isUpdatedTip(tipText: string): boolean {
    return previousTipInputs.some((prev) => isSimilarTip(tipText, prev.tip_text));
  }

  const hasRegenerateInput =
    selected.size > 0 ||
    Object.values(tipInputs).some((v) => v.trim()) ||
    generalContext.trim().length > 0;

  const panelVariants: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-6 py-8">
      <motion.div
        className="max-w-6xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      >

        {/* ── Top bar ── */}
        <motion.div variants={panelVariants} className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-[#1E3A5F] leading-tight">
              {optimization.job_title}
              {optimization.job_company && (
                <span className="text-gray-400 font-normal"> · {optimization.job_company}</span>
              )}
            </h1>
            <p className="text-gray-400 text-xs mt-1">Your optimized resume is ready</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Feature 3: Copy as Text */}
            <div className="relative">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
              >
                {isCopied ? (
                  <>
                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy as Text
                  </>
                )}
              </button>
              {copyFailed && (
                <p className="absolute top-full mt-1 right-0 text-xs text-red-500 bg-white border border-red-200 rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-sm z-10">
                  Could not copy. Please select and copy manually.
                </p>
              )}
            </div>
            {isFree ? (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="flex items-center gap-2 border border-[#1E3A5F]/40 text-[#1E3A5F] rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-blue-50/40 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Unlock to Download
              </button>
            ) : (
              <a
                href={`/api/download-pdf?id=${optimization.id}&template=${cvTheme.templateId}&color=${encodeURIComponent(cvTheme.accentColor)}`}
                className="flex items-center gap-2 bg-[#1E3A5F] hover:bg-[#162d4a] text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF
              </a>
            )}
            <button
              onClick={handleSave}
              disabled={!hasUnsavedChanges || isSaving}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed border ${
                hasUnsavedChanges
                  ? 'bg-green-600 hover:bg-green-700 text-white border-green-600 shadow-sm shadow-green-200 ring-2 ring-green-400/30 ring-offset-1'
                  : 'bg-white text-gray-400 border-gray-200'
              }`}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* ── Action bar ── */}
        <motion.div variants={panelVariants} className="flex flex-wrap items-center gap-2 mb-5 p-3 bg-white rounded-2xl border border-gray-200 shadow-sm">
          {isPlanPro ? (
            <>
              <button
                onClick={handleCoverLetterClick}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generate Cover Letter
              </button>
              <button
                onClick={handleLinkedInClick}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Optimize LinkedIn
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-400 text-sm font-medium cursor-not-allowed select-none">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Cover Letter
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-400 text-sm font-medium cursor-not-allowed select-none">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                LinkedIn Optimizer
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-semibold transition-colors"
              >
                Upgrade to Pro →
              </button>
            </>
          )}
          <div className="flex-1 min-w-[8px]" />
          <button
            onClick={() => handleNavigate('/app/upload')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Start Over
          </button>
          <button
            onClick={() => handleNavigate('/dashboard')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            View History
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </motion.div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Left — ATS Panel */}
          <motion.div variants={panelVariants} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 pt-5 pb-3 border-b border-gray-100">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">ATS Match Score</h2>
            </div>
            <div className="p-5">
              <div className="flex justify-center mb-2">
                <AtsScoreGauge score={liveScore} />
              </div>

              {/* Feature 5: Score Breakdown */}
              <ScoreBreakdown
                atsScore={liveScore}
                matched={matched}
                missing={missing}
              />

              {/* Matched keywords */}
              {matched.length > 0 && (
                <div className="mt-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Matched Keywords</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {matched.map((kw) => (
                      <span key={kw} className="flex items-center gap-1 bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-md font-medium">
                        <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Feature 1: Missing keywords with checkboxes */}
              {missing.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-1.5">Missing Keywords</h3>
                  <p className="text-xs text-gray-400 mb-2.5">
                    Check keywords you actually know — then regenerate.
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {missing.map((kw) => {
                      const checked = selected.has(kw);
                      return (
                        <button
                          key={kw}
                          onClick={() => toggleKeyword(kw)}
                          className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md font-medium border transition-colors ${
                            checked
                              ? 'bg-green-100 text-green-700 border-green-400 ring-1 ring-green-400'
                              : 'bg-red-50 text-red-600 border-transparent hover:border-red-300'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${checked ? 'border-green-500 bg-green-500' : 'border-red-400'}`}>
                            {checked && (
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </span>
                          {kw}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tips */}
              {tips.length > 0 && (
                <div className="mt-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Improvement Tips</h3>
                  <ul className="space-y-3">
                    {tips.map((tip, i) => (
                      <li key={i}>
                        <div className="flex gap-2.5 text-sm text-gray-600">
                          <span className="w-5 h-5 flex-shrink-0 rounded-full bg-blue-100 text-[#1E3A5F] text-xs flex items-center justify-center font-bold mt-0.5">
                            {i + 1}
                          </span>
                          <span>
                            {tip}
                            {isUpdatedTip(tip) && (
                              <span className="ml-2 inline-block text-[10px] text-gray-400 bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 font-normal align-middle">
                                Updated based on your input
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="mt-1.5 ml-7">
                          <button
                            onClick={() =>
                              setTipExpanded((prev) => ({ ...prev, [i]: !prev[i] }))
                            }
                            className="text-xs text-[#1E3A5F] hover:text-[#162d4a] font-medium transition-colors"
                          >
                            {tipExpanded[i] ? '− Hide details' : '+ Add details about this (optional)'}
                          </button>
                          <div
                            className={`overflow-hidden transition-all duration-200 ${
                              tipExpanded[i] ? 'max-h-40 mt-2' : 'max-h-0'
                            }`}
                          >
                            <textarea
                              value={tipInputs[i] ?? ''}
                              onChange={(e) => {
                                const val = e.target.value.slice(0, 500);
                                setTipInputs((prev) => ({ ...prev, [i]: val }));
                              }}
                              placeholder="Share any relevant experience or details... (optional)"
                              rows={3}
                              className="w-full text-xs text-gray-700 border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] placeholder:text-gray-400"
                            />
                            <p className="text-right text-xs text-gray-400 mt-0.5">
                              {(tipInputs[i] ?? '').length}/500
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Anything else textarea */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-0.5">
                  Anything else to add to your resume?
                </h3>
                <p className="text-xs text-gray-400 mb-2.5">
                  Mention any experience, skill, or achievement you&apos;d like included. This field is optional.
                </p>
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-2.5">
                  <span className="text-sm leading-none mt-px select-none">💡</span>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Adding metrics (numbers, percentages, team sizes) can increase your ATS score significantly.
                  </p>
                </div>
                <textarea
                  value={generalContext}
                  onChange={(e) => setGeneralContext(e.target.value.slice(0, 1000))}
                  placeholder={`Share any details to strengthen your resume:\n• Metrics: 'Reduced query time by 40%', 'Platform served 50,000 users'\n• Team size: 'Led a team of 4 developers'\n• Projects: 'Built a WinForms tool management app in 2020'\n• Achievements: 'Delivered project 2 weeks ahead of schedule'\n(All optional — leave blank to regenerate as-is)`}
                  rows={4}
                  className="w-full text-xs text-gray-700 border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] placeholder:text-gray-400"
                />
                <p className="text-right text-xs text-gray-400 mt-0.5">{generalContext.length}/1000</p>
              </div>

              {/* Regenerate section */}
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-2">
                  Select missing keywords, add details to tips, or share additional context above — then regenerate your resume.
                </p>

                {regenerateError && (
                  <p className="text-xs text-red-500 mb-2">{regenerateError}</p>
                )}

                {regenerateSuccess && (
                  <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-2">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Your resume has been updated!
                  </div>
                )}

                {!isFree && <button
                  onClick={handleRegenerate}
                  disabled={isRegenerating || !hasRegenerateInput}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-[#1E3A5F] hover:bg-[#162d4a] text-white"
                >
                  {isRegenerating ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Regenerate CV
                      {selected.size > 0 && (
                        <span className="bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full">
                          {selected.size}
                        </span>
                      )}
                    </>
                  )}
                </button>}
              </div>
            </div>
          </motion.div>

          {/* Right — CV Panel */}
          <motion.div variants={panelVariants} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Feature 2: Before/After toggle */}
            <div className="px-5 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Resume Preview</h2>
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => switchView('optimized')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    cvView === 'optimized'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Optimized
                </button>
                <button
                  onClick={() => switchView('original')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    cvView === 'original'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Original
                </button>
              </div>
            </div>
            <div className={`p-4 transition-opacity duration-200 ${isViewTransitioning ? 'opacity-0' : 'opacity-100'}`}>
              {displayView === 'optimized' && !isFree && (
                <TemplateSelector
                  selectedTemplate={cvTheme.templateId}
                  selectedColor={cvTheme.accentColor}
                  onTemplateChange={handleTemplateChange}
                  onColorChange={handleColorChange}
                />
              )}
              {displayView === 'optimized' ? (
                isFree ? (
                  <LockedCvPreview cv={editedCv} onUnlock={() => setShowUpgradeModal(true)} />
                ) : (
                <EditableCvPreview
                  cv={editedCv}
                  onChange={handleCvChange}
                  editingExperienceIdx={editingExperienceIdx}
                  onSetEditingExperience={setEditingExperienceIdx}
                  theme={cvTheme}
                />
                )
              ) : (
                <>
                  {pdfState === 'loading' && (
                    <div className="space-y-3 p-2 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-full" />
                      <div className="h-4 bg-gray-200 rounded w-5/6" />
                      <div className="h-40 bg-gray-100 rounded mt-4" />
                      <div className="h-4 bg-gray-200 rounded w-full" />
                      <div className="h-4 bg-gray-200 rounded w-4/5" />
                    </div>
                  )}

                  {pdfState === 'error' && (
                    <div className="flex flex-col items-center gap-3 py-10 text-center">
                      <p className="text-sm text-red-500">Could not load PDF preview.</p>
                      <button
                        onClick={retryPdfFetch}
                        className="text-xs text-[#1E3A5F] border border-[#1E3A5F] rounded-lg px-3 py-1.5 hover:bg-[#1E3A5F]/5 transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  {pdfState === 'no-pdf' && (
                    <div>
                      <div className="mb-3 px-1 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-600 text-center">
                        PDF preview not available for this resume. Re-upload your resume to enable visual preview.
                      </div>
                      <OriginalCvDisplay text={originalResumeText} />
                    </div>
                  )}

                  {typeof pdfState === 'string' && pdfState !== 'loading' && pdfState !== 'no-pdf' && pdfState !== 'error' && (
                    <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: '72vh' }}>
                      <iframe
                        src={`${pdfState}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                        title="Original CV"
                        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Feature 4: Application Checklist */}
        <motion.div variants={panelVariants} className="mt-5 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#1E3A5F]">Your Application Checklist</h2>
              <p className="text-xs text-gray-400 mt-0.5">Track your progress for this application</p>
            </div>
            {allChecked && (
              <span className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-semibold">
                All done! 🎉
              </span>
            )}
          </div>

          <div className="divide-y divide-gray-100">
            <ChecklistRow done label="Resume optimized" />
            <ChecklistRow done={checklist.coverLetterGenerated} label="Cover letter generated" />
            <ChecklistRow done={checklist.linkedInUpdated} label="LinkedIn profile updated" />
            <ChecklistRow
              done={checklist.appliedToJob}
              label="Applied to job"
              interactive
              onClick={() => updateChecklist('appliedToJob', !checklist.appliedToJob)}
            />
          </div>

          {checklist.appliedToJob && !allChecked && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700 text-center">
              You&apos;ve submitted your application — best of luck! 🎯
            </div>
          )}

          {allChecked && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium text-center">
              🎉 Great job! You&apos;ve completed all steps for this application.
            </div>
          )}
        </motion.div>

      </motion.div>

      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium ${
            toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {toast.type === 'success' ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
