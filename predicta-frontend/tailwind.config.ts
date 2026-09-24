import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        panel: "var(--panel)",
        panel2: "var(--panel-2)",
        border: "var(--border)",
        text: "var(--text)",
        dim: "var(--text-dim)",
        demand: "var(--accent-demand)",
        supply: "var(--accent-supply)",
        climate: "var(--accent-climate)",
        alert: "var(--accent-alert)",
        good: "var(--accent-good)",
      },
      fontFamily: {
        display: "var(--font-display)",
        body: "var(--font-body)",
        mono: "var(--font-mono)",
      },
      borderRadius: {
        card: "var(--radius)",
      },
    },
  },
  plugins: [],
};
export default config;
