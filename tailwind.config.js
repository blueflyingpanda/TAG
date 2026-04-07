/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#223164",
        secondary: "#ECACAE",
        error: "#e53d00",
        success: "#21a0a0",
        card: "#fcfff7",
        text: "#222222",
      },
      borderRadius: {
        game: "15px",
      },
    },
  },
  plugins: [],
};
