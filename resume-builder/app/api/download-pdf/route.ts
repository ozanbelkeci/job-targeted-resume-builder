export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateResumePdf } from '@/lib/pdf-generator';
import type { Optimization } from '@/types';
import { PDF_DOWNLOAD_FILENAME } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Optimization ID is required' }, { status: 400 });
    }

    const { data: optimization } = await supabase
      .from('optimizations')
      .select('optimized_cv_json, job_title, job_company')
      .eq('id', id)
      .eq('user_id', user.id)
      .single<Pick<Optimization, 'optimized_cv_json' | 'job_title' | 'job_company'>>();

    if (!optimization) {
      return NextResponse.json({ error: 'Optimization not found' }, { status: 404 });
    }

    const pdfBuffer = await generateResumePdf(optimization.optimized_cv_json);

    const filename = optimization.job_title
      ? `resume-${optimization.job_title.toLowerCase().replace(/\s+/g, '-')}.pdf`
      : PDF_DOWNLOAD_FILENAME;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (err) {
    console.error('download-pdf error:', err);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
