'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { APP_NAME, APP_URL } from '@/lib/constants';

type View = 'signin' | 'signup' | 'forgot';

const GOOGLE_ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs text-gray-400 font-medium">or</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get('error');
  const viewParam = searchParams.get('view');

  const [view, setView] = useState<View>(viewParam === 'signup' ? 'signup' : 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    urlError === 'auth_failed' ? 'Authentication failed. Please try again.' : null,
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function resetForm() {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccessMessage(null);
  }

  function switchView(v: View) {
    resetForm();
    setView(v);
  }

  async function handleGoogleLogin() {
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${APP_URL}/auth/callback` },
    });

    if (authError) {
      setError('Google sign in failed. Please try again.');
      setIsLoading(false);
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError('Invalid email or password. Please try again.');
      setIsLoading(false);
      return;
    }

    window.location.href = '/app/upload';
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${APP_URL}/auth/callback` },
    });

    setIsLoading(false);

    if (authError) {
      setError(authError.message ?? 'Sign up failed. Please try again.');
      return;
    }

    setSuccessMessage(
      'Account created! Check your email for a confirmation link before signing in.',
    );
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${APP_URL}/auth/reset-password`,
    });

    setIsLoading(false);

    if (authError) {
      setError('Failed to send reset email. Please check the address and try again.');
      return;
    }

    setSuccessMessage('Password reset link sent! Check your inbox.');
  }

  const subtitles: Record<View, string> = {
    signin: 'Sign in to optimize your resume with AI',
    signup: 'Get 1 free optimization — no credit card needed',
    forgot: 'Enter your email and we\'ll send a reset link',
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden bg-gradient-to-b from-[#F0F4F8] via-white to-white">
      {/* Background mesh */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(at 50% 0%, rgba(30,58,95,0.07) 0%, transparent 60%)' }}
      />
      <div className="absolute inset-0 bg-dot-grid opacity-40 pointer-events-none" />

      <a
        href="/"
        className="relative flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#1E3A5F] mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Home
      </a>

      <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl border border-white/80 p-8 w-full max-w-md shadow-xl glow-ring-navy">
        {/* Top highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-200/50 to-transparent rounded-t-2xl" />

        {/* Logo slot */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#1E3A5F] flex items-center justify-center mb-3 shadow-md shadow-[#1E3A5F]/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <a href="/" className="text-[#1E3A5F] font-bold text-2xl tracking-tight">{APP_NAME}</a>
        </div>
        <p className="text-gray-500 text-sm text-center mb-6">{subtitles[view]}</p>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {successMessage}
          </div>
        )}

        {/* Google button — only for sign-in and sign-up */}
        {view !== 'forgot' && (
          <>
            <Button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg py-5 text-sm font-medium flex items-center justify-center gap-3"
            >
              {isLoading ? <Spinner /> : GOOGLE_ICON}
              Continue with Google
            </Button>
            <Divider />
          </>
        )}

        {/* Sign In form */}
        {view === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-3">
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="rounded-lg"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="rounded-lg"
            />
            <div className="text-right">
              <button
                type="button"
                onClick={() => switchView('forgot')}
                className="text-xs text-[#1E3A5F] hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1E3A5F] hover:bg-[#162d4a] text-white rounded-lg py-5 text-sm font-medium"
            >
              {isLoading ? <Spinner /> : 'Sign In'}
            </Button>
          </form>
        )}

        {/* Sign Up form */}
        {view === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-3">
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="rounded-lg"
            />
            <Input
              type="password"
              placeholder="Password (min. 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="rounded-lg"
            />
            <Input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="rounded-lg"
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1E3A5F] hover:bg-[#162d4a] text-white rounded-lg py-5 text-sm font-medium"
            >
              {isLoading ? <Spinner /> : 'Create Account'}
            </Button>
          </form>
        )}

        {/* Forgot Password form */}
        {view === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-3">
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="rounded-lg"
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1E3A5F] hover:bg-[#162d4a] text-white rounded-lg py-5 text-sm font-medium"
            >
              {isLoading ? <Spinner /> : 'Send Reset Link'}
            </Button>
            <button
              type="button"
              onClick={() => switchView('signin')}
              className="w-full text-center text-sm text-gray-400 hover:text-gray-600 mt-1"
            >
              ← Back to sign in
            </button>
          </form>
        )}

        {/* Toggle sign-in / sign-up */}
        {view !== 'forgot' && (
          <p className="text-center text-sm text-gray-500 mt-6">
            {view === 'signin' ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchView('signup')}
                  className="text-[#1E3A5F] font-medium hover:underline"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchView('signin')}
                  className="text-[#1E3A5F] font-medium hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        )}

        {/* Sign Up — title toggle */}
        {view !== 'forgot' && (
          <p className="text-center text-xs text-gray-400 mt-4">
            By continuing, you agree to our terms and privacy policy.
          </p>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
