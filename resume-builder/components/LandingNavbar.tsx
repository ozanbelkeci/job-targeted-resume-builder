'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { APP_NAME } from '@/lib/constants';

interface LandingNavbarProps {
  userEmail: string | null;
}

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
];


export function LandingNavbar({ userEmail }: LandingNavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const initials = userEmail ? userEmail[0].toUpperCase() : null;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
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
    <div className="sticky top-0 z-50 flex justify-center w-full pt-4 px-4">
      {/* Pill container */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-white/90 backdrop-blur-xl rounded-full shadow-[0_4px_24px_-4px_rgba(30,58,95,0.14),0_1px_4px_rgba(0,0,0,0.06)] border border-gray-200/70 w-full max-w-3xl relative">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <motion.img
            src="/logo.png"
            alt={APP_NAME}
            className="w-8 h-8 rounded-lg shadow-sm"
            whileHover={{ rotate: 8, scale: 1.05 }}
            transition={{ duration: 0.25 }}
          />
          <span className="text-[#1E3A5F] font-bold text-base tracking-tight">{APP_NAME}</span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link, i) => (
            <motion.a
              key={link.label}
              href={link.href}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-[#1E3A5F] rounded-full hover:bg-[#1E3A5F]/5 transition-colors font-medium"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.07 }}
              whileHover={{ scale: 1.04 }}
            >
              {link.label}
            </motion.a>
          ))}
        </nav>

        {/* Desktop auth area */}
        <motion.div
          className="hidden md:flex items-center gap-2 flex-shrink-0"
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {userEmail ? (
            <>
              <Link
                href="/app/upload"
                className="inline-flex items-center gap-1.5 bg-[#1E3A5F] hover:bg-[#162d4a] text-white rounded-full px-4 py-2 text-sm font-semibold transition-all shadow-sm hover:shadow-md hover:-translate-y-px"
              >
                Go to App
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>

              {/* Avatar dropdown */}
              <div className="relative" ref={avatarRef}>
                <button
                  onClick={() => setAvatarOpen(!avatarOpen)}
                  className="w-8 h-8 rounded-full bg-[#1E3A5F] text-white text-sm font-bold flex items-center justify-center hover:bg-[#162d4a] transition-all hover:ring-2 hover:ring-[#1E3A5F]/30 hover:ring-offset-2"
                >
                  {initials}
                </button>
                <AnimatePresence>
                  {avatarOpen && (
                    <motion.div
                      className="absolute right-0 top-11 w-52 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50"
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.18 }}
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-xs text-gray-400 truncate">{userEmail}</p>
                      </div>
                      <div className="p-1">
                        <Link
                          href="/dashboard"
                          onClick={() => setAvatarOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                        >
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                          </svg>
                          Dashboard
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#1E3A5F] transition-colors rounded-full hover:bg-[#1E3A5F]/5"
              >
                Sign In
              </Link>
              <Link
                href="/login?view=signup"
                className="inline-flex items-center bg-[#1E3A5F] hover:bg-[#162d4a] text-white rounded-full px-4 py-2 text-sm font-semibold transition-all shadow-sm hover:shadow-md hover:-translate-y-px"
              >
                Get Started Free
              </Link>
            </>
          )}
        </motion.div>

        {/* Mobile hamburger */}
        <motion.button
          className="md:hidden flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          whileTap={{ scale: 0.9 }}
        >
          <Menu className="h-5 w-5 text-gray-700" />
        </motion.button>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 bg-white z-50 pt-24 px-8 md:hidden"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          >
            {/* Close button */}
            <motion.button
              className="absolute top-5 right-6 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              onClick={() => setMobileOpen(false)}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <X className="h-5 w-5 text-gray-700" />
            </motion.button>

            {/* Logo in overlay */}
            <div className="absolute top-4 left-6 flex items-center gap-2">
              <img src="/logo.png" alt={APP_NAME} className="w-8 h-8 rounded-lg shadow-sm" />
              <span className="text-[#1E3A5F] font-bold text-base">{APP_NAME}</span>
            </div>

            <div className="flex flex-col space-y-2">
              {NAV_LINKS.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  className="text-base text-gray-700 font-medium py-3 border-b border-gray-100 hover:text-[#1E3A5F] transition-colors"
                  onClick={() => setMobileOpen(false)}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.08 + 0.1 }}
                >
                  {link.label}
                </motion.a>
              ))}

              <motion.div
                className="pt-6 flex flex-col gap-3"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ delay: 0.4 }}
              >
                {userEmail ? (
                  <>
                    <Link
                      href="/app/upload"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 w-full bg-[#1E3A5F] hover:bg-[#162d4a] text-white rounded-full px-5 py-3.5 text-base font-semibold transition-all"
                    >
                      Go to App →
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center w-full border border-gray-200 text-gray-700 rounded-full px-5 py-3.5 text-base font-medium hover:bg-gray-50 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => { setMobileOpen(false); handleSignOut(); }}
                      className="flex items-center justify-center w-full text-red-600 py-2 text-sm font-medium"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login?view=signup"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center w-full bg-[#1E3A5F] hover:bg-[#162d4a] text-white rounded-full px-5 py-3.5 text-base font-semibold transition-all"
                    >
                      Get Started Free
                    </Link>
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center w-full border border-gray-200 text-gray-700 rounded-full px-5 py-3.5 text-base font-medium hover:bg-gray-50 transition-colors"
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
