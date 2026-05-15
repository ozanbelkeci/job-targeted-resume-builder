export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: credits, error } = await supabase
      .from('user_credits')
      .select('credits, is_pro, plan, pro_expires_at')
      .eq('user_id', user.id)
      .single();

    if (error) {
      // Row might not exist yet (edge case), create it
      if (error.code === 'PGRST116') {
        const { data: newCredits, error: insertError } = await supabase
          .from('user_credits')
          .insert({ user_id: user.id, credits: 1, is_pro: false })
          .select('credits, is_pro, plan, pro_expires_at')
          .single();

        if (insertError) {
          console.error('Failed to create credits row:', insertError);
          return NextResponse.json({ error: 'Failed to check credits' }, { status: 500 });
        }

        return NextResponse.json({ data: newCredits });
      }

      console.error('Credits check error:', error);
      return NextResponse.json({ error: 'Failed to check credits' }, { status: 500 });
    }

    // Check if pro subscription is expired
    if (credits.is_pro && credits.pro_expires_at) {
      const expired = new Date(credits.pro_expires_at) < new Date();
      if (expired) {
        await supabase
          .from('user_credits')
          .update({ is_pro: false })
          .eq('user_id', user.id);
        credits.is_pro = false;
      }
    }

    return NextResponse.json({ data: credits });
  } catch (err) {
    console.error('credits/check error:', err);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
