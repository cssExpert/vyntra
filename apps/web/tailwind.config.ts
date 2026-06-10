import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/layouts/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts}",
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
        // Brand palette — backed by CSS variables, updated by applyTheme when
        // the user changes the primary colour in Settings.
        // `brand` and `primary` are aliases of the same palette: bg-brand ===
        // bg-primary and bg-brand-500 === bg-primary-500.
        brand: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50:  "hsl(var(--brand-50))",
          100: "hsl(var(--brand-100))",
          200: "hsl(var(--brand-200))",
          300: "hsl(var(--brand-300))",
          400: "hsl(var(--brand-400))",
          500: "hsl(var(--brand-500))",
          600: "hsl(var(--brand-600))",
          700: "hsl(var(--brand-700))",
          800: "hsl(var(--brand-800))",
          900: "hsl(var(--brand-900))",
          950: "hsl(var(--brand-950))",
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
          50:  "hsl(var(--brand-50))",
          100: "hsl(var(--brand-100))",
          200: "hsl(var(--brand-200))",
          300: "hsl(var(--brand-300))",
          400: "hsl(var(--brand-400))",
          500: "hsl(var(--brand-500))",
          600: "hsl(var(--brand-600))",
          700: "hsl(var(--brand-700))",
          800: "hsl(var(--brand-800))",
          900: "hsl(var(--brand-900))",
          950: "hsl(var(--brand-950))",
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
        "glow-brand": "0 0 24px hsl(var(--primary) / 0.40)",
        "glow-success": "0 0 16px rgba(34,197,94,0.30)",
        "glow-error": "0 0 16px rgba(239,68,68,0.30)",
        "card-hover": "0 12px 40px rgba(0,0,0,0.22)",
      },
      backgroundImage: {
        "gradient-brand":
          "linear-gradient(135deg, hsl(var(--primary-light)) 0%, hsl(var(--primary)) 100%)",
        "gradient-brand-subtle":
          "linear-gradient(135deg, hsl(var(--primary) / 0.15) 0%, hsl(var(--primary) / 0.15) 100%)",
        "gradient-dark": "linear-gradient(180deg, #0f0f0f 0%, #0a0a0a 100%)",
        "gradient-card":
          "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
        "gradient-sidebar": "linear-gradient(180deg, #171717 0%, #141414 100%)",
        "gradient-mesh":
          "radial-gradient(at 40% 20%, hsl(var(--primary) / 0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsl(var(--primary-light) / 0.10) 0px, transparent 50%), radial-gradient(at 0% 50%, hsl(var(--accent) / 0.08) 0px, transparent 50%)",
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
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/container-queries"),
    // Your custom data-active variant merged here cleanly
    plugin(({ addVariant }) => {
      addVariant("data-active", '&[data-active="true"]');
    }),
  ],
};

export default config;
