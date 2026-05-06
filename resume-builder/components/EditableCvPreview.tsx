'use client';

import { useState, useRef } from 'react';
import type { OptimizedCv, CvSkills, OptimizedCvExperience, CvTheme } from '@/types';
import { SummaryEditor } from '@/components/editing/SummaryEditor';
import { SkillsEditor } from '@/components/editing/SkillsEditor';
import { BulletsEditor } from '@/components/editing/BulletsEditor';
import { DEFAULT_THEME } from '@/lib/cv-templates';

// ─── Contact field map ───────────────────────────────────────

type ContactKey = 'email' | 'phone' | 'location' | 'linkedin' | 'github' | 'portfolio' | 'website';

const CONTACT_FIELDS: { key: ContactKey; label: string }[] = [
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'location', label: 'Location' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'github', label: 'GitHub' },
  { key: 'portfolio', label: 'Portfolio' },
  { key: 'website', label: 'Website' },
];

// ─── Shared single-line inline editor ───────────────────────

function InlineEditor({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (editing) {
    return (
      <input
        ref={inputRef}
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => {
          if (e.key === 'Escape' || e.key === 'Enter') setEditing(false);
        }}
        placeholder={placeholder}
        className={`bg-transparent border-b border-gray-300 focus:outline-none focus:border-gray-500 min-w-[80px] ${className ?? ''}`}
      />
    );
  }

  return (
    <span
      className={`group/ie cursor-text inline-flex items-center gap-1 hover:opacity-70 transition-opacity ${className ?? ''}`}
      onClick={() => setEditing(true)}
    >
      {value || <span className="text-gray-300 italic text-xs">{placeholder}</span>}
      <svg
        className="w-3 h-3 text-gray-300 opacity-0 group-hover/ie:opacity-100 transition-opacity flex-shrink-0"
        fill="none" viewBox="0 0 24 24" stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    </span>
  );
}

// ─── Contact item row ────────────────────────────────────────

function ContactItem({
  value,
  onEdit,
  onDelete,
}: {
  value: string;
  onEdit: (v: string) => void;
  onDelete: () => void;
}) {
  return (
    <span className="group/ci flex items-center gap-0.5">
      <InlineEditor value={value} onChange={onEdit} className="text-xs text-gray-500" />
      <button
        onClick={onDelete}
        className="opacity-0 group-hover/ci:opacity-100 transition-opacity text-gray-300 hover:text-red-400 ml-0.5"
        aria-label="Remove"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}

// ─── Types & helpers ─────────────────────────────────────────

interface EditableCvPreviewProps {
  cv: OptimizedCv;
  onChange: (updated: OptimizedCv, immediate?: boolean) => void;
  editingExperienceIdx: number | null;
  onSetEditingExperience: (idx: number | null) => void;
  theme?: CvTheme;
}

function SectionTitle({ children, theme }: { children: React.ReactNode; theme: CvTheme }) {
  if (theme.templateId === 'modern') {
    return (
      <h2
        className="text-xs font-bold uppercase tracking-wide mb-2"
        style={{ color: theme.accentColor }}
      >
        {children}
      </h2>
    );
  }
  if (theme.templateId === 'minimal') {
    return (
      <h2
        className="text-[10px] font-normal uppercase tracking-[0.2em] border-b border-gray-200 pb-1.5 mb-3 text-gray-400"
        style={{ fontVariant: 'small-caps' } as React.CSSProperties}
      >
        {children}
      </h2>
    );
  }
  // classic (default)
  return (
    <h2
      className="text-[10px] font-bold uppercase tracking-widest border-b-2 pb-1 mb-2"
      style={{ color: theme.accentColor, borderColor: theme.accentColor }}
    >
      {children}
    </h2>
  );
}

function emptyExperience(): OptimizedCvExperience {
  return {
    id: `exp-new-${Date.now()}`,
    title: '',
    company: '',
    duration: '',
    bullets: [''],
  };
}

// ─── Main component ──────────────────────────────────────────

export function EditableCvPreview({
  cv,
  onChange,
  editingExperienceIdx,
  onSetEditingExperience,
  theme = DEFAULT_THEME,
}: EditableCvPreviewProps) {
  const [showAddContact, setShowAddContact] = useState(false);
  const [addContactKey, setAddContactKey] = useState<ContactKey>('email');
  const [addContactVal, setAddContactVal] = useState('');
  const [showNewExpForm, setShowNewExpForm] = useState(false);
  const [newExp, setNewExp] = useState<{ title: string; company: string; startDate: string; endDate: string }>({
    title: '', company: '', startDate: '', endDate: '',
  });

  const skillsIsArray = Array.isArray(cv.skills);
  const hasSkills = skillsIsArray
    ? (cv.skills as string[]).length > 0
    : Object.values(cv.skills as CvSkills).some((a) => a.length > 0);

  const activeContacts = CONTACT_FIELDS.filter(({ key }) => {
    const val = cv[key];
    return val !== null && val !== undefined && val !== '';
  });
  const availableContacts = CONTACT_FIELDS.filter(({ key }) => !cv[key]);

  // ─── handlers ────────────────────────────────────────────

  function handleTitleChange(v: string) {
    onChange({ ...cv, job_title: v || undefined });
  }

  function handleContactEdit(key: ContactKey, v: string) {
    onChange({ ...cv, [key]: v || null });
  }

  function handleContactDelete(key: ContactKey) {
    onChange({ ...cv, [key]: null });
  }

  function handleAddContact() {
    if (!addContactVal.trim()) return;
    onChange({ ...cv, [addContactKey]: addContactVal.trim() });
    setAddContactVal('');
    setShowAddContact(false);
  }

  function handleSummaryChange(v: string) {
    onChange({ ...cv, summary: v });
  }

  function handleSkillsChange(skills: CvSkills | string[], immediate: boolean) {
    onChange({ ...cv, skills }, immediate);
  }

  function handleBulletsChange(idx: number, bullets: string[]) {
    const updatedExp = cv.experience.map((exp, i) =>
      i === idx ? { ...exp, bullets } : exp,
    );
    onChange({ ...cv, experience: updatedExp });
  }

  function handleSaveNewExp() {
    const entry = emptyExperience();
    entry.title = newExp.title.trim() || 'New Position';
    entry.company = newExp.company.trim() || 'Company';
    const start = newExp.startDate.trim();
    const end = newExp.endDate.trim();
    entry.duration = start && end ? `${start} – ${end}` : start || end || '';
    const updated = [...cv.experience, entry];
    onChange({ ...cv, experience: updated });
    setShowNewExpForm(false);
    setNewExp({ title: '', company: '', startDate: '', endDate: '' });
    onSetEditingExperience(updated.length - 1);
  }

  // ─── template-driven container classes ──────────────────

  const isModern  = theme.templateId === 'modern';
  const isMinimal = theme.templateId === 'minimal';
  const isClassic = theme.templateId === 'classic';

  const containerClass = [
    'bg-white rounded-xl border border-gray-100 text-sm font-sans max-h-[72vh] overflow-y-auto',
    isModern  ? 'pl-7 pr-6 py-6 border-l-4 space-y-5' : '',
    isMinimal ? 'p-8 space-y-7'                        : '',
    isClassic ? 'p-6 space-y-5'                        : '',
  ].join(' ');

  const containerStyle: React.CSSProperties = isModern
    ? { borderLeftColor: theme.accentColor }
    : {};

  // ─── render ──────────────────────────────────────────────

  return (
    <div className={containerClass} style={containerStyle}>

      {/* ── Header ── */}
      <div
        className={`border-b-2 pb-4 ${isClassic ? 'text-center' : ''}`}
        style={{ borderColor: isClassic ? theme.accentColor : '#e5e7eb' }}
      >
        {/* Name */}
        <h1
          className={`font-bold leading-tight ${isMinimal ? 'text-2xl tracking-wide' : 'text-xl'}`}
          style={isClassic ? { color: '#111' } : { color: theme.accentColor }}
        >
          {cv.name}
        </h1>

        {/* Job title — editable */}
        <div className="mt-0.5">
          <InlineEditor
            value={cv.job_title ?? ''}
            onChange={handleTitleChange}
            placeholder="Add job title..."
            className="text-sm text-gray-500 font-medium"
          />
        </div>

        {/* Contact info — editable */}
        <div className="mt-2 space-y-1">
          <div className={`flex flex-wrap gap-x-4 gap-y-1 ${isClassic ? 'justify-center' : ''}`}>
            {activeContacts.map(({ key }) => (
              <ContactItem
                key={key}
                value={(cv[key] as string) ?? ''}
                onEdit={(v) => handleContactEdit(key, v)}
                onDelete={() => handleContactDelete(key)}
              />
            ))}
          </div>

          {availableContacts.length > 0 && (
            showAddContact ? (
              <div className={`flex items-center gap-1.5 pt-0.5 ${isClassic ? 'justify-center' : ''}`}>
                <select
                  value={addContactKey}
                  onChange={(e) => setAddContactKey(e.target.value as ContactKey)}
                  className="text-xs border border-gray-200 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-gray-300"
                >
                  {availableContacts.map(({ key, label }) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <input
                  autoFocus
                  value={addContactVal}
                  onChange={(e) => setAddContactVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddContact();
                    if (e.key === 'Escape') { setShowAddContact(false); setAddContactVal(''); }
                  }}
                  placeholder="Value..."
                  className="text-xs border border-gray-200 rounded px-2 py-0.5 w-36 focus:outline-none focus:ring-1 focus:ring-gray-300"
                />
                <button
                  onMouseDown={(e) => { e.preventDefault(); handleAddContact(); }}
                  className="text-xs bg-[#1E3A5F] text-white px-2 py-0.5 rounded hover:bg-[#162d4a] transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => { setShowAddContact(false); setAddContactVal(''); }}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className={isClassic ? 'flex justify-center' : ''}>
                <button
                  onClick={() => { setAddContactKey(availableContacts[0].key); setShowAddContact(true); }}
                  className="flex items-center gap-0.5 text-xs text-gray-300 hover:text-gray-500 border border-dashed border-gray-200 hover:border-gray-300 rounded px-1.5 py-0.5 transition-colors mt-0.5"
                >
                  <span className="text-sm leading-none">+</span> Add contact
                </button>
              </div>
            )
          )}
        </div>
      </div>

      {/* ── Summary — editable ── */}
      {cv.summary && (
        <section>
          <SectionTitle theme={theme}>Professional Summary</SectionTitle>
          <SummaryEditor value={cv.summary} onChange={handleSummaryChange} />
        </section>
      )}

      {/* ── Experience — bullets editable + add new ── */}
      <section>
        <SectionTitle theme={theme}>Experience</SectionTitle>
        <div className="space-y-4">
          {cv.experience.map((exp, i) => {
            const isActive = editingExperienceIdx === i;
            const isOther = editingExperienceIdx !== null && !isActive;
            return (
              <div
                key={exp.id ?? i}
                className={`transition-all duration-200 rounded-lg p-1.5 -mx-1.5 ${
                  isActive ? 'ring-2 ring-gray-200 bg-gray-50/60' : isOther ? 'opacity-60' : ''
                }`}
              >
                <div className="flex justify-between items-start gap-2 mb-1">
                  <div>
                    <p className="font-semibold text-gray-900 text-xs">{exp.title}</p>
                    <p className="text-gray-500 text-xs">{exp.company}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-xs whitespace-nowrap">{exp.duration}</span>
                    {!isActive && (
                      <>
                        <button
                          onClick={() => onSetEditingExperience(i)}
                          className="text-xs text-[#1E3A5F] hover:text-[#162d4a] border border-[#1E3A5F]/30 rounded px-1.5 py-0.5 hover:bg-[#1E3A5F]/5 transition-colors whitespace-nowrap"
                        >
                          Edit bullets
                        </button>
                        <button
                          onClick={() => {
                            const updated = cv.experience.filter((_, idx) => idx !== i);
                            onChange({ ...cv, experience: updated });
                          }}
                          className="w-5 h-5 flex items-center justify-center rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                          aria-label="Remove experience"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isActive ? (
                  <BulletsEditor
                    bullets={exp.bullets}
                    onChange={(b) => handleBulletsChange(i, b)}
                    onDone={() => onSetEditingExperience(null)}
                  />
                ) : (
                  <ul className="mt-1 space-y-1">
                    {exp.bullets.map((bullet, j) => (
                      <li key={j} className="flex gap-1.5 text-gray-700 leading-relaxed text-xs">
                        <span className="flex-shrink-0 mt-0.5" style={{ color: theme.accentColor }}>•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}

          {/* Add new experience */}
          {showNewExpForm ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50/40 p-3 space-y-2">
              <input
                autoFocus
                value={newExp.title}
                onChange={(e) => setNewExp((p) => ({ ...p, title: e.target.value }))}
                placeholder="Job title (e.g. Senior Developer)"
                className="w-full text-xs border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-gray-300"
              />
              <input
                value={newExp.company}
                onChange={(e) => setNewExp((p) => ({ ...p, company: e.target.value }))}
                placeholder="Company name"
                className="w-full text-xs border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-gray-300"
              />
              <div className="flex items-center gap-2">
                <input
                  value={newExp.startDate}
                  onChange={(e) => setNewExp((p) => ({ ...p, startDate: e.target.value }))}
                  placeholder="Start (e.g. Jan 2022)"
                  className="flex-1 text-xs border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-gray-300"
                />
                <span className="text-gray-400 text-xs font-medium select-none">–</span>
                <input
                  value={newExp.endDate}
                  onChange={(e) => setNewExp((p) => ({ ...p, endDate: e.target.value }))}
                  placeholder="End or Present"
                  className="flex-1 text-xs border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-gray-300"
                />
              </div>
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  onClick={handleSaveNewExp}
                  className="text-xs bg-[#1E3A5F] text-white px-3 py-1 rounded hover:bg-[#162d4a] transition-colors font-medium"
                >
                  Add Experience
                </button>
                <button
                  onClick={() => { setShowNewExpForm(false); setNewExp({ title: '', company: '', startDate: '', endDate: '' }); }}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNewExpForm(true)}
              className="w-full text-xs text-gray-400 hover:text-gray-600 border border-dashed border-gray-200 hover:border-gray-300 rounded-lg py-2 transition-colors flex items-center justify-center gap-1"
            >
              <span className="text-sm leading-none">+</span> Add Experience
            </button>
          )}
        </div>
      </section>

      {/* ── Education — non-editable ── */}
      {cv.education.length > 0 && (
        <section>
          <SectionTitle theme={theme}>Education</SectionTitle>
          <div className="space-y-2">
            {cv.education.map((edu, i) => (
              <div key={i} className="flex justify-between items-start gap-2">
                <div>
                  <p className="font-semibold text-gray-900 text-xs">{edu.degree}</p>
                  <p className="text-gray-500 text-xs">{edu.school}</p>
                </div>
                <span className="text-gray-400 text-xs whitespace-nowrap">{edu.year}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Skills — editable ── */}
      {hasSkills && (
        <section>
          <SectionTitle theme={theme}>Skills</SectionTitle>
          <SkillsEditor skills={cv.skills} onChange={handleSkillsChange} accentColor={theme.accentColor} />
        </section>
      )}

      {/* ── References — non-editable ── */}
      {cv.references && cv.references.length > 0 && (
        <section>
          <SectionTitle theme={theme}>References</SectionTitle>
          <div className="space-y-2">
            {cv.references.map((ref, i) => (
              <div key={i} className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-900 text-xs">{ref.name}</p>
                  <p className="text-gray-500 text-xs">{ref.title}</p>
                </div>
                <span className="text-gray-400 text-xs whitespace-nowrap">{ref.contact}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
