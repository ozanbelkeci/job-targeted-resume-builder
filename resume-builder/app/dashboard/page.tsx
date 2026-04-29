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
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-[#1E3A5F] font-bold text-xl">{APP_NAME}</Link>
          <div className="flex items-center gap-4">
            <Link
              href="/app/upload"
              className="bg-[#1E3A5F] hover:bg-[#162d4a] text-white rounded-lg px-4 py-2 text-sm font-medium"
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
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-right shadow-sm">
            {credits?.is_pro ? (
              <>
                <p className="text-xs text-gray-400">Plan</p>
                <p className="font-semibold text-[#1E3A5F]">Pro — Unlimited</p>
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
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
            <p className="text-gray-400 text-lg mb-2">No optimizations yet</p>
            <p className="text-gray-400 text-sm mb-6">Upload your resume to get started.</p>
            <Link
              href="/app/upload"
              className="bg-[#1E3A5F] hover:bg-[#162d4a] text-white rounded-lg px-6 py-2.5 text-sm font-medium"
            >
              Optimize My Resume
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
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
                  <tr key={opt.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{opt.job_title}</p>
                      {opt.job_company && (
                        <p className="text-sm text-gray-400">{opt.job_company}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-full ${getScoreColor(opt.ats_score)}`}
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
                          className="text-sm text-gray-400 hover:text-gray-600"
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
