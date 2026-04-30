'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignOut() {
    setIsLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      className="text-sm text-gray-500 hover:text-red-600 transition-colors disabled:opacity-40"
    >
      {isLoading ? 'Signing out...' : 'Sign Out'}
    </button>
  );
}
