import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        volcano: {
          normal:  '#22c55e',
          waspada: '#eab308',
          siaga:   '#f97316',
          awas:    '#ef4444',
        }
      },
    },
  },
  plugins: [],
};
export default config;
