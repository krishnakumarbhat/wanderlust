/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        earth: {
          bg: '#0f1715',
          surface: '#1c2b29',
          card: '#243432',
          overlay: 'rgba(15, 23, 21, 0.85)',
        },
        brand: {
          orange: '#e8652b',
          'orange-hover': '#d55620',
          sage: '#6b8c7b',
          sand: '#d4a373',
        },
        txt: {
          primary: '#f0f4f3',
          secondary: '#8ca3a0',
          muted: '#5c706d',
          inverse: '#0f1715',
        },
      },
      fontFamily: {
        heading: ['"Barlow Condensed"', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
