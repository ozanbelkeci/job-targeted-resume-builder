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
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/app/upload" className="text-[#1E3A5F] font-bold text-lg">
            {APP_NAME}
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
