export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateCoverLetter } from '@/lib/gemini';
import type { OptimizedCv } from '@/types';

interface CoverLetterRequestBody {
  optimizationId?: unknown;
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

    const { data: credits } = await supabase
      .from('user_credits')
      .select('is_pro')
      .eq('user_id', user.id)
      .single();

    if (!credits?.is_pro) {
      return NextResponse.json({ error: 'upgrade_required' }, { status: 403 });
    }

    const body = (await request.json()) as CoverLetterRequestBody;
    const { optimizationId } = body;

    if (!optimizationId || typeof optimizationId !== 'string') {
      return NextResponse.json({ error: 'optimizationId is required' }, { status: 400 });
    }

    const { data: optimization } = await supabase
      .from('optimizations')
      .select('optimized_cv_json, job_description_raw')
      .eq('id', optimizationId)
      .eq('user_id', user.id)
      .single();

    if (!optimization) {
      return NextResponse.json({ error: 'Optimization not found' }, { status: 404 });
    }

    let coverLetter: string;
    try {
      coverLetter = await generateCoverLetter(
        optimization.optimized_cv_json as OptimizedCv,
        optimization.job_description_raw as string,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Cover letter AI error:', message);
      return NextResponse.json({ error: 'Failed to generate cover letter' }, { status: 502 });
    }

    await supabase
      .from('optimizations')
      .update({ cover_letter: coverLetter })
      .eq('id', optimizationId)
      .eq('user_id', user.id);

    return NextResponse.json({ data: { coverLetter } });
  } catch (err) {
    console.error('cover-letter error:', err);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
