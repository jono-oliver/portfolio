/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ["Archivo", "sans-serif"],
        body: ["Poppins", "sans-serif"],
      },
    },
    container: {
      center: true, // Ensure the container is centered
      padding: {
        DEFAULT: "1rem", // Padding for all screens by default (mobile)
        sm: "2rem", // Padding for small devices (min-width: 640px)
        md: "2rem", // Padding for medium devices (min-width: 768px)
        lg: "4rem", // Padding for large devices (min-width: 1024px)
        xl: "5rem", // Padding for extra-large devices (min-width: 1280px)
        "2xl": "6rem", // Padding for 2xl devices (min-width: 1536px)
      },
      screens: {
        sm: "640px", // Small devices (min-width: 640px)
        md: "768px", // Medium devices (min-width: 768px)
        lg: "1024px", // Large devices (min-width: 1024px)
        xl: "1280px", // Extra-large devices (min-width: 1280px)
        "2xl": "1440px", // Maximum width for 2xl devices (min-width: 1536px)
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
  darkMode: "selector",
};
