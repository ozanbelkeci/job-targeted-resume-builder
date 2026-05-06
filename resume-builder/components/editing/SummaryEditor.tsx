'use client';

import { useState, useRef, useEffect } from 'react';

interface SummaryEditorProps {
  value: string;
  onChange: (v: string) => void;
}

export function SummaryEditor({ value, onChange }: SummaryEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      autoResize(textareaRef.current);
    }
  }, [isEditing]);

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Escape') setIsEditing(false);
  }

  if (isEditing) {
    return (
      <div className="relative rounded-lg">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            autoResize(e.target);
          }}
          onBlur={() => setIsEditing(false)}
          onKeyDown={handleKeyDown}
          rows={3}
          className="w-full text-xs text-gray-700 leading-relaxed bg-transparent border border-[#1E3A5F]/30 rounded-lg px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-[#1E3A5F]/40"
        />
      </div>
    );
  }

  return (
    <div
      className="relative group cursor-text rounded-lg transition-all hover:bg-gray-50/60"
      onClick={() => setIsEditing(true)}
    >
      <p className="text-gray-700 leading-relaxed text-xs pr-6">{value}</p>
      <button
        onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-[#1E3A5F]"
        aria-label="Edit summary"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>
    </div>
  );
}
