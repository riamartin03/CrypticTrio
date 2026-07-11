/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        silver: {
          bg: '#F5EFEB',       // warm light silver-beige
          dark: '#2F4156',     // premium deep slate blue
          midtone: '#567C8D',  // steel blue
          accent: '#C8D9E6',   // soft light blue-gray
          card: '#FFFFFF',     // clean card white
          sos: '#D9534F',      // emergency bright red
        }
      }
    },
  },
  plugins: [],
}
