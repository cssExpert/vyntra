import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/layouts/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "monospace"],
        display: [
          "var(--font-plus-jakarta)",
          "Plus Jakarta Sans",
          "sans-serif",
        ],
      },
      colors: {
        // Brand
        brand: {
          50: "#eff0ff",
          100: "#d5d8fe",
          200: "#aeb5fd",
          300: "#8995fc",
          400: "#6476fb",
          500: "#3758f9",
          600: "#1546ec",
          700: "#0e36bd",
          800: "#07258a",
          900: "#031456",
          950: "#010b3b",
        },
        // Flamingo
        flamingo: {
          50: "#feedeb",
          100: "#fcd2ce",
          200: "#faa89c",
          300: "#f87d66",
          400: "#eb5729",
          500: "#d14c23",
          600: "#ae3e1c",
          700: "#882f13",
          800: "#611f0a",
          900: "#3a0f04",
          950: "#250702",
        },
        // Sidebar
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-bg))",
          border: "hsl(var(--sidebar-border))",
          text: "hsl(var(--sidebar-text))",
          hover: "hsl(var(--sidebar-hover))",
          active: "hsl(var(--sidebar-active))",
          "active-text": "hsl(var(--sidebar-active-text))",
        },
        // Semantic
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        // Status
        success: {
          DEFAULT: "#22c55e",
          foreground: "#ffffff",
          subtle: "rgba(34,197,94,0.12)",
        },
        warning: {
          DEFAULT: "#f59e0b",
          foreground: "#ffffff",
          subtle: "rgba(245,158,11,0.12)",
        },
        error: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
          subtle: "rgba(239,68,68,0.12)",
        },
        info: {
          DEFAULT: "#06b6d4",
          foreground: "#ffffff",
          subtle: "rgba(6,182,212,0.12)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        glass:
          "0 4px 24px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.08)",
        "glass-md":
          "0 8px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.10)",
        "glass-lg":
          "0 16px 48px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.12)",
        "glow-brand": "0 0 24px rgba(55,88,249,0.40)",
        "glow-success": "0 0 16px rgba(34,197,94,0.30)",
        "glow-error": "0 0 16px rgba(239,68,68,0.30)",
        "card-hover": "0 12px 40px rgba(0,0,0,0.22)",
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #6476fb 0%, #3758f9 100%)",
        "gradient-brand-subtle":
          "linear-gradient(135deg, rgba(55,88,249,0.15) 0%, rgba(21,70,236,0.15) 100%)",
        "gradient-dark": "linear-gradient(180deg, #0f0f0f 0%, #0a0a0a 100%)",
        "gradient-card":
          "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
        "gradient-sidebar": "linear-gradient(180deg, #171717 0%, #141414 100%)",
        "gradient-mesh":
          "radial-gradient(at 40% 20%, rgba(55,88,249,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(100,118,251,0.10) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(6,182,212,0.08) 0px, transparent 50%)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "fade-up": "fadeUp 0.4s ease-out",
        "slide-in-left": "slideInLeft 0.3s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        shimmer: "shimmer 2s linear infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "count-up": "countUp 1s ease-out",
        "spin-slow": "spin 3s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};

export default config;
