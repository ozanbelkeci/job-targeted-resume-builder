'use client';

import { useRef, useEffect, useState } from 'react';
import { useInView } from 'framer-motion';

function useCountUp(target: number, duration: number, triggered: boolean) {
  const [display, setDisplay] = useState(0);
  const animated = useRef(false);

  useEffect(() => {
    if (!triggered || animated.current) return;
    animated.current = true;

    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [triggered, target, duration]);

  return display;
}

export function AnimatedStats() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const resumes = useCountUp(10000, 1800, inView);
  const ats = useCountUp(34, 1400, inView);
  const minutes = useCountUp(3, 900, inView);

  return (
    <div ref={ref} className="max-w-4xl mx-auto px-6 py-12 grid grid-cols-3 divide-x divide-gray-100">
      <div className="flex flex-col items-center px-6 text-center">
        <span className="text-3xl lg:text-4xl font-bold text-[#1E3A5F] mb-1 tabular-nums">
          {resumes.toLocaleString()}+
        </span>
        <span className="text-sm text-gray-500">Resumes Optimized</span>
      </div>
      <div className="flex flex-col items-center px-6 text-center">
        <span className="text-3xl lg:text-4xl font-bold text-[#1E3A5F] mb-1 tabular-nums">
          +{ats} pts
        </span>
        <span className="text-sm text-gray-500">Avg. ATS Improvement</span>
      </div>
      <div className="flex flex-col items-center px-6 text-center">
        <span className="text-3xl lg:text-4xl font-bold text-[#1E3A5F] mb-1 tabular-nums">
          &lt;&nbsp;{minutes} min
        </span>
        <span className="text-sm text-gray-500">Time to Optimize</span>
      </div>
    </div>
  );
}
