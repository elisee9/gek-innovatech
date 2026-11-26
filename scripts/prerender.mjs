// Après la compilation, écrit un fichier HTML par page, avec son titre, sa description, son image de partage et son texte.
// Sans cela, le serveur renvoie la même page vide partout : WhatsApp, Facebook et les robots qui n'exécutent pas
// le JavaScript ne voient ni titre, ni description, ni contenu.
// Le texte est masqué pour le visiteur (l'application prend sa place au chargement, comme avant) et simplifié :
// balises de structure et liens seulement, pour alourdir le moins possible la page.
// Les mêmes pages sont rangées dans dist-ssr/pages.mjs : la fonction netlify/functions/site.mjs s'en sert de modèle,
// et de secours si le contenu enregistré est illisible.
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import process from "node:process";
import { assemble } from "../netlify/lib/page.mjs";

// Version de production de React : plus rapide, et sans avertissements de développement dans le journal de compilation.
process.env.NODE_ENV = "production";

const DIST = resolve("dist");
const SSR_DIR = resolve("dist-ssr");
// /404 ne correspond à aucune route : il donne la page « introuvable », servie par public/_redirects pour toute adresse inconnue.
const PAGES = ["/", "/about", "/services", "/plans", "/portfolio", "/contact", "/rendez-vous", "/mentions-legales", "/merci", "/paiement-annule", "/notdone", "/notpay", "/404"];

const fileFor = (path) => resolve(DIST, path === "/" ? "index.html" : `${path.slice(1)}.html`);

const shell = readFileSync(resolve(DIST, "index.html"), "utf8");
// Sans JavaScript, le contenu simplifié reste lisible.
const template = shell.replace(
   "</head>",
   "   <noscript><style>div[data-prerender]{display:block!important}</style></noscript>\n   </head>",
);

let failures = 0;
let renderer = null;
try {
   renderer = await import(pathToFileURL(resolve(SSR_DIR, "entry-prerender.mjs")).href);
} catch (error) {
   console.warn("[prerender] rendu indisponible :", error);
   failures += 1;
}

const pages = {};
for (const path of PAGES) {
   // En cas d'échec, la page reçoit le fichier vide habituel : le site reste en ligne et fonctionne, seul le SEO de la page en pâtit.
   pages[path] = template;
   if (renderer) {
      try {
         pages[path] = assemble(template, await renderer.prerender(path));
      } catch (error) {
         console.warn(`[prerender] échec sur ${path} :`, error);
         failures += 1;
      }
   }
   writeFileSync(fileFor(path), pages[path]);
}

// Tableau de bord : une page vide, jamais indexée, que l'application remplit après connexion.
writeFileSync(
   resolve(DIST, "admin.html"),
   shell.replace(
      /<title>[\s\S]*?<\/title>/,
      '<title>Tableau de bord | GEK INNOVATECH</title>\n      <meta name="robots" content="noindex, nofollow" />',
   ),
);

writeFileSync(
   resolve(SSR_DIR, "pages.mjs"),
   `export const template = ${JSON.stringify(template)};\nexport const pages = ${JSON.stringify(pages)};\n`,
);

console.log(failures ? `[prerender] terminé avec ${failures} échec(s)` : "[prerender] pages générées");
// Le processus doit se terminer même si un module garde un minuteur actif.
process.exit(0);
