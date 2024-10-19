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
        "extra-light-grey": "#BABABA",
        "text-white": "#adadad",
        "orange": "#D64F00",
        "green": "#5d8d25",
        "hover-blue": "#3792e8",
        "selected-blue": "#283947",
        "blue": "#5190FF"
      },
      fontFamily: {
        "Noto Sans": ["Noto Sans"]
      }
    },

  },
  plugins: [],
}

