import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0b1220",
        panel: "#111a2e",
        edge: "#1e2c4a",
        muted: "#7e8aa3",
        brand: "#5b8cff",
        google: "#4285f4",
        facebook: "#1877f2",
        ghl: "#f59e0b",
        website: "#10b981",
      },
    },
  },
  plugins: [],
};

export default config;
