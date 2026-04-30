import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      animation: {
        'fade-up':    'fade-up 0.6s ease-out forwards',
        'fade-up-d1': 'fade-up 0.6s 0.1s ease-out both',
        'fade-up-d2': 'fade-up 0.6s 0.2s ease-out both',
        'fade-up-d3': 'fade-up 0.6s 0.35s ease-out both',
        'fade-up-d4': 'fade-up 0.6s 0.5s ease-out both',
        'fade-in':    'fade-in 0.4s ease-out forwards',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'float':      'float 5s ease-in-out infinite',
        'badge-pop':  'badge-pop 0.5s 0.2s ease-out both',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(30,58,95,0)' },
          '50%': { boxShadow: '0 0 32px 6px rgba(30,58,95,0.22)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'badge-pop': {
          '0%': { opacity: '0', transform: 'scale(0.85) translateY(-4px)' },
          '70%': { transform: 'scale(1.04) translateY(0)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      backgroundImage: {
        'dot-grid': 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};

export default config;
