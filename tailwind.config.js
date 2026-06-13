/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // HomeVault "Aretè-inspired" palette.
        ink: "#15140E", // near-black, used for all type + thick rules
        bone: "#E7E0D2", // warm neutral canvas (home / global screens)
        terracotta: "#B0562F",
        slate: "#93A1A8",
        olive: "#74764E",
        ochre: "#C58A2C",
        clay: "#9B5A45",
        teal: "#4E6E6A",
      },
      fontFamily: {
        display: ["Archivo", "Helvetica Neue", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
