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
          primary: '#0F111A', // Rich Deep Midnight
          card: '#161923',    // Elevated Card Surface
          elevated: '#1E2230',// Interactive Hover/Element
        },
        border: {
          DEFAULT: '#2A2F42', // Crisp Muted Border
        },
        accent: {
          green: '#10B981',   // Success Emerald
          cyan: '#6366F1',    // Electric Indigo / Violet
          amber: '#F59E0B',   // Warning Amber
          red: '#EF4444',     // Critical Red
        },
        text: {
          primary: '#F3F4F6', // High-contrast White
          secondary: '#9CA3AF',// Muted Gray
          muted: '#6B7280',   // Deep Placeholder Gray
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}