module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        "primary": "#192ae6",
        "background-light": "#f6f6f8",
        "background-dark": "#111221",
        "foreground-light": "#111827",
        "foreground-dark": "#f9fafb",
        "subtle-light": "#6b7280",
        "subtle-dark": "#9ca3af",
        "border-light": "#e5e7eb",
        "border-dark": "#374151"
      },
      fontFamily: {
        "display": ["Manrope", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
}