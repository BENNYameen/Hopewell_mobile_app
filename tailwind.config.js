/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#21B3A7",
          dark: "#1E9FA3",
          light: "#2EC6C9",
        },
        brand: "#22B9C4",
        navy: {
          DEFAULT: "#1A2850",
          dark: "#13233D",
          deeper: "#0F172A",
        },
        teal: {
          DEFAULT: "#21B3A7",
          dark: "#0F6A6A",
          muted: "rgba(33, 179, 167, 0.12)",
        },
        page: "#F3F6FB",
        card: "#FFFFFF",
        cardAlt: "#F7FAFF",
        text: {
          primary: "#0F172A",
          secondary: "#6C7CA6",
          muted: "#8B97B2",
          dark: "#1A2850",
        },
        border: "rgba(40, 92, 153, 0.12)",
        error: {
          DEFAULT: "#C81D2C",
          light: "#E11D2E",
        },
      },
      borderRadius: {
        card: "20px",
        pill: "9999px",
        input: "12px",
        tab: "32px",
      },
      boxShadow: {
        card: "0 8px 12px rgba(11, 42, 94, 0.08)",
        "card-lg": "0 10px 14px rgba(11, 42, 94, 0.08)",
        nav: "0 8px 18px rgba(11, 42, 94, 0.12)",
        wallet: "0 8px 20px rgba(33, 179, 167, 0.35)",
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  presets: [require("nativewind/preset")],
  plugins: [],
};
