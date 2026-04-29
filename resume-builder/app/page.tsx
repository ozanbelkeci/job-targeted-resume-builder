import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { APP_NAME, PRICING } from '@/lib/constants';
import { createClient } from '@/lib/supabase/server';
import { LandingNavbar } from '@/components/LandingNavbar';

export default async function LandingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex flex-col">
      <LandingNavbar userEmail={user?.email ?? null} />

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-6 py-24 text-center">
        <div className="max-w-3xl">
          <div className="inline-block bg-blue-50 text-[#1E3A5F] text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            1 free optimization — no credit card required
          </div>
          <h1 className="text-5xl font-bold text-[#1E3A5F] leading-tight mb-6">
            Get Your Resume Past
            <br />
            the ATS Filter
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
            Upload your CV, paste a job listing, and our AI rewrites your resume to match —
            boosting your ATS score and your chances of getting an interview.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href={user ? '/app/upload' : '/login'}>
              <Button
                size="lg"
                className="bg-[#1E3A5F] hover:bg-[#162d4a] text-white rounded-lg px-10 py-6 text-lg font-semibold"
              >
                {user ? 'Go to App →' : 'Get Started Free →'}
              </Button>
            </Link>
            {!user && (
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#1E3A5F] text-[#1E3A5F] hover:bg-[#1E3A5F]/5 rounded-lg px-8 py-6 text-lg font-semibold"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </div>
          <p className="text-sm text-gray-400 mt-4">No credit card needed. 1 free optimization included.</p>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#1E3A5F] mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                step: '1',
                title: 'Upload Your Resume',
                desc: 'Upload your existing CV as a PDF. We extract your experience and keep it private.',
              },
              {
                step: '2',
                title: 'Paste the Job Listing',
                desc: 'Copy the job description from LinkedIn, Indeed, or any job board and paste it in.',
              },
              {
                step: '3',
                title: 'Download Optimized PDF',
                desc: 'Get your rewritten, ATS-optimized resume with a match score in seconds.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center text-xl font-bold">
                  {step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 bg-[#F8FAFC]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4">Simple Pricing</h2>
          <p className="text-gray-500 mb-12">Start free. Pay only when you need more.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-left">
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Free</div>
              <div className="text-4xl font-bold text-gray-900 mb-1">$0</div>
              <div className="text-sm text-gray-400 mb-6">forever</div>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> 1 optimization credit</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> ATS score analysis</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> PDF download</li>
              </ul>
              <Link href={user ? '/app/upload' : '/login?view=signup'} className="block mt-8">
                <Button variant="outline" className="w-full rounded-lg border-[#1E3A5F] text-[#1E3A5F]">
                  Get Started
                </Button>
              </Link>
            </div>
            {/* Starter */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-left">
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Starter</div>
              <div className="text-4xl font-bold text-gray-900 mb-1">{PRICING.STARTER_PRICE}</div>
              <div className="text-sm text-gray-400 mb-6">one-time</div>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> 5 optimization credits</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> ATS score analysis</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> PDF download</li>
              </ul>
              <Link href={user ? '/app/upload' : '/login'} className="block mt-8">
                <Button className="w-full rounded-lg bg-[#1E3A5F] hover:bg-[#162d4a] text-white">
                  Buy Credits
                </Button>
              </Link>
            </div>
            {/* Pro */}
            <div className="bg-[#1E3A5F] rounded-2xl p-8 text-left relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-white/20 text-white text-xs font-medium px-2 py-1 rounded-full">
                Most Popular
              </div>
              <div className="text-sm font-medium text-blue-200 uppercase tracking-wide mb-2">Pro</div>
              <div className="text-4xl font-bold text-white mb-1">{PRICING.PRO_PRICE}</div>
              <div className="text-sm text-blue-200 mb-6">per month</div>
              <ul className="space-y-3 text-sm text-blue-100">
                <li className="flex items-center gap-2"><span className="text-blue-300">✓</span> Unlimited optimizations</li>
                <li className="flex items-center gap-2"><span className="text-blue-300">✓</span> Cover Letter Generator</li>
                <li className="flex items-center gap-2"><span className="text-blue-300">✓</span> LinkedIn Optimizer</li>
                <li className="flex items-center gap-2"><span className="text-blue-300">✓</span> Full history access</li>
              </ul>
              <Link href={user ? '/app/upload' : '/login'} className="block mt-8">
                <Button className="w-full rounded-lg bg-white text-[#1E3A5F] hover:bg-blue-50">
                  Go Pro
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8 px-6 text-center text-sm text-gray-400">
        <p>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
      </footer>
    </div>
  );
}
