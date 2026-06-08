/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#29261b',
          soft: '#6b6554',
          faint: '#b0a98e',
        },
        paper: {
          DEFAULT: '#faf8f4',
          2: '#f0ece3',
          3: '#e6e0d2',
        },
        accent: {
          DEFAULT: '#D97757',
          soft: '#f5e0d6',
          dark: '#b85e40',
        },
        hi: '#f5c842',
        good: '#4caf7d',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        scrawl: ['Caveat', 'cursive'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        wob: '14px 8px 16px 6px / 8px 14px 6px 16px',
        wob2: '10px 18px 8px 14px / 16px 8px 18px 10px',
        wob3: '18px 6px 14px 10px / 6px 16px 10px 14px',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.25s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(16px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
}
