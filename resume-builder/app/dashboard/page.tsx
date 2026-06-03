import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { AppNavbar } from '@/components/AppNavbar';
import { DashboardClient } from './DashboardClient';
import { FadeUp } from '@/components/FadeUp';
import { canSaveHistory } from '@/lib/plan-guard';
import type { Optimization, UserCredits } from '@/types';

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: credits } = await supabase
    .from('user_credits')
    .select('credits, is_pro, plan')
    .eq('user_id', user.id)
    .single<Pick<UserCredits, 'credits' | 'is_pro' | 'plan'>>();

  const plan = (credits?.plan ?? 'free') as string;

  const optimizations = canSaveHistory(plan)
    ? (await supabase
        .from('optimizations')
        .select('id, job_title, job_company, ats_score, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)
        .returns<Pick<Optimization, 'id' | 'job_title' | 'job_company' | 'ats_score' | 'created_at'>[]>()
      ).data ?? []
    : [];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AppNavbar userEmail={user.email ?? null} />

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#1E3A5F]">Your Optimizations</h1>
            <p className="text-gray-400 text-sm mt-1">History of all your AI-optimized resumes</p>
          </div>

          {/* Credits badge */}
          <FadeUp delay={0.1}>
          <div className="relative bg-white border border-gray-200 rounded-xl px-4 py-3 text-right shadow-sm overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-blue-300/60 to-transparent" />
            {plan === 'pro' || plan === 'lifetime' ? (
              <>
                <p className="text-xs text-gray-400">Plan</p>
                <p className="font-semibold text-[#1E3A5F] flex items-center gap-1.5 justify-end">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  {plan === 'lifetime' ? 'Lifetime' : 'Pro'} — Unlimited
                </p>
              </>
            ) : (
              <>
                <p className="text-xs text-gray-400">Credits remaining</p>
                <p className="font-semibold text-[#1E3A5F]">
                  {credits?.credits ?? 0} optimization{credits?.credits !== 1 ? 's' : ''}
                </p>
                <Link
                  href="#upgrade"
                  className="text-xs text-blue-600 hover:underline mt-0.5 block"
                >
                  Upgrade →
                </Link>
              </>
            )}
          </div>
          </FadeUp>
        </div>

        {/* Table */}
        <DashboardClient
          optimizations={optimizations}
          isPro={credits?.is_pro ?? false}
          credits={credits?.credits ?? 0}
          plan={plan}
        />
      </div>
    </div>
  );
}
