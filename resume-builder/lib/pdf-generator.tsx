import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import type { OptimizedCv, CvTheme } from '@/types';
import { DEFAULT_THEME } from '@/lib/cv-templates';
import { registerFonts } from '@/lib/cv-templates/fonts';
import { ClassicDocument } from '@/lib/cv-templates/classic-document';
import { ModernDocument } from '@/lib/cv-templates/modern-document';
import { MinimalDocument } from '@/lib/cv-templates/minimal-document';
import { ProfessionalDocument } from '@/lib/cv-templates/professional-document';

registerFonts();

export async function generateResumePdf(
  cv: OptimizedCv,
  theme: CvTheme = DEFAULT_THEME,
): Promise<Buffer> {
  const { templateId, accentColor } = theme;

  const document =
    templateId === 'modern'
      ? <ModernDocument cv={cv} accentColor={accentColor} />
      : templateId === 'minimal'
      ? <MinimalDocument cv={cv} accentColor={accentColor} />
      : templateId === 'professional'
      ? <ProfessionalDocument cv={cv} accentColor={accentColor} />
      : <ClassicDocument cv={cv} accentColor={accentColor} />;

  return renderToBuffer(document);
}
