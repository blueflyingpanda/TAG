/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary:   "rgb(var(--color-primary)   / <alpha-value>)",
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        error:     "rgb(var(--color-error)     / <alpha-value>)",
        success:   "rgb(var(--color-success)   / <alpha-value>)",
        card:      "rgb(var(--color-card)      / <alpha-value>)",
        text:      "rgb(var(--color-text)      / <alpha-value>)",
      },
      borderRadius: {
        game: "15px",
      },
    },
  },
  plugins: [],
};
