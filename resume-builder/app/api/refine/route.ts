export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { optimizeResume } from '@/lib/gemini';
import { checkRateLimit } from '@/lib/rate-limit';
import type { Optimization } from '@/types';

interface RefineRequestBody {
  optimizationId?: unknown;
  selectedKeywords?: unknown;
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
    const { optimizationId, selectedKeywords } = body;

    if (!optimizationId || typeof optimizationId !== 'string') {
      return NextResponse.json({ error: 'optimizationId is required' }, { status: 400 });
    }

    const keywords = Array.isArray(selectedKeywords)
      ? (selectedKeywords as unknown[]).filter((k): k is string => typeof k === 'string')
      : [];

    if (keywords.length === 0) {
      return NextResponse.json({ error: 'At least one keyword must be selected' }, { status: 400 });
    }

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
      .select('original_text')
      .eq('id', optimization.resume_id)
      .eq('user_id', user.id)
      .single();

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    // Re-run AI for CV content only (we ignore AI keyword output)
    let aiResult;
    try {
      aiResult = await optimizeResume(
        resume.original_text as string,
        optimization.job_description_raw,
        keywords,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Refine AI error:', message);
      return NextResponse.json({ error: 'Failed to regenerate resume' }, { status: 502 });
    }

    // Preserve existing keyword lists — only move selected keywords from missing to matched
    const existingMatched = optimization.ats_keywords?.matched ?? [];
    const existingMissing = optimization.ats_keywords?.missing ?? [];

    const combined = existingMatched.concat(keywords);
    const newMatched = combined.filter((k, idx) => combined.indexOf(k) === idx);
    const newMissing = existingMissing.filter(
      (k) => !keywords.some((sel) => k.toLowerCase() === sel.toLowerCase()),
    );
    const recalculated = Math.round(
      (newMatched.length / Math.max(newMatched.length + newMissing.length, 1)) * 100,
    );
    // Score never decreases after refinement
    const newScore = Math.max(optimization.ats_score, recalculated);

    const { data: updated, error: updateError } = await supabase
      .from('optimizations')
      .update({
        optimized_cv_json: aiResult.optimized_cv,
        ats_score: newScore,
        ats_keywords: { matched: newMatched, missing: newMissing },
        tips: aiResult.tips ?? [],
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
