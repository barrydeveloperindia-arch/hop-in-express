
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
        // PERPAL & BLACK THEME
        // 1. Invert White/Black to force Dark Mode
        white: '#09090b', // Zinc 950 (Black background for Cards)
        black: '#fafafa', // Zinc 50 (White text)

        // 2. Map Accents to Purple
        emerald: {
          50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe',
          400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700: '#7e22ce',
          800: '#6b21a8', 900: '#581c87', 950: '#3b0764'
        },
        teal: {
          50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe',
          400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700: '#7e22ce',
          800: '#6b21a8', 900: '#581c87', 950: '#3b0764'
        },
        indigo: {
          50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe',
          400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700: '#7e22ce',
          800: '#6b21a8', 900: '#581c87', 950: '#3b0764'
        },

        // 3. Invert Slate Structure (Light->Dark, Dark->Light) so text works on dark bg
        slate: {
          50: '#09090b', // was light, now black
          100: '#18181b',
          200: '#27272a', // border (dark)
          300: '#3f3f46',
          400: '#52525b',
          500: '#71717a',
          600: '#a1a1aa',
          700: '#d4d4d8',
          800: '#e4e4e7',
          900: '#f4f4f5', // was dark text, now light text
          950: '#ffffff',
        },

        // 4. Custom Surface Map
        surface: {
          void: '#000000', // Deep Black Page BG
          elevated: '#121212', // Card BG
        },
        accent: {
          core: '#9333ea', // Purple
          hover: '#7e22ce',
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(168, 85, 247, 0.5)',
        'neon': '0 0 10px rgba(168, 85, 247, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
