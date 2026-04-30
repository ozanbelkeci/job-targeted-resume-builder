export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: credits, error: fetchError } = await supabase
      .from('user_credits')
      .select('credits, is_pro')
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 });
    }

    if (credits.is_pro) {
      return NextResponse.json({ data: { success: true } });
    }

    if (credits.credits <= 0) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
    }

    const { error: updateError } = await supabase
      .from('user_credits')
      .update({ credits: credits.credits - 1, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Failed to decrement credits:', updateError);
      return NextResponse.json({ error: 'Failed to use credit' }, { status: 500 });
    }

    return NextResponse.json({ data: { success: true, remainingCredits: credits.credits - 1 } });
  } catch (err) {
    console.error('credits/use error:', err);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
