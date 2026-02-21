/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        // ── Light mode calibrated palette (monochrome + 1 Google blue) ──
        void: "#F8F9FA", // Main background (Google page bg)
        surface: "#FFFFFF", // Card / panel
        "surface-raised": "#F1F3F4", // Elevated surface (modal, popover)
        "surface-hover": "#E8EAED", // Table-row / list-item hover
        dim: "#DADCE0", // Borders, dividers (Google divider gray)
        "dim-strong": "#BDC1C6", // Stronger divider
        hi: "#202124", // Text – high emphasis (Google near-black)
        lo: "#5F6368", // Text – medium emphasis (Google gray)
        accent: "#1A73E8", // Google blue — only non-monochrome color
        ok: "#1A73E8", // Positive = accent blue
        err: "#202124", // Destructive = near-black (strict monochrome)
        warn: "#80868B", // Warning = mid-gray
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "6px",
        lg: "8px",
        xl: "12px",
        "2xl": "16px",
      },
    },
  },
  plugins: [],
};
