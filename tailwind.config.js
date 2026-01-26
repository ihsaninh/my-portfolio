/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "14px",
    },
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },
    fontFamily: {
      primary: ["outfit", "monospace"],
    },
    extend: {
      colors: {
        primary: "#0a0a0f",
        secondary: "#16161d",
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          hover: "rgb(var(--accent-hover) / <alpha-value>)",
        },
        // Gen-Z 2026 vibrant palette - Emerald based
        neon: {
          emerald: "#10b981",
          teal: "#14b8a6",
          cyan: "#22d3ee",
          blue: "#3b82f6",
          green: "#22c55e",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-mesh":
          "linear-gradient(135deg, #10b981 0%, #22d3ee 50%, #3b82f6 100%)",
        holographic:
          "linear-gradient(135deg, rgba(16,185,129,0.3), rgba(34,211,238,0.3), rgba(59,130,246,0.3), rgba(16,185,129,0.3))",
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 8s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "gradient-x": "gradient-x 3s ease infinite",
        "spin-slow": "spin 8s linear infinite",
        blob: "blob 7s infinite",
        tilt: "tilt 10s infinite linear",
        "rubber-band": "rubberBand 1s",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
        tilt: {
          "0%, 50%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(1deg)" },
          "75%": { transform: "rotate(-1deg)" },
        },
        rubberBand: {
          "0%": { transform: "scale(1)" },
          "30%": { transform: "scale(1.25, 0.75)" },
          "40%": { transform: "scale(0.75, 1.25)" },
          "50%": { transform: "scale(1.15, 0.85)" },
          "65%": { transform: "scale(0.95, 1.05)" },
          "75%": { transform: "scale(1.05, 0.95)" },
          "100%": { transform: "scale(1)" },
        },
      },
      boxShadow: {
        glow: "0 0 20px rgba(16, 185, 129, 0.3)",
        "glow-lg": "0 0 40px rgba(16, 185, 129, 0.4)",
        "glow-teal": "0 0 20px rgba(20, 184, 166, 0.3)",
        "glow-cyan": "0 0 20px rgba(34, 211, 238, 0.3)",
        neon: '0 0 5px theme("colors.neon.emerald"), 0 0 20px theme("colors.neon.emerald")',
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
