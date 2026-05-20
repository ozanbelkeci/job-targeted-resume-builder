import path from 'path';
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

  // Merged Lora fonts (latin + latin-ext) — full Turkish/Latin Extended-A support
  // Self-hosted in public/fonts/ for reliability; merged via opentype.js to include
  // both basic Latin (A-Z, 0-9) and Turkish chars (İ, Ş, ş, Ğ, ğ, etc.)
  const fontsDir = path.join(process.cwd(), 'public', 'fonts');
  Font.register({
    family: 'Lora',
    fonts: [
      {
        src: path.join(fontsDir, 'Lora-Regular-full.woff'),
        fontWeight: 400,
        fontStyle: 'normal',
      },
      {
        src: path.join(fontsDir, 'Lora-Italic-full.woff'),
        fontWeight: 400,
        fontStyle: 'italic',
      },
      {
        src: path.join(fontsDir, 'Lora-Bold-full.woff'),
        fontWeight: 700,
        fontStyle: 'normal',
      },
      {
        src: path.join(fontsDir, 'Lora-BoldItalic-full.woff'),
        fontWeight: 700,
        fontStyle: 'italic',
      },
    ],
  });
}
