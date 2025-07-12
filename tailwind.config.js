/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/app/**/*.{js,ts,jsx,tsx}",
      "./src/pages/**/*.{js,ts,jsx,tsx}",
      "./src/components/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
      extend: {
        animation: {
          'gradient-x': 'gradientX 10s ease infinite',
        },
        keyframes: {
          gradientX: {
            '0%, 100%': {
              'background-position': '0% 50%',
            },
            '50%': {
              'background-position': '100% 50%',
            },
          },
        },
        backgroundSize: {
          'size-300': '300% 300%',
        },
      },
    },
    plugins: [],
  }
  