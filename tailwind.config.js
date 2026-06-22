/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#161B22',
          800: '#1F2530',
          700: '#2B3340',
          600: '#3D4759',
          500: '#5B6577',
          400: '#828DA0',
          300: '#AEB6C4',
          200: '#D2D7E0',
          100: '#E9ECF1',
        },
        fog: {
          50: '#FAFAF8',
          100: '#F1F2F0',
          200: '#E7E9E6',
        },
        copper: {
          DEFAULT: '#C0793D',
          50: '#FBF1E7',
          100: '#F5E1C8',
          400: '#D08F4E',
          500: '#C0793D',
          600: '#A6612C',
        },
        teal: {
          DEFAULT: '#3A7D7A',
          50: '#EAF3F2',
          400: '#4D928E',
          500: '#3A7D7A',
          600: '#2C615F',
        },
        sage: {
          DEFAULT: '#5B8C5A',
          50: '#EEF4ED',
          500: '#5B8C5A',
          600: '#477047',
        },
        rust: {
          DEFAULT: '#B5483D',
          50: '#FBEAE8',
          500: '#B5483D',
          600: '#963830',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(22, 27, 34, 0.04), 0 1px 1px rgba(22, 27, 34, 0.03)',
        panel: '0 4px 16px rgba(22, 27, 34, 0.08)',
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        lg: '10px',
      },
    },
  },
  plugins: [],
}
