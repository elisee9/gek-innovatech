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
export default defineConfig({
   plugins: [react(), tailwindcss(), preloadFonts()],
   // La génération des pages (scripts/prerender.mjs) embarque toutes ses dépendances dans un seul fichier.
   ssr: { noExternal: true },
});
