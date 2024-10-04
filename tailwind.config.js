/** @type {import('tailwindcss').Config} */
const { nextui } = require("@nextui-org/react");

module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Fredoka', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#F0F7FF',
          100: '#E0EFFF',
          200: '#B8DBFF',
          300: '#8FC7FF',
          400: '#66B3FF',
          500: '#3D9FFF',
          600: '#1A8CFF',
          700: '#0077F2',
          800: '#005FBF',
          900: '#00478C',
        },
        secondary: {
          50: '#F5F7FA',
          100: '#E4E7EB',
          200: '#CBD2D9',
          300: '#9AA5B1',
          400: '#7B8794',
          500: '#616E7C',
          600: '#52606D',
          700: '#3E4C59',
          800: '#323F4B',
          900: '#1F2933',
        },
        accent: {
          50: '#E3F9E5',
          100: '#C1F2C7',
          200: '#91E697',
          300: '#51CA58',
          400: '#31B237',
          500: '#18981D',
          600: '#0C7F13',
          700: '#05660E',
          800: '#024D0B',
          900: '#013309',
        },
        neutral: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
      },
    },
  },
  darkMode: "class",
  plugins: [nextui({
    themes: {
      light: {
        colors: {
          background: "#FFFFFF",
          foreground: "#1F2933",
          primary: {
            foreground: "#FFFFFF",
            DEFAULT: "#3D9FFF",
          },
          secondary: {
            foreground: "#FFFFFF",
            DEFAULT: "#616E7C",
          },
          accent: {
            foreground: "#FFFFFF",
            DEFAULT: "#31B237",
          },
        },
      },
      dark: {
        colors: {
          background: "#0F172A",
          foreground: "#E2E8F0",
          primary: {
            foreground: "#FFFFFF",
            DEFAULT: "#66B3FF",
          },
          secondary: {
            foreground: "#FFFFFF",
            DEFAULT: "#9AA5B1",
          },
          accent: {
            foreground: "#FFFFFF",
            DEFAULT: "#51CA58",
          },
        },
      },
    },
  })],
}

