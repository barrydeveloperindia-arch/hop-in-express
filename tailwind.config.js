
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // Dynamic Theme Palette using CSS Variables
        surface: {
          void: 'rgb(var(--color-surface-void) / <alpha-value>)',
          elevated: 'rgb(var(--color-surface-elevated) / <alpha-value>)',
          highlight: 'rgb(var(--color-surface-highlight) / <alpha-value>)',
        },

        primary: {
          DEFAULT: 'rgb(var(--color-primary-main) / <alpha-value>)',
          hover: 'rgb(var(--color-primary-main) / 0.8)',
          light: 'rgb(var(--color-primary-main) / 0.2)',
        },

        ink: {
          base: 'rgb(var(--color-ink-base) / <alpha-value>)',
          muted: 'rgb(var(--color-ink-muted) / <alpha-value>)',
          light: '#FFFFFF',
          dark: '#0F172A',
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
