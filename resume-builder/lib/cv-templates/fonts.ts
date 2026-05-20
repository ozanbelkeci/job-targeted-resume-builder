import { Font } from '@react-pdf/renderer';

export function registerFonts() {
  Font.register({
    family: 'Roboto',
    fonts: [
      {
        src: 'https://cdn.jsdelivr.net/npm/roboto-fontface@0.10.0/fonts/roboto/Roboto-Regular.woff',
        fontWeight: 400,
      },
      {
        src: 'https://cdn.jsdelivr.net/npm/roboto-fontface@0.10.0/fonts/roboto/Roboto-Medium.woff',
        fontWeight: 500,
      },
      {
        src: 'https://cdn.jsdelivr.net/npm/roboto-fontface@0.10.0/fonts/roboto/Roboto-Bold.woff',
        fontWeight: 700,
      },
    ],
  });

  // Full TTF files from Google Fonts GitHub — includes all Unicode ranges (Latin Extended-A, Turkish, etc.)
  Font.register({
    family: 'Lora',
    fonts: [
      {
        src: 'https://cdn.jsdelivr.net/gh/google/fonts/ofl/lora/static/Lora-Regular.ttf',
        fontWeight: 400,
        fontStyle: 'normal',
      },
      {
        src: 'https://cdn.jsdelivr.net/gh/google/fonts/ofl/lora/static/Lora-Italic.ttf',
        fontWeight: 400,
        fontStyle: 'italic',
      },
      {
        src: 'https://cdn.jsdelivr.net/gh/google/fonts/ofl/lora/static/Lora-Bold.ttf',
        fontWeight: 700,
        fontStyle: 'normal',
      },
      {
        src: 'https://cdn.jsdelivr.net/gh/google/fonts/ofl/lora/static/Lora-BoldItalic.ttf',
        fontWeight: 700,
        fontStyle: 'italic',
      },
    ],
  });
}
