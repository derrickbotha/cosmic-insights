module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        // Primary astrology-themed colors
        "primary": "#4F46E5",          // Cosmic Indigo
        "secondary": "#9333EA",        // Mystic Purple
        
        // Astrology element colors
        cosmic: {
          indigo: "#4F46E5",
          purple: "#9333EA",
          blue: "#3B82F6",
          gold: "#F59E0B",
          white: "#FFFFFF",
        },
        
        // Zodiac element colors
        fire: {
          DEFAULT: "#EF4444",
          light: "#FCA5A5",
          dark: "#B91C1C",
        },
        earth: {
          DEFAULT: "#10B981",
          light: "#6EE7B7",
          dark: "#047857",
        },
        air: {
          DEFAULT: "#06B6D4",
          light: "#67E8F9",
          dark: "#0E7490",
        },
        water: {
          DEFAULT: "#3B82F6",
          light: "#93C5FD",
          dark: "#1E40AF",
        },
        
        // Clean backgrounds (removed heavy gradients)
        "background-light": "#FAFAFA",
        "background-dark": "#111827",
        "foreground-light": "#111827",
        "foreground-dark": "#F9FAFB",
        "subtle-light": "#6B7280",
        "subtle-dark": "#9CA3AF",
        "border-light": "#E5E7EB",
        "border-dark": "#374151",
        
        // Soft accent backgrounds
        "soft-indigo": "#EEF2FF",
        "soft-purple": "#FAF5FF",
        "soft-blue": "#EFF6FF",
        "soft-gold": "#FFFBEB",
      },
      fontFamily: {
        "display": ["Manrope", "sans-serif"],
        "sans": ["Manrope", "system-ui", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "0.75rem",
        "xl": "1rem",
        "2xl": "1.5rem",
        "full": "9999px"
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      boxShadow: {
        "soft": "0 1px 3px rgba(0, 0, 0, 0.08)",
        "soft-lg": "0 4px 6px rgba(0, 0, 0, 0.07)",
        "soft-xl": "0 10px 15px rgba(0, 0, 0, 0.06)",
      },
    },
  },
  plugins: [],
}