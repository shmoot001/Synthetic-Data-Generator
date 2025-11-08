/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1f3a93',
        accent: '#f39c12'
      }
    }
  },
  plugins: []
};
