import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#121212',
        surface: '#1e1e1e',
        primary: {
          DEFAULT: '#C6FF00',
          50: '#f0ffcc',
          100: '#e6ff99',
          200: '#d9ff66',
          300: '#ccff33',
          400: '#C6FF00',
          500: '#b3e600',
          600: '#99cc00',
          700: '#7fb300',
          800: '#669900',
          900: '#4c8000',
        },
        text: {
          primary: '#E0E0E0',
          secondary: '#B0B0B0',
          muted: '#808080',
        },
        border: '#333333',
        accent: {
          DEFAULT: '#C6FF00',
          500: '#C6FF00',
          600: '#b3e600',
          700: '#99cc00',
        },
      },
      borderRadius: {
        '2xl': '1rem',
      },
      boxShadow: {
        'soft': '0 1px 2px rgba(16,24,40,0.04), 0 4px 8px rgba(16,24,40,0.06)',
        'glow': '0 0 20px rgba(198, 255, 0, 0.3)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas']
      }
    },
  },
  plugins: [],
}

export default config


