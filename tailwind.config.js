/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wb: {
          blue: "#1877F2",
          "blue-hover": "#166FE5",
          canvas: "#F0F2F5",
          ink: "#050505",
          muted: "#65676B",
          line: "#E4E6EB",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
} 