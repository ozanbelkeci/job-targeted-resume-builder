export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { OptimizedCv, AtsKeywords } from '@/types';

interface UpdateBody {
  optimized_cv_json?: unknown;
  ats_score?: unknown;
  ats_keywords?: unknown;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as UpdateBody;
    const { optimized_cv_json, ats_score, ats_keywords } = body;

    if (!optimized_cv_json || typeof ats_score !== 'number' || !ats_keywords) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { error } = await supabase
      .from('optimizations')
      .update({
        optimized_cv_json: optimized_cv_json as OptimizedCv,
        ats_score: Math.round(ats_score),
        ats_keywords: ats_keywords as AtsKeywords,
      })
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to update optimization:', error);
      return NextResponse.json({ error: 'Failed to save changes' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('update optimization error:', err);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
