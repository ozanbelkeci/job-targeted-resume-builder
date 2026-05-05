'use client';

import { AppNavbar } from '@/components/AppNavbar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AppNavbar />
      {children}
    </div>
  );
}
