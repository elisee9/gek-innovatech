// tailwind.config.js
export default {
   content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
   theme: {
      extend: {}, // Pas besoin ici, tu utilises @theme
   },
   plugins: [
      require("@tailwindcss/forms"),
      require("@tailwindcss/aspect-ratio"),
      require("@tailwindcss/typography"),
   ],
};
