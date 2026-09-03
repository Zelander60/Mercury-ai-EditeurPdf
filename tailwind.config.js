/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/**/*.{ts,tsx,js,jsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
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
      fontSize: {
        'display': ['64px', { lineHeight: '0.95', letterSpacing: '-0.022em', fontWeight: '600' }],
        'h2': ['32px', { lineHeight: '1.1', letterSpacing: '-0.015em', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'ui-sm': ['13px', { lineHeight: '1.5', letterSpacing: '-0.01em', fontWeight: '500' }],
        'ui-xs': ['11px', { lineHeight: '1.4', letterSpacing: '0.04em', fontWeight: '600' }],
      },
      fontFamily: {
        notion: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        premium: '0 8px 32px rgba(0,0,0,0.12)',
        soft: '0 1px 2px rgba(16,24,40,0.04), 0 4px 12px rgba(16,24,40,0.04)',
        subtle: '0 1px 2px rgba(0,0,0,0.06)',
      },
      maxWidth: {
        notion: '1200px',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
