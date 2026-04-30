'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { APP_NAME } from '@/lib/constants';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="sticky top-0 z-50 border-b border-white/20 bg-white/85 backdrop-blur-xl shadow-[0_1px_0_0_rgba(0,0,0,0.06)]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/app/upload" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-6 h-6 rounded-md bg-[#1E3A5F] flex items-center justify-center flex-shrink-0 shadow-sm">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-[#1E3A5F] font-bold text-lg tracking-tight">{APP_NAME}</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-gray-500 hover:text-[#1E3A5F] transition-colors"
            >
              Dashboard
            </Link>
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="text-sm text-gray-500 hover:text-red-600 transition-colors disabled:opacity-40"
            >
              {isSigningOut ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
