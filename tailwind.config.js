/** @type {import('tailwindcss').Config} */
export default {
  content: [
      "./src/**/*.{tsx,jsx,css,scss}"
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
}

