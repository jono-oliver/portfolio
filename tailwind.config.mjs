/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        paper: token("paper"),
        ink: token("ink"),
        muted: token("muted"),
        line: token("line"),
        accent: token("accent"),
        "accent-text": token("accent-text"),
      },
      fontFamily: {
        heading: ["Archivo", "sans-serif"],
        body: ["Poppins", "sans-serif"],
      },
      fontSize: {
        display: [
          "clamp(3.25rem, 13vw, 12rem)",
          { lineHeight: "0.9", letterSpacing: "-0.04em" },
        ],
        "display-md": [
          "clamp(2.25rem, 5vw, 4.5rem)",
          { lineHeight: "1", letterSpacing: "-0.03em" },
        ],
        "display-sm": [
          "clamp(2.5rem, 7vw, 6rem)",
          { lineHeight: "0.95", letterSpacing: "-0.035em" },
        ],
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      maxWidth: {
        measure: "68ch",
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
