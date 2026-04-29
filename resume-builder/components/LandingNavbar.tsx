'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { APP_NAME } from '@/lib/constants';

interface LandingNavbarProps {
  userEmail: string | null;
}

export function LandingNavbar({ userEmail }: LandingNavbarProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const initials = userEmail ? userEmail[0].toUpperCase() : null;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <span className="text-[#1E3A5F] font-bold text-xl">{APP_NAME}</span>

        {userEmail ? (
          <div className="flex items-center gap-3">
            <Link
              href="/app/upload"
              className="bg-[#1E3A5F] hover:bg-[#162d4a] text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              Go to App →
            </Link>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setOpen(!open)}
                className="w-9 h-9 rounded-full bg-[#1E3A5F] text-white text-sm font-bold flex items-center justify-center hover:bg-[#162d4a] transition-colors"
                aria-label="User menu"
              >
                {initials}
              </button>
              {open && (
                <div className="absolute right-0 top-11 w-52 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-xs text-gray-400 truncate">{userEmail}</p>
                  </div>
                  <div className="p-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#1E3A5F] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login?view=signup"
              className="bg-[#1E3A5F] hover:bg-[#162d4a] text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              Sign Up Free
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
