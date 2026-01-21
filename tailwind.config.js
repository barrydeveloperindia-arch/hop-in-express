
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
        // PROFESSIONAL DARK THEME (Standard Palette)
        // We do NOT invert Slate/White here to avoid confusion.
        // Instead we use semantic names.

        slate: colors.slate,
        gray: colors.gray,
        zinc: colors.zinc,
        neutral: colors.neutral,
        stone: colors.stone,
        red: colors.red,
        orange: colors.orange,
        amber: colors.amber,
        yellow: colors.yellow,
        lime: colors.lime,
        green: colors.green,
        emerald: colors.emerald,
        teal: colors.teal,
        cyan: colors.cyan,
        sky: colors.sky,
        blue: colors.blue,
        indigo: colors.indigo,
        violet: colors.violet,
        purple: colors.purple,
        fuchsia: colors.fuchsia,
        pink: colors.pink,
        rose: colors.rose,

        surface: {
          void: '#0f172a', // Slate 900 (Page Background)
          elevated: '#1e293b', // Slate 800 (Card Background)
          highlight: '#334155', // Slate 700 (Hover/Input)
        },
        accent: {
          core: '#14b8a6', // Teal 500
          hover: '#0d9488', // Teal 600
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(20, 184, 166, 0.5)', // Teal Glow
        'neon': '0 0 10px rgba(20, 184, 166, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
