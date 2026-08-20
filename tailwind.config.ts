import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#111111",      // Deep luxury onyx
          black: "#0A0A0A",     // Pure void black
          primary: "#181818",   // Primary button/heading color
          accent: "#C5A880",    // Champagne gold accent
          gold: "#D4AF37",      // Rich gold for badges
          goldLight: "#F5EFE6", // Soft warm gold background
          cream: "#FAF8F5",     // Warm alabaster cream background
          card: "#FFFFFF",      // Clean card surface
          muted: "#737373",     // Neutral muted text
          border: "#E7E5E4",    // Subtle border
          surface: "#F5F5F4",   // Soft grey surface
          whatsapp: "#25D366",  // Official WhatsApp brand green
          whatsappDark: "#1EBE5D",
          danger: "#DC2626",
          success: "#16A34A",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-jakarta)", "Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
      },
      aspectRatio: {
        'fashion': '3 / 4',
      },
      boxShadow: {
        'luxury': '0 10px 30px -10px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        'luxury-hover': '0 20px 40px -15px rgba(0, 0, 0, 0.15)',
        'drawer': '-10px 0 30px rgba(0, 0, 0, 0.12)',
        'glow-gold': '0 0 20px rgba(197, 168, 128, 0.35)',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.03)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 2.5s ease-in-out infinite',
        'fade-in': 'fade-in 0.35s ease-out forwards',
        'slide-up': 'slide-up 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
};
export default config;
