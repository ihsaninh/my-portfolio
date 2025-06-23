/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "14px"
    },
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    fontFamily: {
      primary: ["outfit", "monospace"],
    },
    extend: {
      colors: {
        primary: "#1c1c22",
        secondary: "#27272c",
        accent: {
          DEFAULT: "#00FF99",
          hover: "#00E187",
        },
      },
    },
  },
  plugins: [],
};