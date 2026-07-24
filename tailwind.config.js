/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAFAFA",
        surface: "#FFFFFF",
        primary: "#0F172A",
        accent: "#2563EB",
        muted: "#6B7280",
      },
      boxShadow: {
        soft: "0 8px 30px rgb(0, 0, 0, 0.04)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
