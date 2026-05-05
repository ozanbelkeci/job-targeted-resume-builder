export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { parsePdfBuffer } from '@/lib/pdf-parser';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const nameField = formData.get('name') as string | null;
    const targetRoleTypesField = formData.get('target_role_types') as string | null;
    const experienceLevelField = formData.get('experience_level') as string | null;
    const workArrangementField = formData.get('work_arrangement') as string | null;
    const targetIndustryField = formData.get('target_industry') as string | null;

    let targetRoleTypes: string[] | null = null;
    let workArrangement: string[] | null = null;
    try {
      if (targetRoleTypesField) targetRoleTypes = JSON.parse(targetRoleTypesField) as string[];
      if (workArrangementField) workArrangement = JSON.parse(workArrangementField) as string[];
    } catch {
      // ignore malformed JSON, treat as null
    }

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be smaller than 10 MB' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText: string;
    try {
      extractedText = await parsePdfBuffer(buffer);
    } catch {
      return NextResponse.json(
        {
          error:
            "We couldn't read your PDF. Please make sure it's a text-based PDF, not a scanned image.",
        },
        { status: 422 },
      );
    }

    const resumeName = nameField?.trim() || file.name.replace(/\.pdf$/i, '');

    const { data: resume, error: dbError } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        original_filename: file.name,
        original_text: extractedText,
        name: resumeName,
        target_role_types: targetRoleTypes,
        experience_level: experienceLevelField?.trim() || null,
        work_arrangement: workArrangement,
        target_industry: targetIndustryField?.trim() || null,
      })
      .select('id')
      .single();

    if (dbError) {
      console.error('Failed to save resume:', dbError);
      return NextResponse.json({ error: 'Failed to save resume' }, { status: 500 });
    }

    // Upload PDF to Supabase Storage — best-effort, never blocks the response
    try {
      const admin = createServiceClient();
      const storagePath = `${user.id}/${resume.id}.pdf`;

      const { error: uploadError } = await admin.storage
        .from('resumes')
        .upload(storagePath, buffer, {
          contentType: 'application/pdf',
          upsert: false,
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
      } else {
        await supabase
          .from('resumes')
          .update({ storage_path: storagePath })
          .eq('id', resume.id);
      }
    } catch (storageErr) {
      console.error('Storage upload failed:', storageErr);
    }

    return NextResponse.json({ data: { resumeId: resume.id } });
  } catch (err) {
    console.error('parse-pdf error:', err);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
