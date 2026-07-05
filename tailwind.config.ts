import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#28323B",
        inksoft: "#6B7681",
        line: "#ECEFF2",
        blue: "#37BEEA",
        bluedeep: "#1A97C6",
        bluetint: "#E9F7FD",
        coral: "#FF7E5F",
        sun: "#FFC24B",
      },
      fontFamily: {
        disp: ["'Space Grotesk'", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
