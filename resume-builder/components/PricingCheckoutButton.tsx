'use client';

import { useState } from 'react';

type Plan = 'starter' | 'pro' | 'lifetime';

interface PricingCheckoutButtonProps {
  plan: Plan;
  isLoggedIn: boolean;
  className?: string;
  children: React.ReactNode;
}

export function PricingCheckoutButton({ plan, isLoggedIn, className, children }: PricingCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  if (!isLoggedIn) {
    return (
      <a href="/login" className={className}>
        {children}
      </a>
    );
  }

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error('checkout error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={handleClick} disabled={loading} className={className} style={{ opacity: loading ? 0.7 : 1 }}>
      {loading ? 'Loading…' : children}
    </button>
  );
}
