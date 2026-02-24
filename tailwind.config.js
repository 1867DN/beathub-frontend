/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1DB954',
        secondary: '#191414',
        accent: '#1ed760',
      },
    },
  },
  plugins: [],
}
