/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          coral: "#e57255",
          hover: "#d45f42",
          light: "#fdf2f0",
          border: "#f7d0c8",
        },
        surface: {
          body: "#fafaf9",
          card: "#ffffff",
          subtle: "#f5f5f4",
          border: "#e7e5e4",
        },
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "Poppins", "sans-serif"],
      },
      boxShadow: {
        coral: "0 4px 20px -2px rgba(229, 114, 85, 0.15)",
        "coral-lg": "0 12px 30px -4px rgba(229, 114, 85, 0.25)",
      },
    },
  },
  plugins: [],
};
