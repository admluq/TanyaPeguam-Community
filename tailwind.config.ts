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
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: {
          DEFAULT: '#0d0e17',
          2: '#12131f',
          3: '#171827',
          4: '#1d1e2e',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.07)',
          hover: 'rgba(255,255,255,0.13)',
          gold: 'rgba(212,168,83,0.35)',
        },
        gold: {
          DEFAULT: '#d4a853',
          light: '#e8c07a',
          dim: 'rgba(212,168,83,0.15)',
        },
        text: {
          primary: '#eee8dc',
          secondary: '#9490a0',
          muted: '#5e5a6e',
        },
        lia: {
          DEFAULT: '#6366f1',
          light: '#818cf8',
          dim: 'rgba(99,102,241,0.12)',
          border: 'rgba(99,102,241,0.25)',
        },
        status: {
          available: '#34d399',
          busy: '#fb923c',
        },
      },
      backgroundImage: {
        'hero-glow': 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.12), transparent)',
        'gold-glow': 'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(212,168,83,0.08), transparent)',
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 60%)',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
        'card-hover': '0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,168,83,0.2)',
        'lia': '0 0 40px rgba(99,102,241,0.15)',
        'gold': '0 0 30px rgba(212,168,83,0.12)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'blink': 'blink 1.2s step-end infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
