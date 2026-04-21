/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef9ff',
          100: '#d9f0ff',
          200: '#bce4ff',
          300: '#8fd4ff',
          400: '#5ab8ff',
          500: '#2f98ff',
          600: '#1b7aef',
          700: '#1a61d1',
          800: '#1d4ea9',
          900: '#1d4385',
        },
        accent: {
          50: '#fff5ed',
          100: '#ffe7d4',
          200: '#ffcca8',
          300: '#ffaa71',
          400: '#ff7d38',
          500: '#ff5c14',
          600: '#f04a0a',
          700: '#c73a0b',
          800: '#9d3012',
          900: '#7e2b12',
        },
      },
      fontFamily: {
        inter: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
