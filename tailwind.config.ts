import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#0EA5B7',
          dark: '#0B7F8C',
          light: '#E6F7F9',
          accent: '#FF6A3D',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'kv-wiggle': {
          '0%, 92%, 100%': { transform: 'rotate(0deg) scale(1)' },
          '94%': { transform: 'rotate(-10deg) scale(1.05)' },
          '96%': { transform: 'rotate(10deg) scale(1.05)' },
          '98%': { transform: 'rotate(-6deg) scale(1.05)' },
        },
      },
      animation: {
        'kv-wiggle': 'kv-wiggle 3.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
