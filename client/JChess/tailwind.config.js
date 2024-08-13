/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "background-black": "#161513",
        "light-grey": "#262422",
        "lighter-grey": "#302e2c",
        "text-white": "#adadad",
        "orange": "#D64F00",
      },
      fontFamily: {
        "Noto Sans": ["Noto Sans"]
      }
    },

  },
  plugins: [],
}

