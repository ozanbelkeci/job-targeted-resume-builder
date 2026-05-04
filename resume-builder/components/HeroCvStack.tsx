'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

const CARDS = [
  {
    company: 'Netflix',
    jobTitle: 'Data Analyst',
    atsScore: 78,
    skills: ['Python', 'SQL', 'Tableau'],
    expLines: [88, 72, 92, 58, 76],
  },
  {
    company: 'Spotify',
    jobTitle: 'Product Manager',
    atsScore: 87,
    skills: ['Agile', 'Analytics', 'OKR'],
    expLines: [100, 78, 64, 90, 70],
  },
  {
    company: 'Meta',
    jobTitle: 'Software Engineer',
    atsScore: 92,
    skills: ['React', 'TypeScript', 'Docker'],
    expLines: [100, 84, 70, 92, 64],
  },
];

const BASE = [
  { x: 0, y: 0 },
  { x: 22, y: 16 },
  { x: 44, y: 32 },
];

function getTransform(i: number, hovered: number | null): string {
  const { x } = BASE[i];
  let y = BASE[i].y;
  if (hovered === 0 && i === 1) y += 62;
  if (hovered === 0 && i === 2) y += 100;
  if (hovered === 1 && i === 2) y += 78;
  if (hovered === i) y -= 20;
  return `translate(${x}px, ${y}px) skewY(-2deg)`;
}

function ScoreRing({ score }: { score: number }) {
  const r = 15;
  const circ = 2 * Math.PI * r;
  const color = score >= 85 ? '#22c55e' : score >= 70 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative w-10 h-10 flex-shrink-0">
      <svg className="w-10 h-10 -rotate-90" viewBox="0 0 38 38">
        <circle cx="19" cy="19" r={r} fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
        <circle
          cx="19" cy="19" r={r} fill="none" stroke={color}
          strokeWidth="3.5" strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ - (score / 100) * circ}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] font-bold leading-none text-[#1E3A5F]">{score}</span>
      </div>
    </div>
  );
}

export function HeroCvStack() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="relative w-[290px] h-[420px]">
      {CARDS.map((card, i) => {
        const overlayOpacity = hovered === i ? 0 : i === 0 ? 0.52 : i === 1 ? 0.2 : 0;
        const grayscale = hovered === i ? 0 : i === 0 ? 80 : i === 1 ? 35 : 0;

        return (
          <div
            key={i}
            className={cn(
              'absolute flex flex-col w-[218px] rounded-2xl border bg-white px-4 py-4 select-none cursor-default overflow-hidden',
              i === 2
                ? 'border-blue-100/80'
                : 'border-gray-200/70',
            )}
            style={{
              minHeight: 292,
              transform: getTransform(i, hovered),
              transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1), filter 0.45s ease, box-shadow 0.3s ease',
              zIndex: i,
              filter: `grayscale(${grayscale}%)`,
              boxShadow:
                i === 2
                  ? '0 20px 40px -10px rgba(30,58,95,0.20), 0 4px 12px -2px rgba(30,58,95,0.10)'
                  : '0 4px 14px -3px rgba(30,58,95,0.08)',
            }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#1E3A5F] via-blue-400 to-[#1E3A5F]" />

            {/* Dim overlay for back cards */}
            <div
              className="absolute inset-0 bg-white pointer-events-none z-10"
              style={{ opacity: overlayOpacity, transition: 'opacity 0.45s ease' }}
            />

            {/* Header: company / job + score ring */}
            <div className="flex items-start justify-between mb-3 mt-1">
              <div className="min-w-0 mr-2">
                <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-widest truncate">
                  {card.company}
                </p>
                <p className="text-xs font-bold text-[#1E3A5F] leading-tight truncate">
                  {card.jobTitle}
                </p>
              </div>
              <ScoreRing score={card.atsScore} />
            </div>

            {/* ── CV skeleton ── */}
            <div className="flex-1 space-y-3">

              {/* Name + contact block */}
              <div className="space-y-1">
                <div className="h-2 rounded bg-[#1E3A5F]/75 w-[68%]" />
                <div className="flex gap-2 mt-1">
                  <div className="h-1.5 rounded bg-gray-200 w-2/5" />
                  <div className="h-1.5 rounded bg-gray-200 w-1/4" />
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              {/* Experience section */}
              <div>
                <div className="h-1.5 rounded bg-[#1E3A5F]/18 w-1/3 mb-2" />
                {/* Job row */}
                <div className="flex gap-2 mb-1.5">
                  <div className="h-1.5 rounded bg-[#1E3A5F]/30 w-2/5" />
                  <div className="h-1.5 rounded bg-gray-200 w-1/4" />
                </div>
                {/* Bullet lines */}
                <div className="space-y-1.5 pl-1.5">
                  {card.expLines.map((w, li) => (
                    <div
                      key={li}
                      className="h-1.5 rounded bg-gray-200"
                      style={{ width: `${w}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* Skills section */}
              <div>
                <div className="h-1.5 rounded bg-[#1E3A5F]/18 w-1/4 mb-2" />
                <div className="flex flex-wrap gap-1">
                  {card.skills.map((s) => (
                    <span
                      key={s}
                      className="text-[9px] bg-green-50 text-green-700 border border-green-200 rounded px-1.5 py-0.5 font-semibold"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[9px] text-gray-400">AI Optimized</span>
              <span className="text-[9px] font-semibold text-[#1E3A5F]">Download PDF →</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
