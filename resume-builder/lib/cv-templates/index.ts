import type { TemplateId, CvTheme } from '@/types';

export interface TemplateDefinition {
  id: TemplateId;
  label: string;
  description: string;
}

export const TEMPLATES: TemplateDefinition[] = [
  { id: 'classic',      label: 'Classic',      description: 'Traditional, centered header' },
  { id: 'modern',       label: 'Modern',       description: 'Left accent bar, bold titles' },
  { id: 'minimal',      label: 'Minimal',      description: 'Spacious, typographic focus' },
  { id: 'professional', label: 'Professional', description: 'Serif, ATS-optimized, academic' },
];

export const COLOR_PALETTES: Record<TemplateId, string[]> = {
  classic:      ['#1E3A5F', '#7B2D2D', '#1A5C3A', '#4A3060', '#1a1a1a'],
  modern:       ['#1E3A5F', '#C0392B', '#27AE60', '#8E44AD', '#1a1a1a'],
  minimal:      ['#1a1a1a', '#1E3A5F', '#374151', '#5B4A3A', '#7B2D2D'],
  professional: ['#000000', '#1E3A5F', '#6B2737', '#2D5016'],
};

export const DEFAULT_THEME: CvTheme = {
  templateId: 'classic',
  accentColor: '#1E3A5F',
};
