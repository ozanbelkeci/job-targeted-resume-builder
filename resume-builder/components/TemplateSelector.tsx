'use client';

import { TEMPLATES, COLOR_PALETTES } from '@/lib/cv-templates';
import type { TemplateId } from '@/types';

interface TemplateSelectorProps {
  selectedTemplate: TemplateId;
  selectedColor: string;
  onTemplateChange: (id: TemplateId) => void;
  onColorChange: (color: string) => void;
}

function ClassicThumbnail({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 80 60" fill="none" className="w-full h-full">
      <rect x="20" y="6"  width="40" height="4"   rx="1" fill={color}     opacity="0.8" />
      <rect x="27" y="13" width="26" height="2.5" rx="1" fill="#94a3b8" />
      <rect x="6"  y="21" width="68" height="1"   rx="0" fill={color}     opacity="0.4" />
      <rect x="6"  y="26" width="20" height="2.5" rx="1" fill={color}     opacity="0.6" />
      <rect x="6"  y="32" width="68" height="2"   rx="1" fill="#e2e8f0" />
      <rect x="6"  y="37" width="55" height="2"   rx="1" fill="#e2e8f0" />
      <rect x="6"  y="42" width="62" height="2"   rx="1" fill="#e2e8f0" />
      <rect x="6"  y="49" width="20" height="2.5" rx="1" fill={color}     opacity="0.6" />
      <rect x="6"  y="55" width="68" height="1"   rx="0" fill={color}     opacity="0.4" />
    </svg>
  );
}

function ModernThumbnail({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 80 60" fill="none" className="w-full h-full">
      <rect x="0"  y="0"  width="3"  height="60" rx="0" fill={color} />
      <rect x="8"  y="6"  width="36" height="4"   rx="1" fill={color}     opacity="0.8" />
      <rect x="8"  y="13" width="50" height="2"   rx="1" fill="#94a3b8" />
      <rect x="8"  y="22" width="22" height="2.5" rx="1" fill={color}     opacity="0.6" />
      <rect x="8"  y="28" width="65" height="2"   rx="1" fill="#e2e8f0" />
      <rect x="8"  y="33" width="52" height="2"   rx="1" fill="#e2e8f0" />
      <rect x="8"  y="38" width="60" height="2"   rx="1" fill="#e2e8f0" />
      <rect x="8"  y="47" width="22" height="2.5" rx="1" fill={color}     opacity="0.6" />
      <rect x="8"  y="53" width="65" height="2"   rx="1" fill="#e2e8f0" />
    </svg>
  );
}

function MinimalThumbnail({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 80 60" fill="none" className="w-full h-full">
      <rect x="6" y="4"  width="52" height="6"   rx="1" fill="#111111" opacity="0.85" />
      <rect x="6" y="18" width="28" height="1.5" rx="1" fill={color} opacity="0.4" />
      <rect x="6" y="22" width="68" height="0.5" rx="0" fill="#e2e8f0" />
      <rect x="6" y="27" width="68" height="2"   rx="1" fill="#e2e8f0" />
      <rect x="6" y="33" width="55" height="2"   rx="1" fill="#e2e8f0" />
      <rect x="6" y="43" width="28" height="1.5" rx="1" fill={color} opacity="0.4" />
      <rect x="6" y="47" width="68" height="0.5" rx="0" fill="#e2e8f0" />
      <rect x="6" y="52" width="68" height="2"   rx="1" fill="#e2e8f0" />
    </svg>
  );
}

const THUMBNAILS: Record<TemplateId, React.ComponentType<{ color: string }>> = {
  classic: ClassicThumbnail,
  modern:  ModernThumbnail,
  minimal: MinimalThumbnail,
};

export function TemplateSelector({
  selectedTemplate,
  selectedColor,
  onTemplateChange,
  onColorChange,
}: TemplateSelectorProps) {
  const palettes = COLOR_PALETTES[selectedTemplate];

  return (
    <div className="mb-4 pb-4 border-b border-gray-100">
      {/* Template cards */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {TEMPLATES.map((tpl) => {
          const isSelected = tpl.id === selectedTemplate;
          const TplThumb = THUMBNAILS[tpl.id];
          return (
            <button
              key={tpl.id}
              onClick={() => onTemplateChange(tpl.id)}
              className={`rounded-lg border p-2 text-left transition-all ${
                isSelected
                  ? 'border-[#1E3A5F] bg-[#1E3A5F]/5 ring-1 ring-[#1E3A5F]'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="h-[72px] mb-1.5 rounded overflow-hidden bg-gray-50">
                <TplThumb color={isSelected ? selectedColor : '#94a3b8'} />
              </div>
              <p className={`text-[10px] font-semibold text-center ${isSelected ? 'text-[#1E3A5F]' : 'text-gray-500'}`}>
                {tpl.label}
              </p>
            </button>
          );
        })}
      </div>

      {/* Color dots + selected template preview thumbnail (hidden, re-uses Thumb) */}
      <div className="flex items-center gap-1.5 px-0.5">
        <span className="text-[10px] text-gray-400 mr-1">Color:</span>
        {palettes.map((color) => (
          <button
            key={color}
            onClick={() => onColorChange(color)}
            className={`w-4 h-4 rounded-full transition-transform hover:scale-125 flex-shrink-0 ${
              selectedColor === color
                ? 'ring-2 ring-white ring-offset-1 scale-110'
                : ''
            }`}
            style={{
              backgroundColor: color,
              boxShadow: selectedColor === color ? `0 0 0 2px ${color}` : undefined,
            }}
            aria-label={color}
          />
        ))}
      </div>

    </div>
  );
}
