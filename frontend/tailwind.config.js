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
          bg: "#F5EFEB",      // Soft, anti-glare ivory
          dark: "#2F4156",    // Deep Navy
          midtone: "#567C8D", // Slate Blue
          accent: "#C8D9E6",   // Soft Blue Gray accent
          card: "#FFFFFF",    // Pure White card layers
          sos: "#D9383A",     // High contrast accessible red
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
