export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { optimizeResume } from '@/lib/gemini';
import { checkRateLimit } from '@/lib/rate-limit';

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
      .select('credits, is_pro')
      .eq('user_id', user.id)
      .single();

    if (creditsError || !credits) {
      return NextResponse.json({ error: 'Failed to verify credits' }, { status: 500 });
    }

    if (!credits.is_pro && credits.credits <= 0) {
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

    // Fetch resume text
    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('original_text')
      .eq('id', resumeId)
      .eq('user_id', user.id)
      .single();

    if (resumeError || !resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    // Call AI
    let aiResult;
    try {
      aiResult = await optimizeResume(resume.original_text, jobDescription as string);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('AI error:', message);
      return NextResponse.json(
        { error: `AI error: ${message}` },
        { status: 502 },
      );
    }

    const atsScore = Math.round(Number(aiResult.ats_score) || 0);

    // Save optimization to DB
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

    // Deduct credit (only after successful save)
    if (!credits.is_pro) {
      await supabase
        .from('user_credits')
        .update({ credits: credits.credits - 1, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);
    }

    return NextResponse.json({ data: { optimizationId: optimization.id } });
  } catch (err) {
    console.error('optimize error:', err);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
