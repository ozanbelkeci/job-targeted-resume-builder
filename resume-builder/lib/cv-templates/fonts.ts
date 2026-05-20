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

  Font.register({
    family: 'Lora',
    fonts: [
      {
        src: 'https://cdn.jsdelivr.net/npm/@fontsource/lora@5.0.8/files/lora-latin-400-normal.woff',
        fontWeight: 400,
        fontStyle: 'normal',
      },
      {
        src: 'https://cdn.jsdelivr.net/npm/@fontsource/lora@5.0.8/files/lora-latin-400-italic.woff',
        fontWeight: 400,
        fontStyle: 'italic',
      },
      {
        src: 'https://cdn.jsdelivr.net/npm/@fontsource/lora@5.0.8/files/lora-latin-700-normal.woff',
        fontWeight: 700,
        fontStyle: 'normal',
      },
      {
        src: 'https://cdn.jsdelivr.net/npm/@fontsource/lora@5.0.8/files/lora-latin-700-italic.woff',
        fontWeight: 700,
        fontStyle: 'italic',
      },
    ],
  });
}
