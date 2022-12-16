/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      animation: {
        'blink': 'blinker 1s linear infinite;'
      },
      keyframes: {
        blinker: {
          '50%': { opacity: '0' },
        }
      }
    }
  },
  plugins: [],
}
