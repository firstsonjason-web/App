import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "lumo-ink": "#071719",
        "lumo-deep": "#103A3C",
        "lumo-mid": "#0F766E",
        "lumo-teal": "#14B8A6",
        "lumo-gold": "#F59E0B",
        "lumo-cream": "#F7FCFB",
        primary: "#14B8A6",
        secondary: "#14B8A6",
        accent: "#14B8A6",
        background: "#071719",
        surface: "#0C2527",
        "text-primary": "#F7FCFB",
        "text-secondary": "#94A3B8",
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "glow-teal": "0 0 40px rgb(20 184 166 / 0.25)",
        "glow-gold": "0 8px 24px rgb(245 158 11 / 0.35)",
        card: "0 24px 60px rgb(0 0 0 / 0.35)",
      },
      borderRadius: {
        card: "1.25rem",
        pill: "9999px",
      },
    },
  },
  plugins: [],
};
export default config;
