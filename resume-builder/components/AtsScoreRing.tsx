'use client';

import { useState, useEffect, useRef } from 'react';
import { ATS_SCORE_THRESHOLDS } from '@/lib/constants';

interface AtsScoreRingProps {
  score: number;
}

function getScoreColor(score: number) {
  if (score < ATS_SCORE_THRESHOLDS.LOW) return '#ef4444';
  if (score < ATS_SCORE_THRESHOLDS.MEDIUM) return '#f59e0b';
  return '#22c55e';
}

function getScoreLabel(score: number) {
  if (score < ATS_SCORE_THRESHOLDS.LOW) return 'Needs Improvement';
  if (score < ATS_SCORE_THRESHOLDS.MEDIUM) return 'Good Match';
  return 'Excellent Match';
}

export function AtsScoreRing({ score }: AtsScoreRingProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const start = displayScore;
    const end = score;
    const diff = end - start;
    if (diff === 0) return;
    const steps = Math.abs(diff);
    const stepTime = Math.max(Math.round(600 / steps), 8);
    let current = start;
    timerRef.current = setInterval(() => {
      current += diff > 0 ? 1 : -1;
      setDisplayScore(current);
      if (current === end && timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }, stepTime);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = (displayScore / 100) * circumference;
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
            style={{ transition: 'stroke 0.4s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tabular-nums" style={{ color }}>{displayScore}</span>
          <span className="text-xs text-gray-400">/ 100</span>
        </div>
      </div>
      <span
        className="text-sm font-semibold px-3 py-1 rounded-full transition-colors duration-400"
        style={{ color, backgroundColor: `${color}18` }}
      >
        {label}
      </span>
    </div>
  );
}
