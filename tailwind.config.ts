import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#0a0e14",
          800: "#0d1117",
          700: "#161b22",
          600: "#1c2230",
          500: "#252d3a",
          400: "#30363d",
          300: "#484f58",
        },
        accent: {
          DEFAULT: "#8957e5",
          glow: "#a371f7",
          dim: "#6e40c9",
        },
          field: {
          DEFAULT: "#2ea043",
          bright: "#3fb950",
          dim: "#238636",
        },
      },
      fontFamily: {
        mono: ["SF Mono", "Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
