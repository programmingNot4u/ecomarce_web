/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      colors: {
        primary: '#4A4A4A',
        secondary: '#8D8D8D',
        accent: '#A68B5B',
        background: '#FAF9F6',
      }
    },
  },
  plugins: [],
}

