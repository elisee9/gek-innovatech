// Sert les pages du site avec le contenu enregistré depuis le tableau de bord. La page est gardée par le CDN jusqu'à la
// prochaine modification : la fonction ne tourne qu'une fois par page et par changement, pas à chaque visite.
import process from "node:process";
import { CACHE_TAG, publicContent, savedContent } from "../lib/content.mjs";
import { assemble } from "../lib/page.mjs";
import { pages, template } from "../../dist-ssr/pages.mjs";

// Version de production de React : plus rapide et sans avertissements de développement.
process.env.NODE_ENV ||= "production";

const reply = (html, cache) =>
   new Response(html, {
      headers: {
         "content-type": "text/html; charset=utf-8",
         // Le navigateur revérifie à chaque visite ; le CDN, lui, garde la page.
         "cache-control": "public, max-age=0, must-revalidate",
         "netlify-cdn-cache-control": cache,
         "netlify-cache-tag": CACHE_TAG,
         // Les paramètres publicitaires (utm, fbclid…) ne créent pas d'autre version de la page.
         "netlify-vary": "query=apercu",
      },
   });

export default async (req) => {
   const path = new URL(req.url).pathname.replace(/\/+$/, "") || "/";
   const original = pages[path] || pages["/404"];
   try {
      const saved = publicContent(await savedContent());
      if (!saved) return reply(original, "public, durable, max-age=86400");
      const { prerender } = await import("../../dist-ssr/entry-prerender.mjs");
      return reply(assemble(template, await prerender(path, saved), saved), "public, durable, max-age=86400");
   } catch (error) {
      // Stockage indisponible ou contenu illisible : la page de la dernière mise en ligne s'affiche, et on réessaie vite.
      console.error(`Page ${path} :`, error);
      return reply(original, "public, max-age=30");
   }
};

const PAGES = ["/about", "/services", "/plans", "/portfolio", "/contact", "/rendez-vous", "/mentions-legales", "/merci", "/paiement-annule"];

export const config = {
   // Avec et sans barre finale : « /about/ » ne doit pas tomber sur l'ancienne page.
   path: ["/", ...PAGES, ...PAGES.map((page) => `${page}/`)],
   method: ["GET", "HEAD"],
};
