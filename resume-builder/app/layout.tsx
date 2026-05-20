import type { Metadata } from 'next';
import { Inter, Lora } from 'next/font/google';
import './globals.css';
import { APP_NAME } from '@/lib/constants';

const inter = Inter({ subsets: ['latin'] });
const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-lora',
  display: 'swap',
});

export const metadata: Metadata = {
  title: `${APP_NAME} — AI-Powered Resume Optimizer`,
  description:
    'Upload your resume, paste a job listing, and get an ATS-optimized CV in seconds.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${lora.variable} bg-[#F8FAFC] text-gray-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}
