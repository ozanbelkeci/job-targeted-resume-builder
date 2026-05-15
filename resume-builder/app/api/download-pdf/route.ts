export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateResumePdf } from '@/lib/pdf-generator';
import { canDownloadPdf } from '@/lib/plan-guard';
import type { Optimization, TemplateId, CvTheme } from '@/types';

const VALID_TEMPLATES: TemplateId[] = ['classic', 'modern', 'minimal'];

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userCredits } = await supabase
      .from('user_credits')
      .select('is_pro, credits')
      .eq('user_id', user.id)
      .single();

    if (!canDownloadPdf(userCredits?.is_pro ?? false, userCredits?.credits ?? 0)) {
      return NextResponse.json({ error: 'upgrade_required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Optimization ID is required' }, { status: 400 });
    }

    const rawTemplate = searchParams.get('template') ?? 'classic';
    const rawColor    = searchParams.get('color')    ?? '#1E3A5F';

    const safeTemplate: TemplateId = VALID_TEMPLATES.includes(rawTemplate as TemplateId)
      ? (rawTemplate as TemplateId)
      : 'classic';

    const safeColor = /^#[0-9a-fA-F]{6}$/.test(rawColor) ? rawColor : '#1E3A5F';

    const theme: CvTheme = { templateId: safeTemplate, accentColor: safeColor };

    const { data: optimization } = await supabase
      .from('optimizations')
      .select('optimized_cv_json, job_title, job_company')
      .eq('id', id)
      .eq('user_id', user.id)
      .single<Pick<Optimization, 'optimized_cv_json' | 'job_title' | 'job_company'>>();

    if (!optimization) {
      return NextResponse.json({ error: 'Optimization not found' }, { status: 404 });
    }

    const pdfBuffer = await generateResumePdf(optimization.optimized_cv_json, theme);

    const slug = optimization.job_title
      ? optimization.job_title.toLowerCase().replace(/\s+/g, '-')
      : 'resume';

    const filename = `resume-${safeTemplate}-${slug}.pdf`;

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
