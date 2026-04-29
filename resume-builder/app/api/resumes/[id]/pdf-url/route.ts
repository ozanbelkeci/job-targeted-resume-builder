export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
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

    const { data: resume } = await supabase
      .from('resumes')
      .select('storage_path')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    if (!resume.storage_path) {
      return NextResponse.json({ data: { url: null } });
    }

    const admin = createServiceClient();
    const { data: signed, error: signError } = await admin.storage
      .from('resumes')
      .createSignedUrl(resume.storage_path as string, 60 * 60); // 1 hour

    if (signError || !signed) {
      console.error('Signed URL error:', signError);
      return NextResponse.json({ data: { url: null } });
    }

    return NextResponse.json({ data: { url: signed.signedUrl } });
  } catch (err) {
    console.error('pdf-url error:', err);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
