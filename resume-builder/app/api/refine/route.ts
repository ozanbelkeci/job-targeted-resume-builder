export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { optimizeResume, serializeOptimizedCvToText } from '@/lib/gemini';
import { checkRateLimit } from '@/lib/rate-limit';
import type { Optimization, OptimizedCv, TipContext } from '@/types';

interface RefineRequestBody {
  optimizationId?: unknown;
  selectedKeywords?: unknown;
  tipContexts?: unknown;
  generalContext?: unknown;
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

    const body = (await request.json()) as RefineRequestBody;
    const { optimizationId, selectedKeywords, tipContexts, generalContext } = body;

    if (!optimizationId || typeof optimizationId !== 'string') {
      return NextResponse.json({ error: 'optimizationId is required' }, { status: 400 });
    }

    const keywords = Array.isArray(selectedKeywords)
      ? (selectedKeywords as unknown[]).filter((k): k is string => typeof k === 'string')
      : [];

    const parsedTipContexts: TipContext[] = Array.isArray(tipContexts)
      ? (tipContexts as unknown[]).filter(
          (tc): tc is TipContext =>
            typeof tc === 'object' &&
            tc !== null &&
            typeof (tc as Record<string, unknown>).tip_index === 'number' &&
            typeof (tc as Record<string, unknown>).tip_text === 'string' &&
            typeof (tc as Record<string, unknown>).user_input === 'string',
        )
      : [];

    const parsedGeneralContext =
      typeof generalContext === 'string' ? generalContext.trim() : '';

    const { data: optimization } = await supabase
      .from('optimizations')
      .select('*')
      .eq('id', optimizationId)
      .eq('user_id', user.id)
      .single<Optimization>();

    if (!optimization) {
      return NextResponse.json({ error: 'Optimization not found' }, { status: 404 });
    }

    const { data: resume } = await supabase
      .from('resumes')
      .select('original_text, target_role_types, experience_level, work_arrangement, target_industry')
      .eq('id', optimization.resume_id)
      .eq('user_id', user.id)
      .single();

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    const contextParts: string[] = [];
    if (resume.target_role_types?.length) contextParts.push(`Target role type: ${(resume.target_role_types as string[]).join(', ')}`);
    if (resume.experience_level) contextParts.push(`Experience level: ${resume.experience_level as string}`);
    if (resume.work_arrangement?.length) contextParts.push(`Work arrangement preference: ${(resume.work_arrangement as string[]).join(', ')}`);
    if (resume.target_industry) contextParts.push(`Target industry: ${resume.target_industry as string}`);
    const candidateContext = contextParts.join('\n');

    // Use the currently optimized CV as base so each refinement round builds
    // on previous improvements (prevents keyword oscillation where adding one
    // keyword causes a previously matched keyword to reappear as missing).
    // Fall back to original text only if optimized_cv_json is not yet present.
    const baseText = optimization.optimized_cv_json
      ? serializeOptimizedCvToText(optimization.optimized_cv_json as OptimizedCv)
      : (resume.original_text as string);

    let aiResult;
    try {
      aiResult = await optimizeResume(
        baseText,
        optimization.job_description_raw,
        keywords,
        parsedTipContexts,
        parsedGeneralContext,
        candidateContext,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Refine AI error:', message);
      return NextResponse.json({ error: 'Failed to regenerate resume' }, { status: 502 });
    }

    const { data: updated, error: updateError } = await supabase
      .from('optimizations')
      .update({
        optimized_cv_json: aiResult.optimized_cv,
        ats_score: aiResult.ats_score,
        ats_keywords: {
          matched: aiResult.matched_keywords ?? [],
          missing: aiResult.missing_keywords ?? [],
        },
        tips: aiResult.tips ?? [],
        regeneration_count: (optimization.regeneration_count ?? 0) + 1,
      })
      .eq('id', optimizationId)
      .eq('user_id', user.id)
      .select('*')
      .single<Optimization>();

    if (updateError || !updated) {
      console.error('Failed to update optimization:', updateError);
      return NextResponse.json({ error: 'Failed to save refined results' }, { status: 500 });
    }

    return NextResponse.json({ data: { optimization: updated } });
  } catch (err) {
    console.error('refine error:', err);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
