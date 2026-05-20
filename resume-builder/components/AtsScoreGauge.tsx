'use client';

import { useState, useEffect, useRef } from 'react';
import { ATS_SCORE_THRESHOLDS } from '@/lib/constants';

/*
  SVG half-circle gauge — flat edge at bottom, arc goes UPWARD.

  Key insight: sweep=1 (clockwise on screen) traces the UPPER semicircle
  from left → top → right.  sweep=0 would trace the lower (wrong) half.

  End-point formula for progress p ∈ [0,1]:
    angle = 180° − p·180°  (standard math, y-up)
    x = CX − R·cos(p·π)
    y = CY − R·sin(p·π)

  large-arc is always 0 because the filled portion is always ≤ 180°.
*/

const CX = 130;   // horizontal center
const CY = 125;   // vertical position of flat edge (bottom of semicircle)
const R  = 102;   // radius
const SW = 16;    // stroke width

const START_X = CX - R;  // 28
const END_X   = CX + R;  // 232

const BG_PATH = `M ${START_X},${CY} A ${R},${R} 0 0,1 ${END_X},${CY}`;

function filledPath(p: number): string {
  if (p <= 0) return '';
  const safe = Math.min(p, 0.9999);
  const ex = CX - R * Math.cos(safe * Math.PI);
  const ey = CY - R * Math.sin(safe * Math.PI);
  return `M ${START_X},${CY} A ${R},${R} 0 0,1 ${ex.toFixed(3)},${ey.toFixed(3)}`;
}

function getColor(s: number) {
  if (s >= ATS_SCORE_THRESHOLDS.MEDIUM) return '#22c55e';
  if (s >= ATS_SCORE_THRESHOLDS.LOW)    return '#f59e0b';
  return '#ef4444';
}

function getLabel(s: number) {
  if (s >= ATS_SCORE_THRESHOLDS.MEDIUM) return 'Excellent Match';
  if (s >= ATS_SCORE_THRESHOLDS.LOW)    return 'Good Match';
  return 'Needs Improvement';
}

export function AtsScoreGauge({ score }: { score: number }) {
  const [display, setDisplay] = useState(0);
  const hasRun = useRef(false);

  useEffect(() => {
    const from = hasRun.current ? display : 0;
    hasRun.current = true;
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

  const color = getColor(score);
  const label = getLabel(score);
  const VW = CX * 2;          // 260
  const VH = CY + 20;         // 145

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        width={VW}
        height={VH}
        overflow="visible"
        role="img"
        aria-label={`ATS Score ${display} / 100`}
      >
        {/* Background track */}
        <path
          d={BG_PATH}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={SW}
          strokeLinecap="round"
        />

        {/* Filled arc */}
        {display > 0 && (
          <path
            d={filledPath(display / 100)}
            fill="none"
            stroke={color}
            strokeWidth={SW}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 7px ${color}55)` }}
          />
        )}

        {/* Score number */}
        <text
          x={CX}
          y={CY - 18}
          textAnchor="middle"
          dominantBaseline="auto"
          style={{
            fontFamily: 'inherit',
            fontSize: 54,
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
          y={CY + 10}
          textAnchor="middle"
          dominantBaseline="auto"
          style={{ fontFamily: 'inherit', fontSize: 13, fill: '#9ca3af' }}
        >
          / 100
        </text>
      </svg>

      <span
        className="text-sm font-semibold px-3.5 py-1.5 rounded-full transition-colors duration-500"
        style={{ color, backgroundColor: `${color}18` }}
      >
        {label}
      </span>
    </div>
  );
}
