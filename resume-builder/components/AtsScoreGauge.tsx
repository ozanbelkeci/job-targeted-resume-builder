'use client';

import { useState, useEffect, useRef } from 'react';
import { ATS_SCORE_THRESHOLDS } from '@/lib/constants';

// Semicircle geometry
const CX = 130;
const CY = 128;
const R  = 105;
const SW = 18; // stroke width

const BG_PATH = `M ${CX - R},${CY} A ${R},${R} 0 0,0 ${CX + R},${CY}`;

function arcPath(progress: number): string {
  if (progress <= 0) return '';
  const p = Math.min(progress, 0.9999);
  const endX = CX - R * Math.cos(p * Math.PI);
  const endY = CY - R * Math.sin(p * Math.PI);
  const large = p > 0.5 ? 1 : 0;
  return `M ${CX - R},${CY} A ${R},${R} 0 ${large},0 ${endX.toFixed(3)},${endY.toFixed(3)}`;
}

function tickPoint(fraction: number) {
  const angle = Math.PI - fraction * Math.PI; // left=180° → right=0°
  const inner = R - SW / 2 - 4;
  const outer = R + SW / 2 + 6;
  return {
    x1: CX + inner * Math.cos(angle),
    y1: CY - inner * Math.sin(angle),
    x2: CX + outer * Math.cos(angle),
    y2: CY - outer * Math.sin(angle),
  };
}

function labelPoint(fraction: number, offset = R + SW / 2 + 20) {
  const angle = Math.PI - fraction * Math.PI;
  return {
    x: CX + offset * Math.cos(angle),
    y: CY - offset * Math.sin(angle),
  };
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
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    const from = animated.current ? display : 0;
    animated.current = true;

    const steps = Math.max(Math.abs(score - from), 1);
    const duration = Math.min(1400, steps * 12);
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(from + eased * (score - from));
      setDisplay(current);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  const color = getColor(score);
  const label = getLabel(score);
  const filled = arcPath(display / 100);

  const ticks = [0, 0.25, 0.5, 0.75, 1];
  const tickLabels = ['0', '25', '50', '75', '100'];

  const VW = CX * 2;
  const VH = CY + 28;

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        width={VW}
        height={VH}
        className="overflow-visible"
        aria-label={`ATS Score: ${display} out of 100`}
        role="img"
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
            d={filled}
            fill="none"
            stroke={color}
            strokeWidth={SW}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color}55)` }}
          />
        )}

        {/* Tick marks */}
        {ticks.map((f, i) => {
          const t = tickPoint(f);
          return (
            <line
              key={f}
              x1={t.x1} y1={t.y1}
              x2={t.x2} y2={t.y2}
              stroke="#d1d5db"
              strokeWidth={i === 0 || i === 4 ? 2 : 1.5}
              strokeLinecap="round"
            />
          );
        })}

        {/* Tick labels */}
        {tickLabels.map((lbl, i) => {
          const pos = labelPoint(ticks[i]);
          return (
            <text
              key={lbl}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fontFamily: 'inherit', fontSize: 11, fill: '#9ca3af', fontWeight: 500 }}
            >
              {lbl}
            </text>
          );
        })}

        {/* Score number */}
        <text
          x={CX}
          y={CY - 26}
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
          y={CY + 4}
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
