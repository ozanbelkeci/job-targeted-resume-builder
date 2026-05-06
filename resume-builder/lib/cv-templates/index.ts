import type { TemplateId, CvTheme } from '@/types';

export interface TemplateDefinition {
  id: TemplateId;
  label: string;
  description: string;
}

export const TEMPLATES: TemplateDefinition[] = [
  { id: 'classic', label: 'Classic', description: 'Traditional, centered header' },
  { id: 'modern',  label: 'Modern',  description: 'Left accent bar, bold titles' },
  { id: 'minimal', label: 'Minimal', description: 'Spacious, typographic focus' },
];

export const COLOR_PALETTES: Record<TemplateId, string[]> = {
  classic: ['#1E3A5F', '#7B2D2D', '#1A5C3A', '#4A3060'],
  modern:  ['#1E3A5F', '#C0392B', '#27AE60', '#8E44AD'],
  minimal: ['#1a1a1a', '#1E3A5F', '#374151', '#5B4A3A'],
};

export const DEFAULT_THEME: CvTheme = {
  templateId: 'classic',
  accentColor: '#1E3A5F',
};
