/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#21222D",
        secondary: "#2D303D",
        accent: "#CA5818",
        "accent-hover": "#EF1475",
        background: "#14181D",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #21222d 0%, #14181d 100%)",
        "gradient-accent": "linear-gradient(to right, #CA5818, #EF1475)",
      },
    },
  },
  plugins: [],
};
