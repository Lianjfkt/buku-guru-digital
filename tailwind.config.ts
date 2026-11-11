import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1", // Indigo
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
        presence: {
          hadir: {
            bg: "rgba(16, 185, 129, 0.15)",
            border: "rgba(16, 185, 129, 0.4)",
            text: "#059669",
            darkText: "#34d399",
          },
          sakit: {
            bg: "rgba(245, 158, 11, 0.15)",
            border: "rgba(245, 158, 11, 0.4)",
            text: "#d97706",
            darkText: "#fbbf24",
          },
          izin: {
            bg: "rgba(14, 165, 233, 0.15)",
            border: "rgba(14, 165, 233, 0.4)",
            text: "#0284c7",
            darkText: "#38bdf8",
          },
          alpa: {
            bg: "rgba(239, 68, 68, 0.15)",
            border: "rgba(239, 68, 68, 0.4)",
            text: "#dc2626",
            darkText: "#f87171",
          },
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      backdropBlur: {
        xs: "2px",
        glass: "16px",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.08)",
        "glass-sm": "0 4px 16px 0 rgba(31, 38, 135, 0.05)",
        "glass-dark": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
    },
  },
  plugins: [],
};

export default config;
