/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        midnight: {
          900: '#000000',
          800: '#050505',
          700: '#121212',
          600: '#1A1A1A',
        },
        primary: {
          DEFAULT: '#6366F1',
          dark: '#4F46E5',
        },
        gold: {
          DEFAULT: '#D4AF37',
        }
      },
      fontFamily: {
        heading: ['PlayfairDisplay-Bold'],
        body: ['Inter-Regular'],
      }
    },
  },
  plugins: [],
}
