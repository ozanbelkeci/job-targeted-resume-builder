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
    <nav className="sticky top-0 z-50 border-b border-white/20 bg-white/85 backdrop-blur-xl shadow-[0_1px_0_0_rgba(0,0,0,0.06)]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Logo — swap the inner div for your SVG/Image when ready */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-[#1E3A5F] flex items-center justify-center flex-shrink-0 shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="text-[#1E3A5F] font-bold text-xl tracking-tight">{APP_NAME}</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1 flex-1">
          <a href="#features" className="px-3 py-1.5 text-sm text-gray-600 hover:text-[#1E3A5F] rounded-lg hover:bg-gray-50 transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="px-3 py-1.5 text-sm text-gray-600 hover:text-[#1E3A5F] rounded-lg hover:bg-gray-50 transition-colors">
            How It Works
          </a>
          <a href="#pricing" className="px-3 py-1.5 text-sm text-gray-600 hover:text-[#1E3A5F] rounded-lg hover:bg-gray-50 transition-colors">
            Pricing
          </a>
        </div>

        {/* Auth actions */}
        {userEmail ? (
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              href="/app/upload"
              className="bg-[#1E3A5F] hover:bg-[#162d4a] text-white rounded-lg px-4 py-2 text-sm font-semibold transition-all shadow-sm hover:shadow-md hover:-translate-y-px"
            >
              Go to App →
            </Link>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setOpen(!open)}
                className="w-9 h-9 rounded-full bg-[#1E3A5F] text-white text-sm font-bold flex items-center justify-center hover:bg-[#162d4a] transition-all hover:ring-2 hover:ring-[#1E3A5F]/30 hover:ring-offset-2"
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
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#1E3A5F] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login?view=signup"
              className="bg-[#1E3A5F] hover:bg-[#162d4a] text-white rounded-lg px-4 py-2 text-sm font-semibold transition-all shadow-sm hover:shadow-md hover:-translate-y-px"
            >
              Sign Up Free
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
