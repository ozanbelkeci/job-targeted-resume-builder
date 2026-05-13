'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { APP_NAME } from '@/lib/constants';

const NAV_LINKS = [
  { label: 'New Optimization', href: '/app/upload' },
  { label: 'Dashboard', href: '/dashboard' },
];

interface AppNavbarProps {
  userEmail?: string | null;
}

export function AppNavbar({ userEmail: initialEmail }: AppNavbarProps) {
  const [userEmail, setUserEmail] = useState<string | null>(initialEmail ?? null);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!initialEmail) {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        setUserEmail(data.user?.email ?? null);
      });
    }
  }, [initialEmail]);

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
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  const initials = userEmail ? userEmail[0].toUpperCase() : '?';

  return (
    <div className="sticky top-0 z-50 flex justify-center w-full pt-4 px-4 pb-3 bg-gradient-to-b from-[#F8FAFC] via-[#F8FAFC]/80 to-transparent">
      <div className="flex items-center justify-between px-5 py-2.5 bg-white/90 backdrop-blur-xl rounded-full shadow-[0_4px_24px_-4px_rgba(30,58,95,0.14),0_1px_4px_rgba(0,0,0,0.06)] border border-gray-200/70 w-full max-w-3xl relative">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <motion.div
            className="w-8 h-8 rounded-lg shadow-sm overflow-hidden"
            whileHover={{ rotate: 8, scale: 1.05 }}
            transition={{ duration: 0.25 }}
          >
            <Image src="/logo.png" alt={APP_NAME} width={32} height={32} className="w-full h-full" />
          </motion.div>
          <span className="text-[#1E3A5F] font-bold text-base tracking-tight">{APP_NAME}</span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link, i) => (
            <motion.div
              key={link.label}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.07 }}
            >
              <Link
                href={link.href}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-[#1E3A5F] rounded-full hover:bg-[#1E3A5F]/5 transition-colors font-medium"
              >
                {link.label}
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Avatar dropdown */}
        <motion.div
          className="hidden md:flex items-center gap-2 flex-shrink-0"
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="relative" ref={avatarRef}>
            <button
              onClick={() => setAvatarOpen(!avatarOpen)}
              className="w-8 h-8 rounded-full bg-[#1E3A5F] text-white text-sm font-bold flex items-center justify-center hover:bg-[#162d4a] transition-all hover:ring-2 hover:ring-[#1E3A5F]/30 hover:ring-offset-2"
              aria-label="User menu"
            >
              {initials}
            </button>

            <AnimatePresence>
              {avatarOpen && (
                <motion.div
                  className="absolute right-0 top-11 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50"
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                >
                  {userEmail && (
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs text-gray-400 truncate">{userEmail}</p>
                    </div>
                  )}
                  <div className="p-1">
                    <Link
                      href="/app/upload"
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      New Optimization
                    </Link>
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
                      onClick={() => { setAvatarOpen(false); handleSignOut(); }}
                      disabled={isSigningOut}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-40"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      {isSigningOut ? 'Signing out…' : 'Sign Out'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
            <motion.button
              className="absolute top-5 right-6 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100"
              onClick={() => setMobileOpen(false)}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <X className="h-5 w-5 text-gray-700" />
            </motion.button>

            <div className="absolute top-4 left-6 flex items-center gap-2">
              <Image src="/logo.png" alt={APP_NAME} width={32} height={32} className="w-8 h-8 rounded-lg shadow-sm" />
              <span className="text-[#1E3A5F] font-bold text-base">{APP_NAME}</span>
            </div>

            {userEmail && (
              <p className="text-xs text-gray-400 mb-6 truncate">{userEmail}</p>
            )}

            <div className="flex flex-col space-y-2">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.08 + 0.1 }}
                >
                  <Link
                    href={link.href}
                    className="block text-base text-gray-700 font-medium py-3 border-b border-gray-100 hover:text-[#1E3A5F] transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                className="pt-6"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ delay: 0.35 }}
              >
                <button
                  onClick={() => { setMobileOpen(false); handleSignOut(); }}
                  disabled={isSigningOut}
                  className="w-full text-center text-red-600 py-3 text-base font-medium disabled:opacity-40"
                >
                  {isSigningOut ? 'Signing out…' : 'Sign Out'}
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
