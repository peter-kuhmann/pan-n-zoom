/** @type {import('tailwindcss').Config} */
export default {
  content: [
      "./src/**/*.{tsx,jsx,css,scss}"
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [{
      light: {
        // ffc9c9
        "primary": "#ffc9c9",
        "primary-focus": "#efb9b9",
        "primary-content": "#332020",

        "neutral": "#232323",
        "neutral-focus": "#464646",
        "neutral-content": "#ffffff",

        "base-100": "#ffffff",
        "base-200": "#e0e0e0",
        "base-300": "#d0d0d0",
        "base-content": "#232323",

        "secondary": "#f6d860",
        "accent": "#37cdbe",
      },

      dark: {
        // ffc9c9
        "primary": "#ffc9c9",
        "primary-focus": "#efb9b9",
        "primary-content": "#332020",

        "neutral": "#e3e3e3",
        "neutral-focus": "#cecece",
        "neutral-content": "#232323",

        "base-100": "#232323",
        "base-200": "#494949",
        "base-300": "#6c6c6c",
        "base-content": "#e3e3e3",

        "secondary": "#f6d860",
        "accent": "#37cdbe",
      },
    }],
  },
}

