'use client';

import { useState, useRef, useCallback } from 'react';
import type { CvSkills } from '@/types';

const SKILL_CATS: Array<{ key: keyof CvSkills; label: string }> = [
  { key: 'languages', label: 'Languages' },
  { key: 'frameworks', label: 'Frameworks' },
  { key: 'databases', label: 'Databases' },
  { key: 'tools', label: 'Tools' },
  { key: 'methodologies', label: 'Methodologies' },
];

interface SkillsEditorProps {
  skills: CvSkills | string[];
  onChange: (s: CvSkills | string[], immediate: boolean) => void;
  accentColor?: string;
}

function ChipButton({
  label,
  onRemove,
  accentColor,
}: {
  label: string;
  onRemove: () => void;
  accentColor: string;
}) {
  return (
    <span
      className="group relative flex items-center text-xs px-2 py-0.5 rounded font-medium"
      style={{ backgroundColor: accentColor + '18', color: accentColor }}
    >
      {label}
      <button
        onClick={onRemove}
        className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 leading-none"
        style={{ color: accentColor }}
        aria-label={`Remove ${label}`}
      >
        ×
      </button>
    </span>
  );
}

interface AddInputProps {
  onAdd: (skill: string) => void;
  category?: keyof CvSkills;
  onCategoryChange?: (c: keyof CvSkills) => void;
  showCategorySelect: boolean;
}

function AddInput({ onAdd, category, onCategoryChange, showCategorySelect }: AddInputProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLSpanElement>(null);

  function handleOpen() {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function handleAdd() {
    const trimmed = input.trim();
    if (!trimmed) { setOpen(false); return; }
    onAdd(trimmed);
    setInput('');
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); handleAdd(); }
    if (e.key === 'Escape') { setOpen(false); setInput(''); }
  }

  const handleBlur = useCallback((e: React.FocusEvent<HTMLSpanElement>) => {
    if (containerRef.current?.contains(e.relatedTarget as Node)) return;
    if (!input.trim()) setOpen(false);
  }, [input]);

  if (!open) {
    return (
      <button
        onClick={handleOpen}
        className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#1E3A5F] border border-dashed border-gray-300 hover:border-[#1E3A5F]/40 px-2 py-0.5 rounded transition-colors"
      >
        <span className="text-sm leading-none">+</span> Add
      </button>
    );
  }

  return (
    <span ref={containerRef} className="flex items-center gap-1.5" onBlur={handleBlur}>
      {showCategorySelect && category && onCategoryChange && (
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value as keyof CvSkills)}
          className="text-xs border border-gray-200 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#1E3A5F]/30"
        >
          {SKILL_CATS.map(({ key, label }) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      )}
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="e.g. Docker"
        className="text-xs border border-gray-200 rounded px-2 py-0.5 w-28 focus:outline-none focus:ring-1 focus:ring-gray-300"
      />
      <button
        onMouseDown={(e) => { e.preventDefault(); handleAdd(); }}
        className="text-xs bg-[#1E3A5F] text-white px-2 py-0.5 rounded hover:bg-[#162d4a] transition-colors"
      >
        Add
      </button>
    </span>
  );
}

export function SkillsEditor({ skills, onChange, accentColor = '#1E3A5F' }: SkillsEditorProps) {
  const [addCategory, setAddCategory] = useState<keyof CvSkills>('tools');
  const isArray = Array.isArray(skills);

  function removeSkill(skill: string) {
    if (isArray) {
      onChange((skills as string[]).filter((s) => s !== skill), true);
    } else {
      const obj = skills as CvSkills;
      const updated: CvSkills = { ...obj };
      for (const { key } of SKILL_CATS) {
        updated[key] = obj[key].filter((s) => s !== skill);
      }
      onChange(updated, true);
    }
  }

  function addSkill(skill: string) {
    if (isArray) {
      onChange([...(skills as string[]), skill], true);
    } else {
      const obj = skills as CvSkills;
      const updated: CvSkills = { ...obj };
      updated[addCategory] = [...obj[addCategory], skill];
      onChange(updated, true);
    }
  }

  if (isArray) {
    return (
      <div className="flex flex-wrap gap-1.5 items-center">
        {(skills as string[]).map((skill) => (
          <ChipButton key={skill} label={skill} onRemove={() => removeSkill(skill)} accentColor={accentColor} />
        ))}
        <AddInput onAdd={addSkill} showCategorySelect={false} />
      </div>
    );
  }

  const obj = skills as CvSkills;
  return (
    <div className="space-y-1.5">
      {SKILL_CATS.map(({ key, label }) => {
        const arr = obj[key] ?? [];
        if (arr.length === 0 && key !== addCategory) return null;
        return (
          <div key={key} className="flex flex-wrap items-start gap-1.5">
            <span className="text-xs font-semibold text-gray-500 w-24 shrink-0 pt-0.5">{label}</span>
            <div className="flex flex-wrap gap-1.5 items-center flex-1">
              {arr.map((skill) => (
                <ChipButton key={skill} label={skill} onRemove={() => removeSkill(skill)} accentColor={accentColor} />
              ))}
            </div>
          </div>
        );
      })}
      <div className="flex items-center gap-1.5 pt-0.5">
        <span className="text-xs font-semibold text-gray-400 w-24 shrink-0" />
        <AddInput
          onAdd={addSkill}
          showCategorySelect
          category={addCategory}
          onCategoryChange={setAddCategory}
        />
      </div>
    </div>
  );
}
