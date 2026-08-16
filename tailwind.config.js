/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#07070A",
          900: "#0B0B10",
          850: "#101016",
          800: "#15151D",
          700: "#1E1E28",
          600: "#2A2A38",
          500: "#3D3D4E",
        },
        cream: {
          DEFAULT: "#FFF8E7",
          dim: "#EDE6D3",
          faint: "#B8B29E",
        },
        volt: {
          DEFAULT: "#0047FF",
          bright: "#3B6BFF",
          dim: "#1631A8",
          glow: "#5C86FF",
        },
        yes: "#2FD489",
        no: "#FF5C6C",
      },
      fontFamily: {
        display: ["'Sora'", "sans-serif"],
        body: ["'Manrope'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(0,71,255,0.35)",
        card: "0 1px 0 rgba(255,248,231,0.06) inset, 0 8px 24px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};
