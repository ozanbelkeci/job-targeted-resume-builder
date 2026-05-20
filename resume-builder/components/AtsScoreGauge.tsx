'use client';

import { useState, useEffect, useRef } from 'react';
import { ATS_SCORE_THRESHOLDS } from '@/lib/constants';

const CX = 130;
const CY = 118;
const R  = 100;
const SW = 16;

// Background: left → right going UP (counterclockwise, sweep=0)
const BG_PATH = `M ${CX - R},${CY} A ${R},${R} 0 0,0 ${CX + R},${CY}`;

// Filled arc from left point, sweeping counterclockwise (upward).
// large-arc is always 0 — the filled portion is always ≤ 180°.
function arcPath(progress: number): string {
  if (progress <= 0) return '';
  const p = Math.min(progress, 0.9999);
  const endX = CX - R * Math.cos(p * Math.PI);
  const endY = CY - R * Math.sin(p * Math.PI);
  return `M ${CX - R},${CY} A ${R},${R} 0 0,0 ${endX.toFixed(3)},${endY.toFixed(3)}`;
}

function getColor(score: number): string {
  if (score >= ATS_SCORE_THRESHOLDS.MEDIUM) return '#22c55e';
  if (score >= ATS_SCORE_THRESHOLDS.LOW)    return '#f59e0b';
  return '#ef4444';
}

function getLabel(score: number): string {
  if (score >= ATS_SCORE_THRESHOLDS.MEDIUM) return 'Excellent Match';
  if (score >= ATS_SCORE_THRESHOLDS.LOW)    return 'Good Match';
  return 'Needs Improvement';
}

interface AtsScoreGaugeProps {
  score: number;
}

export function AtsScoreGauge({ score }: AtsScoreGaugeProps) {
  const [display, setDisplay] = useState(0);
  const animated = useRef(false);

  useEffect(() => {
    const from = animated.current ? display : 0;
    animated.current = true;
    const duration = 1200;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + eased * (score - from)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  const color  = getColor(score);
  const label  = getLabel(score);
  const filled = arcPath(display / 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        viewBox={`0 0 ${CX * 2} ${CY + 22}`}
        width={CX * 2}
        height={CY + 22}
        className="overflow-visible"
        aria-label={`ATS Score: ${display} out of 100`}
        role="img"
      >
        {/* Track */}
        <path
          d={BG_PATH}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={SW}
          strokeLinecap="round"
        />

        {/* Progress arc */}
        {display > 0 && (
          <path
            d={filled}
            fill="none"
            stroke={color}
            strokeWidth={SW}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 8px ${color}66)` }}
          />
        )}

        {/* Score number */}
        <text
          x={CX}
          y={CY - 14}
          textAnchor="middle"
          dominantBaseline="auto"
          style={{
            fontFamily: 'inherit',
            fontSize: 52,
            fontWeight: 800,
            fill: color,
            letterSpacing: '-2px',
          }}
        >
          {display}
        </text>

        {/* / 100 */}
        <text
          x={CX}
          y={CY + 8}
          textAnchor="middle"
          dominantBaseline="auto"
          style={{ fontFamily: 'inherit', fontSize: 13, fill: '#9ca3af' }}
        >
          / 100
        </text>
      </svg>

      {/* Label badge */}
      <span
        className="text-sm font-semibold px-3.5 py-1.5 rounded-full transition-colors duration-500"
        style={{ color, backgroundColor: `${color}18` }}
      >
        {label}
      </span>
    </div>
  );
}
