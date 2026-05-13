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
        blob.style.transform = `translate(${e.clientX - 350}px, ${e.clientY - 350}px)`;
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
      {/* Mouse-following gradient — larger, more visible */}
      <div
        ref={blobRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 w-[600px] h-[600px] rounded-full opacity-0 transition-opacity duration-700"
        style={{
          background:
            'radial-gradient(circle, rgba(30,58,95,0.07) 0%, rgba(56,121,217,0.03) 40%, transparent 68%)',
          filter: 'blur(60px)',
          willChange: 'transform',
          zIndex: 0,
        }}
      />

      {/* Large aurora — top left, most prominent blob */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-[10%] -left-[5%] w-[550px] h-[550px] rounded-full landing-blob-1"
        style={{
          background: 'rgba(30,58,95,0.10)',
          filter: 'blur(90px)',
        }}
      />

      {/* Mid-right blob */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-[8%] right-[4%] w-[420px] h-[420px] rounded-full landing-blob-2"
        style={{
          background: 'rgba(56,121,217,0.08)',
          filter: 'blur(80px)',
        }}
      />

      {/* Bottom-left */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[10%] left-[8%] w-[320px] h-[320px] rounded-full landing-blob-3"
        style={{
          background: 'rgba(30,58,95,0.07)',
          filter: 'blur(70px)',
        }}
      />

      {/* Center accent — sits directly behind the heading area */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-[15%] left-[10%] w-[480px] h-[300px] rounded-full"
        style={{
          background:
            'radial-gradient(ellipse at 40% 50%, rgba(30,58,95,0.09) 0%, rgba(56,121,217,0.04) 50%, transparent 75%)',
          filter: 'blur(40px)',
        }}
      />
    </>
  );
}
