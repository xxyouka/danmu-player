/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1db954',
          hover: '#1ed760'
        },
        bg: {
          primary: '#0a0a0a',
          secondary: 'rgba(255, 255, 255, 0.05)',
          hover: 'rgba(255, 255, 255, 0.1)'
        },
        text: {
          primary: '#ffffff',
          secondary: '#a0a0a0'
        }
      }
    }
  },
  plugins: []
}
