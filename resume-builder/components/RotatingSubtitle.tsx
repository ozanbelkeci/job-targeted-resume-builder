'use client';

import { useState, useEffect } from 'react';
import { TextEffect } from '@/components/ui/text-effect';

const MESSAGES = [
  'Upload your CV and paste a job listing — our AI rewrites your resume to match in seconds.',
  'Boost your ATS score with keyword optimization built for real hiring systems.',
  'From resume to offer: AI-powered CV, cover letter, and LinkedIn optimization in one place.',
];

const blurSlideVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.018 },
    },
    exit: {
      transition: { staggerChildren: 0.012, staggerDirection: -1 },
    },
  },
  item: {
    hidden: { opacity: 0, filter: 'blur(6px)', y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      y: -16,
      filter: 'blur(6px)',
      transition: { duration: 0.25 },
    },
  },
};

export function RotatingSubtitle() {
  const [index, setIndex] = useState(0);
  const [trigger, setTrigger] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setTrigger(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % MESSAGES.length);
        setTrigger(true);
      }, 380);
    }, 3800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[3.5rem] flex items-start">
      <TextEffect
        per="word"
        variants={blurSlideVariants}
        trigger={trigger}
        className="text-lg text-gray-500 leading-relaxed max-w-lg"
      >
        {MESSAGES[index]}
      </TextEffect>
    </div>
  );
}
