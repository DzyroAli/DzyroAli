/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f3f0ff',
          100: '#e9e3ff',
          200: '#d5caff',
          300: '#b8a4ff',
          400: '#9670ff',
          500: '#6B4CE3',
          600: '#5a3bd4',
          700: '#4b2db8',
          800: '#3e2695',
          900: '#332278',
        },
        secondary: {
          50: '#fff4ef',
          100: '#ffe6d5',
          200: '#ffc9aa',
          300: '#ffa474',
          400: '#ff7a3c',
          500: '#FF6B35',
          600: '#e8521a',
          700: '#c33f14',
          800: '#9c3318',
          900: '#7e2d18',
        },
        accent: {
          500: '#00D4FF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
