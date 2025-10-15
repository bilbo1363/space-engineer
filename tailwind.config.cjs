/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Основные цвета из дизайн-системы
        'deep-blue': '#0A0E2E',
        'dark-purple': '#1a0f2e',
        'bright-cyan': '#00FFFF',
        'bright-orange': '#FF8C00',
        'success-green': '#4CAF50',
        'error-red': '#F44336',
        'warning-yellow': '#FFD700',
      },
      fontFamily: {
        'heading': ['Montserrat', 'sans-serif'],
        'body': ['Inter', 'PT Sans', 'sans-serif'],
        'mono': ['Roboto Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
