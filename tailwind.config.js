/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'fcnb-blue': '#04519c',
        'fcnb-yellow': '#fbe471',
      },
    },
  },
  plugins: [],
}
