
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
        // HIGH VISIBILITY LIGHT THEME PAILLETTE
        // We use standard colors but define clear semantic aliases for consistency

        // Surface: Clear separation
        surface: {
          void: '#f1f5f9', // Slate 100 (Page Background - Light Grey)
          elevated: '#ffffff', // White (Cards)
          highlight: '#e2e8f0', // Slate 200 (Hover/Input)
        },

        // Brand: Strong, Professional Indigo
        primary: {
          DEFAULT: '#4f46e5', // Indigo 600
          hover: '#4338ca', // Indigo 700
          light: '#e0e7ff', // Indigo 100
        },

        // Text: High Contrast
        ink: {
          base: '#0f172a', // Slate 900 (Headings/Data)
          muted: '#475569', // Slate 600 (Labels - darker than 400)
          light: '#ffffff', // for buttons/sidebar
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
