import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { APP_NAME } from '@/lib/constants';
import { SignOutButton } from '@/components/SignOutButton';
import type { Optimization, UserCredits } from '@/types';

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [{ data: optimizations }, { data: credits }] = await Promise.all([
    supabase
      .from('optimizations')
      .select('id, job_title, job_company, ats_score, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
      .returns<Pick<Optimization, 'id' | 'job_title' | 'job_company' | 'ats_score' | 'created_at'>[]>(),
    supabase
      .from('user_credits')
      .select('credits, is_pro')
      .eq('user_id', user.id)
      .single<Pick<UserCredits, 'credits' | 'is_pro'>>(),
  ]);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function getScoreColor(score: number) {
    if (score < 50) return 'text-red-600 bg-red-50';
    if (score < 75) return 'text-amber-600 bg-amber-50';
    return 'text-green-600 bg-green-50';
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/20 bg-white/85 backdrop-blur-xl shadow-[0_1px_0_0_rgba(0,0,0,0.06)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-[#1E3A5F] flex items-center justify-center flex-shrink-0 shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-[#1E3A5F] font-bold text-xl tracking-tight">{APP_NAME}</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/app/upload"
              className="bg-[#1E3A5F] hover:bg-[#162d4a] text-white rounded-lg px-4 py-2 text-sm font-semibold transition-all shadow-sm hover:shadow-md hover:-translate-y-px"
            >
              + New Optimization
            </Link>
            <SignOutButton />
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#1E3A5F]">Your Optimizations</h1>
            <p className="text-gray-400 text-sm mt-1">History of all your AI-optimized resumes</p>
          </div>

          {/* Credits badge */}
          <div className="relative bg-white border border-gray-200 rounded-xl px-4 py-3 text-right shadow-sm overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-blue-300/60 to-transparent" />
            {credits?.is_pro ? (
              <>
                <p className="text-xs text-gray-400">Plan</p>
                <p className="font-semibold text-[#1E3A5F] flex items-center gap-1.5 justify-end">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  Pro — Unlimited
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
        </div>

        {/* Table */}
        {!optimizations || optimizations.length === 0 ? (
          <div className="relative bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-blue-200/60 to-transparent" />
            <div className="w-16 h-16 rounded-2xl bg-[#1E3A5F]/5 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#1E3A5F]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-700 text-lg font-semibold mb-1">No optimizations yet</p>
            <p className="text-gray-400 text-sm mb-6">Upload your resume and paste a job listing to get started.</p>
            <Link
              href="/app/upload"
              className="inline-flex items-center gap-2 bg-[#1E3A5F] hover:bg-[#162d4a] text-white rounded-lg px-6 py-2.5 text-sm font-semibold shadow-sm transition-all hover:-translate-y-px hover:shadow-md"
            >
              Optimize My Resume →
            </Link>
          </div>
        ) : (
          <div className="relative bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-blue-200/60 to-transparent" />
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-50/80">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    Position
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    ATS Score
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    Date
                  </th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {optimizations.map((opt) => (
                  <tr key={opt.id} className="hover:bg-blue-50/30 transition-colors duration-100">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{opt.job_title}</p>
                      {opt.job_company && (
                        <p className="text-sm text-gray-400">{opt.job_company}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-full border border-current/20 shadow-sm ${getScoreColor(opt.ats_score)}`}
                      >
                        {opt.ats_score}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(opt.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 justify-end">
                        <a
                          href={`/api/download-pdf?id=${opt.id}`}
                          className="text-sm text-[#1E3A5F] hover:underline font-medium"
                        >
                          Download PDF
                        </a>
                        <Link
                          href={`/app/results/${opt.id}`}
                          className="text-sm font-medium text-gray-400 hover:text-[#1E3A5F] transition-colors"
                        >
                          View →
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
