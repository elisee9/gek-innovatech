// Assemblage d'une page HTML : balises SEO, texte pour les robots et contenu enregistré.
// Partagé par la compilation (scripts/prerender.mjs) et par la fonction qui sert les pages (netlify/functions/site.mjs).

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

// Le contenu enregistré voyage dans la page : le visiteur le voit d'emblée, sans second chargement ni changement à l'écran.
const embed = (saved) =>
   `<script type="application/json" id="contenu-site">${JSON.stringify(saved).replace(/</g, "\\u003c")}</script>`;

export const assemble = (template, { head, body }, saved = null) => {
   const page = template
      .replace(/<title>[\s\S]*?<\/title>/, () => head)
      .replace('<div id="root"></div>', () => `<div id="root"><div data-prerender hidden>${forRobots(body)}</div></div>`);
   return saved ? page.replace("</head>", () => `   ${embed(saved)}\n   </head>`) : page;
};
