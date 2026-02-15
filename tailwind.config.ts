import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-plex-sans)"],
        mono: ["var(--font-jetbrains)"]
      },
      colors: {
        ink: {
          25: "#f8fbff",
          50: "#e7edf6",
          100: "#c8d5e8",
          300: "#7f9bc1",
          400: "#6e88ae",
          700: "#152033",
          800: "#0f1828",
          900: "#090f18"
        },
        neon: {
          300: "#79ffd6",
          400: "#49f4c8",
          500: "#20cca4"
        },
        signal: {
          400: "#5da5ff"
        }
      },
      boxShadow: {
        card: "0 18px 42px -22px rgba(0, 0, 0, 0.72)",
        glow: "0 0 0 1px rgba(73, 244, 200, 0.2), 0 0 30px rgba(73, 244, 200, 0.18)"
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(127,155,193,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(127,155,193,0.12) 1px, transparent 1px)",
        scanline: "linear-gradient(180deg, rgba(9,15,24,0), rgba(9,15,24,0.55))"
      }
    }
  },
  plugins: [typography]
};

export default config;
