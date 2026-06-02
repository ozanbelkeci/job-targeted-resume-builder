import Link from 'next/link';
import Image from 'next/image';
import { APP_NAME, PRICING } from '@/lib/constants';
import { createClient } from '@/lib/supabase/server';
import { LandingNavbar } from '@/components/LandingNavbar';
import { HeroCvStack } from '@/components/HeroCvStack';
import { LandingBackground } from '@/components/LandingBackground';
import { RotatingSubtitle } from '@/components/RotatingSubtitle';
import { AnimatedStats } from '@/components/AnimatedStats';
import { PricingCheckoutButton } from '@/components/PricingCheckoutButton';


export default async function LandingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <LandingNavbar userEmail={user?.email ?? null} />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white px-6 py-24 lg:py-32">
        {/* Layer 1: Interactive mouse-tracking + floating blobs */}
        <LandingBackground />
        {/* Layer 2: Static radial gradient mesh */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(at 20% 40%, rgba(30,58,95,0.07) 0%, transparent 55%), radial-gradient(at 80% 10%, rgba(56,121,217,0.06) 0%, transparent 50%)',
          }}
        />
        {/* Layer 3: Dot grid */}
        <div className="absolute inset-0 bg-dot-grid pointer-events-none opacity-70" />
        {/* Layer 3: Bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white pointer-events-none" />
        {/* Layer 4: Top vignette */}
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-white/80 to-transparent pointer-events-none" />

        <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Copy */}
          <div>
            {/* Animated announcement badge */}
            <div className="animate-badge-pop inline-flex items-center gap-2 bg-white border border-blue-100 text-blue-700 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8 shadow-sm shadow-blue-100/50">
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
              AI-Powered Resume Optimization
            </div>

            <div className="relative mb-6">
              {/* Glow behind heading */}
              <div
                aria-hidden
                className="absolute -inset-x-6 -inset-y-4 pointer-events-none rounded-2xl"
                style={{
                  background: 'radial-gradient(ellipse at 35% 50%, rgba(30,58,95,0.05) 0%, rgba(56,121,217,0.025) 50%, transparent 75%)',
                  filter: 'blur(28px)',
                }}
              />
              {/* Corner brackets — top left */}
              <div aria-hidden className="absolute -top-2 -left-3 w-5 h-5 border-t-[2px] border-l-[2px] border-[#1E3A5F]/25 rounded-tl" />
              {/* Corner brackets — bottom right */}
              <div aria-hidden className="absolute -bottom-2 -right-1 w-5 h-5 border-b-[2px] border-r-[2px] border-[#1E3A5F]/25 rounded-br" />

              <h1 className="animate-fade-up relative text-5xl lg:text-6xl xl:text-7xl font-bold text-[#1E3A5F] leading-[1.08] tracking-tight">
                Get Your Resume
                <br />
                Past the{' '}
                <span className="relative inline-block">
                  <span className="text-gradient-navy">ATS Filter</span>
                  <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-400 via-blue-500 to-[#1E3A5F] rounded-full opacity-70" />
                </span>
              </h1>
            </div>

            <div className="animate-fade-up-d1 mb-10">
              <RotatingSubtitle />
            </div>

            <div className="animate-fade-up-d2 flex flex-wrap gap-3 mb-8">
              <Link
                href={user ? '/app/upload' : '/login'}
                className="inline-flex items-center gap-2 bg-[#1E3A5F] hover:bg-[#1a3458] text-white rounded-xl px-7 py-3.5 text-base font-semibold transition-all shadow-lg shadow-[#1E3A5F]/20 hover:shadow-xl hover:shadow-[#1E3A5F]/30 hover:-translate-y-px"
              >
                {user ? 'Go to App' : 'Get Started Free'}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              {!user && (
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl px-7 py-3.5 text-base font-semibold transition-all hover:bg-white hover:-translate-y-px"
                >
                  See how it works
                </a>
              )}
            </div>

            {/* Social proof */}
            <div className="animate-fade-up-d3 flex items-center gap-5 flex-wrap">
              {[
                '1 free optimization',
                'No credit card required',
                '< 3 min to optimize',
              ].map((text) => (
                <div key={text} className="flex items-center gap-1.5 text-sm text-gray-400">
                  <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* CV Stack preview */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="animate-float">
              <HeroCvStack />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────── */}
      <div className="relative bg-gradient-to-r from-white via-[#F8FAFC] to-white border-y border-gray-100 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-200/50 to-transparent" />
        <AnimatedStats />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-100/40 to-transparent" />
      </div>

      {/* ── Features ──────────────────────────────────────── */}
      <section id="features" className="py-24 px-6 bg-gradient-to-b from-[#F8FAFC] via-white to-[#F8FAFC]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200/80 rounded-full px-3.5 py-1.5 mb-5 uppercase tracking-widest shadow-sm shadow-blue-100/50">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
              Features
            </div>
            <h2 className="text-3xl font-bold text-[#1E3A5F] mb-3">
              Everything You Need to Land the Interview
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              From ATS optimization to cover letters, we cover every step of your job application.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                title: 'ATS Score Analysis',
                desc: "Get a real-time match score showing how well your resume aligns with the job description. See exactly which keywords you're missing.",
                icon: (
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                pro: false,
              },
              {
                title: 'Keyword Optimizer',
                desc: 'Select the missing keywords you actually have experience with and regenerate your resume with those skills naturally woven in.',
                icon: (
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                ),
                pro: false,
              },
              {
                title: 'Cover Letter Generator',
                desc: 'Generate a tailored, professional cover letter that mirrors your optimized resume and speaks directly to the job requirements.',
                icon: (
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                pro: true,
              },
              {
                title: 'LinkedIn Optimizer',
                desc: 'Get tailored headline, About section, and skill suggestions to make your LinkedIn profile as strong as your resume.',
                icon: (
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ),
                pro: true,
              },
            ].map(({ title, desc, icon, pro }) => (
              <div
                key={title}
                className="group relative bg-white border border-gray-200/80 rounded-2xl p-6 flex gap-4 card-hover-lift overflow-hidden"
              >
                {/* Hover gradient fill */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-[#1E3A5F]/0 group-hover:from-blue-50/30 group-hover:to-[#1E3A5F]/5 transition-all duration-300 rounded-2xl pointer-events-none" />
                {/* Top-left accent line */}
                <div className="absolute top-0 left-0 w-16 h-px bg-gradient-to-r from-blue-400/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Icon */}
                <div className="relative w-10 h-10 rounded-xl bg-[#1E3A5F] flex items-center justify-center flex-shrink-0 shadow-md shadow-[#1E3A5F]/20 group-hover:scale-110 transition-transform duration-200">
                  {icon}
                </div>

                <div className="relative flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                    {pro && (
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200/80 rounded-full px-2 py-0.5">
                        Pro
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────── */}
      <section id="how-it-works" className="bg-white py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200/80 rounded-full px-3.5 py-1.5 mb-5 uppercase tracking-widest shadow-sm shadow-blue-100/50">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
              How It Works
            </div>
            <h2 className="text-3xl font-bold text-[#1E3A5F] mb-3">
              From Upload to Interview-Ready in Minutes
            </h2>
            <p className="text-gray-500">No complex setup. Just paste, optimize, and apply.</p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Connecting line — desktop only */}
            <div className="hidden md:block absolute top-7 left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] h-px bg-gradient-to-r from-[#1E3A5F]/30 via-blue-300/60 to-[#1E3A5F]/30" />

            {[
              {
                step: '1',
                title: 'Upload Your Resume',
                desc: 'Upload your existing CV as a PDF. We extract your experience and keep your data private.',
              },
              {
                step: '2',
                title: 'Paste the Job Listing',
                desc: 'Copy the job description from LinkedIn, Indeed, or any job board and paste it in. No URL needed.',
              },
              {
                step: '3',
                title: 'Download & Apply',
                desc: 'Get your rewritten, ATS-optimized resume with a detailed match score — ready in seconds.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center gap-4 relative group">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#2a4f80] to-[#1E3A5F] text-white flex items-center justify-center text-xl font-bold shadow-xl shadow-[#1E3A5F]/25 ring-4 ring-white z-10 group-hover:scale-105 transition-transform duration-200">
                  {step}
                </div>
                <div className="group-hover:bg-white group-hover:shadow-sm transition-all duration-200 rounded-xl px-4 py-2 -mx-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6 bg-gradient-to-b from-white to-[#F8FAFC]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200/80 rounded-full px-3.5 py-1.5 mb-5 uppercase tracking-widest shadow-sm shadow-blue-100/50">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
              Pricing
            </div>
            <h2 className="text-3xl font-bold text-[#1E3A5F] mb-3">Simple, Transparent Pricing</h2>
            <p className="text-gray-500">Start free. Pay only when you need more.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Free */}
            <div className="relative bg-white rounded-2xl border border-gray-200 p-8 text-left card-hover-lift overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gray-300/80 to-transparent" />
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Free</div>
              <div className="text-4xl font-bold text-gray-900 mb-1">$0</div>
              <div className="text-sm text-gray-400 mb-7">forever</div>
              <ul className="space-y-3 text-sm text-gray-600 mb-8">
                {['1 optimization credit', 'ATS score & keywords', 'Inline CV editing', 'Copy as text'].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href={user ? '/app/upload' : '/login?view=signup'}
                className="block w-full text-center border border-[#1E3A5F] text-[#1E3A5F] hover:bg-[#1E3A5F]/5 rounded-xl py-2.5 text-sm font-semibold transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Starter */}
            <div className="relative bg-white rounded-2xl border border-gray-200 p-8 text-left card-hover-lift overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-200/80 to-transparent" />
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Starter</div>
              <div className="text-4xl font-bold text-gray-900 mb-1">{PRICING.STARTER_PRICE}</div>
              <div className="text-sm text-gray-400 mb-7">one-time</div>
              <ul className="space-y-3 text-sm text-gray-600 mb-8">
                {['5 optimization credits', 'ATS score & keywords', 'Inline CV editing', 'PDF download'].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <PricingCheckoutButton
                plan="starter"
                isLoggedIn={!!user}
                className="block w-full text-center bg-[#1E3A5F] hover:bg-[#162d4a] text-white rounded-xl py-2.5 text-sm font-semibold transition-all shadow-sm hover:shadow-md"
              >
                Buy Credits
              </PricingCheckoutButton>
            </div>

            {/* Pro — premium treatment */}
            <div className="relative bg-gradient-to-br from-[#1E3A5F] to-[#162d4a] rounded-2xl p-8 text-left ring-2 ring-[#1E3A5F] shadow-2xl shadow-[#1E3A5F]/30 overflow-hidden animate-pulse-glow">
              {/* Glass reflection layer */}
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.07] to-transparent rounded-t-2xl pointer-events-none" />
              {/* Ambient glow orbs */}
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

              {/* Most Popular badge */}
              <div className="absolute top-5 right-5 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                Most Popular
              </div>

              <div className="text-xs font-semibold text-blue-300 uppercase tracking-widest mb-3">Pro</div>
              <div className="text-4xl font-bold text-white mb-1">{PRICING.PRO_PRICE}</div>
              <div className="text-sm text-blue-200/80 mb-7">per month · cancel anytime</div>

              <ul className="space-y-3 text-sm text-blue-100/90 mb-8">
                {['Unlimited optimizations', 'PDF download', 'Cover Letter Generator', 'LinkedIn Optimizer', 'Full history access'].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <PricingCheckoutButton
                plan="pro"
                isLoggedIn={!!user}
                className="block w-full text-center bg-white hover:bg-blue-50 text-[#1E3A5F] rounded-xl py-2.5 text-sm font-bold transition-all shadow-lg shadow-black/10 hover:-translate-y-px hover:shadow-xl"
              >
                Go Pro
              </PricingCheckoutButton>
            </div>
          </div>

          {/* Lifetime banner */}
          <div className="mt-6 relative bg-white border border-gray-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 overflow-hidden card-hover-lift">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-300/70 to-transparent" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold text-[#1E3A5F]">Lifetime Access</span>
                <span className="text-xs bg-amber-50 border border-amber-200 text-amber-700 rounded-full px-2.5 py-0.5 font-semibold">Best Value</span>
              </div>
              <p className="text-sm text-gray-500">Everything in Pro, forever. One payment — no subscription.</p>
            </div>
            <div className="flex items-center gap-6 flex-shrink-0">
              <div className="text-right">
                <span className="text-3xl font-bold text-[#1E3A5F]">$79</span>
                <span className="text-sm text-gray-400 ml-1">one-time</span>
              </div>
              <PricingCheckoutButton
                plan="lifetime"
                isLoggedIn={!!user}
                className="bg-[#1E3A5F] text-white rounded-xl px-6 py-2.5 text-sm font-semibold whitespace-nowrap hover:bg-[#162d4a] transition-all shadow-sm hover:shadow-md hover:-translate-y-px"
              >
                Get Lifetime →
              </PricingCheckoutButton>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-[#1E3A5F] via-[#1a3458] to-[#162d4a] py-24 px-6 overflow-hidden">
        {/* Mesh gradient overlays */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(at 30% 20%, rgba(56,121,217,0.3) 0%, transparent 50%)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(at 80% 80%, rgba(14,26,46,0.5) 0%, transparent 50%)' }} />
        {/* White dot-grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Top highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
            Ready to Land More Interviews?
          </h2>
          <p className="text-blue-200/80 mb-10 leading-relaxed max-w-lg mx-auto">
            Join thousands of job seekers who have already optimized their resumes.
            Your first optimization is completely free.
          </p>
          <Link
            href={user ? '/app/upload' : '/login?view=signup'}
            className="inline-flex items-center gap-2 bg-white hover:bg-blue-50 text-[#1E3A5F] rounded-xl px-8 py-4 text-base font-bold transition-all shadow-2xl shadow-black/20 hover:-translate-y-px hover:shadow-2xl"
          >
            {user ? 'Go to App' : 'Get Started Free'}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <p className="text-blue-300/70 text-sm mt-5">No credit card required · Cancel anytime</p>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            {/* Logo slot */}
            <div className="flex items-center gap-2.5">
              <Image src="/logo.png" alt={APP_NAME} width={28} height={28} className="w-7 h-7 rounded-md shadow-sm" />
              <span className="text-[#1E3A5F] font-bold text-base">{APP_NAME}</span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a href="#features" className="hover:text-gray-600 transition-colors">Features</a>
              <a href="#pricing" className="hover:text-gray-600 transition-colors">Pricing</a>
              <Link href="/login" className="hover:text-gray-600 transition-colors">Sign In</Link>
              <Link href="/terms" className="hover:text-gray-600 transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy</Link>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-gray-400">© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
            <p className="text-xs text-gray-400">AI-powered resumes tailored to every job.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
