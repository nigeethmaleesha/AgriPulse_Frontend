/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        tea: {
          950: '#082C25',
          900: '#0D3B30',
          800: '#145141',
          700: '#1D6A53',
          600: '#2C8065',
          500: '#439678',
          100: '#DDF2E9',
          50: '#EFF9F5'
        },
        ivory: '#F7F9F7',
        stoneui: '#EDF1EE',
        graphite: '#14241F',
        muted: '#66736E',
        amberui: '#B87922',
        critical: '#C44747'
      },
      boxShadow: {
        soft: '0 12px 34px rgba(8, 44, 37, 0.07)',
        card: '0 1px 2px rgba(8, 44, 37, 0.04), 0 10px 28px rgba(8, 44, 37, 0.06)',
        lift: '0 18px 42px rgba(8, 44, 37, 0.12)'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace']
      }
    }
  },
  plugins: []
}
