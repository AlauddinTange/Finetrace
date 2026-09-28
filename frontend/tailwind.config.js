/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0B0E14',
          card: '#131721',
          elevated: '#1A1F2E',
        },
        border: {
          DEFAULT: '#232838',
        },
        accent: {
          green: '#00E5A0',
          cyan: '#4ADEDE',
          amber: '#F5A623',
          red: '#FF4D6D',
        },
        text: {
          primary: '#E6E9EF',
          secondary: '#8B92A6',
          muted: '#4F5568',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}