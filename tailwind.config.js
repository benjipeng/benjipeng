/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Bricolage Grotesque", "system-ui", "sans-serif"],
        body: ["Literata", "Georgia", "serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      colors: {
        graphite: "#12141A",
        slate: {
          elev: "#1C1F2A",
        },
        chalk: "#E6E1D6",
        mist: "#8B8790",
        rule: "#2E3140",
        oxide: {
          DEFAULT: "#C4784A",
          soft: "rgba(196, 120, 74, 0.2)",
        },
        signal: {
          DEFAULT: "#B8F000",
          soft: "rgba(184, 240, 0, 0.28)",
        },
      },
      maxWidth: {
        content: "72rem",
      },
      boxShadow: {
        nav: "0 8px 32px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [],
};
