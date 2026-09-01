/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        tea: {
          950: '#123D32',
          900: '#17483B',
          800: '#1F5945',
          700: '#2F6B4F',
          600: '#477A5B',
          500: '#5B8F68',
          100: '#DCE9DF',
          50: '#EEF4EF'
        },
        ivory: '#F6F5EF',
        stoneui: '#E9ECE6',
        graphite: '#202923',
        muted: '#68736C',
        amberui: '#C58A2C',
        critical: '#C34E4E'
      },
      boxShadow: {
        soft: '0 12px 34px rgba(18, 61, 50, 0.08)'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace']
      }
    }
  },
  plugins: []
}
