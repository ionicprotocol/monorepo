import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  darkMode: 'class',
  plugins: [require('tailwind-scrollbar-hide')],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))'
      },
      colors: {
        accent: '#3bff89ff',
        darkone: '#0a0a0aff',
        grayUnselect: '#2c2e33ff',
        graylite: '#34363dff',
        grayone: '#212126ff'
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif']
      }
    }
  }
};
export default config;
