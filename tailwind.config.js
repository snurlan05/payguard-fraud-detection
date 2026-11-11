/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 900: '#0b1f3a', 800: '#12294d', 700: '#1b3a66' },
        teal: { DEFAULT: '#0d9488' },
      },
    },
  },
  plugins: [],
}
