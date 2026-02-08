/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--color-background) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        surfaceHighlight: 'rgb(var(--color-surface-highlight) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        main: 'rgb(var(--color-text-main) / <alpha-value>)',
        muted: 'rgb(var(--color-text-muted) / <alpha-value>)',
        primary: {
          400: '#C084FC',
          500: '#A855F7', // Violeta principal
          600: '#9333EA',
          glow: 'rgba(168, 85, 247, 0.5)' // Para efectos de brillo
        },
        secondary: {
          400: '#34D399',
          500: '#10B981', // Verde neón para dinero
          glow: 'rgba(16, 185, 129, 0.5)'
        },
        accent: {
          pink: '#F472B6',
          purple: '#8B5CF6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px -5px var(--tw-shadow-color)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      }
    },
  },
  plugins: [],
}
