import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Fredoka', 'Comic Neue', 'cursive', 'sans-serif'],
        display: ['Bangers', 'Fredoka', 'cursive'],
        heading: ['Bangers', 'cursive'],
        body: ['Fredoka', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        vip: {
          DEFAULT: "hsl(var(--vip-gold))",
          glow: "hsl(var(--vip-gold-glow))",
        },
        free: {
          DEFAULT: "hsl(var(--free-blue))",
          glow: "hsl(var(--free-blue-glow))",
        },
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        cartoon: {
          purple: "hsl(var(--cartoon-purple))",
          orange: "hsl(var(--cartoon-orange))",
          pink: "hsl(var(--cartoon-pink))",
          teal: "hsl(var(--cartoon-teal))",
          yellow: "hsl(var(--cartoon-yellow))",
          lime: "hsl(var(--cartoon-lime))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
        xl: "1.5rem",
        "2xl": "2rem",
        "3xl": "2.5rem",
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(15px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(25px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.9)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "bounce-cartoon": {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-20px) scale(1.08)" },
        },
        "wiggle": {
          "0%, 100%": { transform: "rotate(-4deg)" },
          "50%": { transform: "rotate(4deg)" },
        },
        "pop": {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "60%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "slide-up": "slide-up 0.6s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
        "bounce-cartoon": "bounce-cartoon 0.7s ease infinite",
        "wiggle": "wiggle 0.4s ease-in-out infinite",
        "pop": "pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "spin-slow": "spin-slow 8s linear infinite",
      },
      boxShadow: {
        'cartoon': '5px 5px 0px hsl(240, 25%, 10%)',
        'cartoon-lg': '8px 8px 0px hsl(240, 25%, 10%)',
        'cartoon-sm': '3px 3px 0px hsl(240, 25%, 10%)',
        'cartoon-xl': '12px 12px 0px hsl(240, 25%, 10%)',
        'glow-gold': '0 0 40px hsla(45, 95%, 52%, 0.5)',
        'glow-accent': '0 0 40px hsla(200, 95%, 50%, 0.5)',
        'glow-pink': '0 0 40px hsla(340, 90%, 55%, 0.5)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
