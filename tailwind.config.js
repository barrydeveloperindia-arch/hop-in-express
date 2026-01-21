
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        surface: {
          void: '#0f172a', // Slate 900 (Professional Dark) - Replacing #020617
          elevated: '#1e293b', // Slate 800 - Replacing #1e293b
        },
        accent: {
          core: '#0d9488', // Teal 600 (Professional Teal) - Replacing #6366f1
          hover: '#0f766e', // Teal 700 - Replacing #4f46e5
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(99, 102, 241, 0.5)',
        'neon': '0 0 10px rgba(99, 102, 241, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
