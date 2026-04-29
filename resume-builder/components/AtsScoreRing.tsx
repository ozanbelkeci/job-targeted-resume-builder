'use client';

import { ATS_SCORE_THRESHOLDS } from '@/lib/constants';

interface AtsScoreRingProps {
  score: number;
}

function getScoreColor(score: number) {
  if (score < ATS_SCORE_THRESHOLDS.LOW) return '#ef4444'; // red
  if (score < ATS_SCORE_THRESHOLDS.MEDIUM) return '#f59e0b'; // amber
  return '#22c55e'; // green
}

function getScoreLabel(score: number) {
  if (score < ATS_SCORE_THRESHOLDS.LOW) return 'Needs Improvement';
  if (score < ATS_SCORE_THRESHOLDS.MEDIUM) return 'Good Match';
  return 'Excellent Match';
}

export function AtsScoreRing({ score }: AtsScoreRingProps) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>{score}</span>
          <span className="text-xs text-gray-400">/ 100</span>
        </div>
      </div>
      <span
        className="text-sm font-semibold px-3 py-1 rounded-full"
        style={{ color, backgroundColor: `${color}18` }}
      >
        {label}
      </span>
    </div>
  );
}
