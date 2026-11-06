// Après la compilation, écrit un fichier HTML par page, avec son titre, sa description, son image de partage et son texte.
// Sans cela, le serveur renvoie la même page vide partout : WhatsApp, Facebook et les robots qui n'exécutent pas
// le JavaScript ne voient ni titre, ni description, ni contenu.
// Le texte est masqué pour le visiteur (l'application prend sa place au chargement, comme avant) et simplifié :
// balises de structure et liens seulement, pour alourdir le moins possible la page.
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import process from "node:process";

// Version de production de React : plus rapide, et sans avertissements de développement dans le journal de compilation.
process.env.NODE_ENV = "production";

const DIST = resolve("dist");
const SSR_DIR = resolve("dist-ssr");
// /404 ne correspond à aucune route : il donne la page « introuvable », servie par public/_redirects pour toute adresse inconnue.
const PAGES = ["/", "/about", "/services", "/plans", "/portfolio", "/contact", "/mentions-legales", "/merci", "/paiement-annule", "/notdone", "/notpay", "/404"];

const DROPPED = new Set(["svg", "canvas", "script", "style", "img", "template"]);
const VOID = new Set(["img", "input", "br", "hr", "link", "meta"]);
const KEPT_ATTRIBUTES = /\s(href|for|id|type|name|placeholder|aria-label)="[^"]*"/g;
const TOKEN = /<!--[\s\S]*?-->|<\/([a-zA-Z][\w-]*)>|<([a-zA-Z][\w-]*)([^>]*?)(\/?)>|[^<]+/g;

// Garde le texte et la structure ; retire les classes, les styles, les icônes et les doublons décoratifs (aria-hidden).
const forRobots = (html) => {
   let out = "";
   let skipping = 0;
   for (const [token, closing, opening, attributes = "", selfClosing] of html.matchAll(TOKEN)) {
      if (token.startsWith("<!--")) continue;
      if (closing) {
         if (skipping) skipping -= 1;
         else if (closing !== "span") out += token;
      } else if (opening) {
         const isVoid = VOID.has(opening) || Boolean(selfClosing);
         if (skipping) {
            if (!isVoid) skipping += 1;
         } else if (DROPPED.has(opening) || /aria-hidden="true"/.test(attributes)) {
            if (!isVoid) skipping = 1;
         } else if (opening !== "span") {
            out += `<${opening}${(attributes.match(KEPT_ATTRIBUTES) || []).join("")}>`;
         }
      } else if (!skipping) {
         out += token;
      }
   }
   return out;
};

const fileFor = (path) => resolve(DIST, path === "/" ? "index.html" : `${path.slice(1)}.html`);

// Sans JavaScript, le contenu simplifié reste lisible.
const template = readFileSync(resolve(DIST, "index.html"), "utf8").replace(
   "</head>",
   "   <noscript><style>div[data-prerender]{display:block!important}</style></noscript>\n   </head>",
);

let failures = 0;
let renderer = null;
try {
   renderer = await import(pathToFileURL(resolve(SSR_DIR, "entry-prerender.js")).href);
} catch (error) {
   console.warn("[prerender] rendu indisponible :", error);
   failures += 1;
}

for (const path of PAGES) {
   // En cas d'échec, la page reçoit le fichier vide habituel : le site reste en ligne et fonctionne, seul le SEO de la page en pâtit.
   let html = template;
   if (renderer) {
      try {
         const { head, body } = await renderer.prerender(path);
         html = template
            .replace(/<title>[\s\S]*?<\/title>/, () => head)
            .replace('<div id="root"></div>', () => `<div id="root"><div data-prerender hidden>${forRobots(body)}</div></div>`);
      } catch (error) {
         console.warn(`[prerender] échec sur ${path} :`, error);
         failures += 1;
      }
   }
   writeFileSync(fileFor(path), html);
}

rmSync(SSR_DIR, { recursive: true, force: true });
console.log(failures ? `[prerender] terminé avec ${failures} échec(s)` : "[prerender] pages générées");
// Le processus doit se terminer même si un module garde un minuteur actif.
process.exit(0);
