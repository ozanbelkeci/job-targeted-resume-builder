export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { optimizeResume } from '@/lib/gemini';
import { checkRateLimit } from '@/lib/rate-limit';
import { canSaveHistory, canOptimize, isPro } from '@/lib/plan-guard';

interface OptimizeRequestBody {
  resumeId?: unknown;
  jobDescription?: unknown;
  jobInputType?: unknown;
  jobUrl?: unknown;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { allowed } = checkRateLimit(user.id);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment and try again.' },
        { status: 429 },
      );
    }

    const { data: credits, error: creditsError } = await supabase
      .from('user_credits')
      .select('credits, is_pro, plan')
      .eq('user_id', user.id)
      .single<{ credits: number; is_pro: boolean; plan: string }>();

    if (creditsError || !credits) {
      return NextResponse.json({ error: 'Failed to verify credits' }, { status: 500 });
    }

    const plan = credits.plan ?? 'free';

    if (!canOptimize(plan, credits.credits)) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
    }

    const body = (await request.json()) as OptimizeRequestBody;
    const { resumeId, jobDescription, jobInputType, jobUrl } = body;

    if (!resumeId || typeof resumeId !== 'string') {
      return NextResponse.json({ error: 'resumeId is required' }, { status: 400 });
    }
    if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.length < 50) {
      return NextResponse.json({ error: 'Valid job description is required' }, { status: 400 });
    }
    if (!jobInputType || (jobInputType !== 'url' && jobInputType !== 'text')) {
      return NextResponse.json({ error: 'jobInputType must be url or text' }, { status: 400 });
    }

    // Fetch resume text and candidate context
    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('original_text, target_role_types, experience_level, work_arrangement, target_industry')
      .eq('id', resumeId)
      .eq('user_id', user.id)
      .single();

    if (resumeError || !resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    const contextParts: string[] = [];
    if (resume.target_role_types?.length) contextParts.push(`Target role type: ${(resume.target_role_types as string[]).join(', ')}`);
    if (resume.experience_level) contextParts.push(`Experience level: ${resume.experience_level as string}`);
    if (resume.work_arrangement?.length) contextParts.push(`Work arrangement preference: ${(resume.work_arrangement as string[]).join(', ')}`);
    if (resume.target_industry) contextParts.push(`Target industry: ${resume.target_industry as string}`);
    const candidateContext = contextParts.join('\n');

    // Call AI
    let aiResult;
    try {
      aiResult = await optimizeResume(resume.original_text as string, jobDescription as string, [], [], '', candidateContext);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('AI error:', message);
      return NextResponse.json(
        { error: `AI error: ${message}` },
        { status: 502 },
      );
    }

    const atsScore = Math.round(Number(aiResult.ats_score) || 0);

    // Deduct credit (only if not pro/lifetime)
    if (!isPro(plan)) {
      await supabase
        .from('user_credits')
        .update({ credits: credits.credits - 1, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);
    }

    // Free users: return full result without saving to DB
    if (!canSaveHistory(plan)) {
      return NextResponse.json({
        data: {
          result: {
            job_title: aiResult.job_title,
            job_company: aiResult.job_company && aiResult.job_company !== 'null' ? aiResult.job_company : null,
            optimized_cv_json: aiResult.optimized_cv,
            ats_score: atsScore,
            ats_keywords: {
              matched: aiResult.matched_keywords ?? [],
              missing: aiResult.missing_keywords ?? [],
            },
            tips: aiResult.tips ?? [],
          },
        },
      });
    }

    // Paid users: save to DB and return optimization ID
    const { data: optimization, error: saveError } = await supabase
      .from('optimizations')
      .insert({
        user_id: user.id,
        resume_id: resumeId,
        job_title: aiResult.job_title,
        job_company: aiResult.job_company && aiResult.job_company !== 'null' ? aiResult.job_company : null,
        job_input_type: jobInputType,
        job_url: typeof jobUrl === 'string' ? jobUrl : null,
        job_description_raw: jobDescription,
        optimized_cv_json: aiResult.optimized_cv,
        ats_score: atsScore,
        ats_keywords: {
          matched: aiResult.matched_keywords ?? [],
          missing: aiResult.missing_keywords ?? [],
        },
        tips: aiResult.tips ?? [],
      })
      .select('id')
      .single();

    if (saveError) {
      console.error('Failed to save optimization:', saveError);
      return NextResponse.json({ error: 'Failed to save results' }, { status: 500 });
    }

    return NextResponse.json({ data: { optimizationId: optimization.id } });
  } catch (err) {
    console.error('optimize error:', err);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
