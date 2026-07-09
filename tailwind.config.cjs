/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: [
          "Cormorant Garamond",
          "Times New Roman",
          "Georgia",
          "serif",
        ],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      colors: {
        paper: "var(--paper)",
        elev: "var(--elev)",
        ink: "var(--ink)",
        mute: "var(--mute)",
        rule: "var(--rule)",
        mark: {
          DEFAULT: "var(--mark)",
          soft: "var(--mark-soft)",
        },
        clay: {
          DEFAULT: "var(--clay)",
          soft: "var(--clay-soft)",
        },
        void: {
          DEFAULT: "var(--void)",
          elev: "var(--void-elev)",
        },
      },
      maxWidth: {
        content: "72rem",
      },
      boxShadow: {
        nav: "0 8px 28px rgba(22, 22, 21, 0.08)",
        soft: "var(--shadow-soft)",
      },
    },
  },
  plugins: [],
};
