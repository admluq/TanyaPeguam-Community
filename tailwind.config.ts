import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Distinctive serif for headings — refined, lawyerly
        display: ['var(--font-display)', 'Georgia', 'serif'],
        // Sans for body — clean, readable
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        // Mono for technical bits
        mono: ['ui-monospace', 'monospace'],
      },
      colors: {
        // Brand palette — refined dark luxury with gold accents
        // Match the artifact aesthetic
        ink: {
          DEFAULT: '#0a0a0c', // background
          50: '#1a1a1f',
          100: '#16161a',
          200: '#121215',
          300: '#0e0e11',
          400: '#0a0a0c',
          500: '#08080a',
        },
        gold: {
          DEFAULT: '#c9a961', // primary accent
          50: '#f5edd5',
          100: '#ead9a8',
          200: '#dec486',
          300: '#d2af65',
          400: '#c9a961',
          500: '#b89548',
          600: '#9a7a35',
          700: '#7c6128',
        },
        cream: {
          DEFAULT: '#f5e6c8',
          muted: '#a89a82',
        },
        // Functional
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",
        'gold-radial': 'radial-gradient(circle at center, rgba(201, 169, 97, 0.15), transparent 70%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'gold-shimmer': 'goldShimmer 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-dot': 'bounceDot 1.2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        goldShimmer: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        bounceDot: {
          '0%, 80%, 100%': { transform: 'scale(0)', opacity: '0' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
