
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
        // HOP-IN EXPRESS BRAND PALETTE (Black/Yellow/White)

        // Surface: Dark "Storefront" Aesthetics
        surface: {
          void: '#0F172A', // Slate 900 (Main Background - Deep Dark Blue/Black)
          elevated: '#1E293B', // Slate 800 (Cards)
          highlight: '#334155', // Slate 700 (Hover)
        },

        // Brand: Vibrant Yellow/Gold
        primary: {
          DEFAULT: '#FBBF24', // Amber 400 (Main Action / Brand Color)
          hover: '#F59E0B', // Amber 500
          light: '#FEF3C7', // Amber 100
        },

        // Text: Light on Dark
        ink: {
          base: '#F8FAFC', // Slate 50 (Headings)
          muted: '#94A3B8', // Slate 400 (Secondary)
          light: '#FFFFFF',
          dark: '#0F172A', // Text on Yellow buttons
        }
      },
      // Stronger Shadows for visibility
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'floating': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
