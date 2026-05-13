'use client';

import { useEffect, useRef } from 'react';

export function LandingBackground() {
  const blobRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const blob = blobRef.current;
    if (!blob) return;

    function onMouseMove(e: MouseEvent) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(() => {
        if (!blob) return;
        blob.style.transform = `translate(${e.clientX - 300}px, ${e.clientY - 300}px)`;
        blob.style.opacity = '1';
      });
    }

    function onMouseLeave() {
      if (!blob) return;
      blob.style.opacity = '0';
    }

    window.addEventListener('mousemove', onMouseMove);
    document.documentElement.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <>
      {/* Mouse-following gradient — fixed, covers entire viewport */}
      <div
        ref={blobRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 w-[600px] h-[600px] rounded-full opacity-0 transition-opacity duration-700"
        style={{
          background:
            'radial-gradient(circle, rgba(30,58,95,0.07) 0%, rgba(56,121,217,0.03) 45%, transparent 70%)',
          filter: 'blur(60px)',
          willChange: 'transform',
          zIndex: 0,
        }}
      />

      {/* Ambient floating blobs — slow drift, always visible */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-[12%] right-[8%] w-[360px] h-[360px] rounded-full landing-blob-1"
        style={{
          background: 'rgba(30,58,95,0.055)',
          filter: 'blur(80px)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[15%] left-[6%] w-[280px] h-[280px] rounded-full landing-blob-2"
        style={{
          background: 'rgba(56,121,217,0.04)',
          filter: 'blur(70px)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-[55%] right-[20%] w-[200px] h-[200px] rounded-full landing-blob-3"
        style={{
          background: 'rgba(30,58,95,0.035)',
          filter: 'blur(60px)',
        }}
      />
    </>
  );
}
