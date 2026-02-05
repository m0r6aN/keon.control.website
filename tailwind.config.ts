import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-rajdhani)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      colors: {
        // Orbital Ballistics Design System
        void: "var(--void)",
        "gun-metal": "var(--gun-metal)",
        tungsten: "var(--tungsten)",
        steel: "var(--steel)",
        flash: "var(--flash)",
        "reactor-blue": "var(--reactor-blue)",
        "reactor-glow": "var(--reactor-glow)",
        "degraded-amber": "var(--degraded-amber)",
        "safety-orange": "var(--safety-orange)",
        "ballistic-red": "var(--ballistic-red)",
      },
      borderRadius: {
        sm: "2px",
        DEFAULT: "4px",
        md: "4px",
        lg: "4px",
      },
      boxShadow: {
        none: "none",
      },
    },
  },
  plugins: [],
};

export default config;

