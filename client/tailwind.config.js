/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // or 'media' based on user preference
  theme: {
    extend: {
      colors: {
        // Dark mode default colors according to UI guidelines
        'wsb-dark-base': '#141414',
        'wsb-dark-panel': '#1e1e1e',
        'wsb-primary': '#3B82F6', // Blue
        'wsb-success': '#10B981', // Green for successful checkouts
        'wsb-error': '#EF4444',   // Red for errors
        'wsb-warning': '#F59E0B', // Amber for warnings
        'wsb-text': {
          DEFAULT: '#F3F4F6', // Light text for dark mode
          secondary: '#9CA3AF', // Secondary text
        },
      },
      spacing: {
        '4pt': '4pt', // 4pt spacing grid per UI guidelines
      },
      fontFamily: {
        sans: ['Inter var', 'sans-serif'],
      },
      gridTemplateColumns: {
        'task-list': 'minmax(150px, 1fr) 2fr 1fr 1fr 100px',
      },
    },
  },
  plugins: [],
}
