import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Précharge dès le HTML les deux graisses de Barlow du premier écran (titre et texte) :
// le titre s'affiche d'emblée dans sa vraie police, sans changer de hauteur ni décaler la vitrine.
const preloadFonts = () => ({
   name: "preload-fonts",
   transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
         const fonts = Object.keys(ctx.bundle ?? {}).filter((file) => /barlow-latin-(400|600)-normal-.*\.woff2$/.test(file));
         return fonts.map((file) => ({
            tag: "link",
            attrs: { rel: "preload", as: "font", type: "font/woff2", href: `/${file}`, crossorigin: "" },
            injectTo: "head",
         }));
      },
   },
});

// https://vite.dev/config/
export default defineConfig(({ isSsrBuild }) => ({
   plugins: [react(), tailwindcss(), preloadFonts()],
   // La génération des pages embarque toutes ses dépendances : les fonctions n'ont rien d'autre à charger.
   ssr: { noExternal: true },
   build: isSsrBuild
      ? {
           copyPublicDir: false,
           rollupOptions: {
              // entry-prerender rend les pages ; content donne le contenu du site au chat et au tableau de bord.
              input: { "entry-prerender": "src/entry-prerender.jsx", content: "src/content/model.js" },
              output: { entryFileNames: "[name].mjs", chunkFileNames: "chunks/[name]-[hash].mjs" },
           },
        }
      : {},
   // En développement, l'API du tableau de bord vient du serveur local (npm run local).
   server: {
      proxy: {
         "/api": "http://localhost:4330",
         "/media": "http://localhost:4330",
         "/.netlify/functions": "http://localhost:4330",
      },
   },
}));
