import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0e14",
        panel: "#12161f",
        "panel-hover": "#171c28",
        wire: "#4a5468",
        mist: "#e7eaf0",
        signal: {
          DEFAULT: "#3ecf8e",
          dim: "#2a8f63",
        },
        alert: {
          DEFAULT: "#f0a93e",
          dim: "#a97429",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  plugins: [typography],
} satisfies Config;
