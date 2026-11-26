// Contenu du site : les valeurs d'origine (code et fichiers de traduction) et celles enregistrées depuis le tableau de bord.
// Le navigateur, la génération des pages et les fonctions (chat, tableau de bord) lisent tous ce même modèle.
import fr from "../i18n/locales/fr/translation.json";
import en from "../i18n/locales/en/translation.json";
import basePlans from "../data/plans";
import baseProjects from "../data/portfolioData";
import baseStats from "../data/stats";
import baseTestimonials from "../data/testimonials";
import { CONTACT as baseContact, SITE } from "../data/contact";
import { formatPrice } from "../utils/formatPrice";

export const LANGS = ["fr", "en"];
const BASE = { fr, en };
const clone = (value) => JSON.parse(JSON.stringify(value));

// Clés des offres, dans l'ordre de data/plans.js : repères de prix dans les textes et liste du formulaire de devis.
export const PLAN_KEYS = ["starter", "pro", "premium"];
// Filtre des réalisations correspondant à chaque offre.
export const PLAN_FILTERS = { starter: "basic", pro: "standard", premium: "premium" };
// Icônes proposées pour un service (voir sections/ServicesSection.jsx).
export const SERVICE_ICONS = ["code", "layout", "phone", "chart", "rocket", "palette", "search", "cloud", "shield", "cart", "mail", "megaphone", "camera", "users", "wrench", "bot"];
const BASE_SERVICE_ICONS = ["code", "layout", "phone", "chart", "rocket", "palette", "search", "cloud", "shield"];

const pair = (read) => Object.fromEntries(LANGS.map((lang) => [lang, read(BASE[lang])]));

// Valeurs d'origine, dans la forme que modifie le tableau de bord (textes français et anglais côte à côte).
const defaults = {
   plans: basePlans.map((plan, i) => ({
      ...clone(plan),
      key: PLAN_KEYS[i],
      title: pair((tr) => tr.pricing.plans[i].title),
      description: pair((tr) => tr.pricing.plans[i].description),
      deliveryTime: pair((tr) => tr.pricing.plans[i].deliveryTime),
      features: pair((tr) => clone(tr.pricing.plans[i].features)),
   })),
   services: fr.services.items.map((service, i) => ({
      id: `service-${i + 1}`,
      icon: BASE_SERVICE_ICONS[i],
      includedKey: service.includedKey,
      title: pair((tr) => tr.services.items[i].title),
      description: pair((tr) => tr.services.items[i].description),
      included: pair((tr) => tr.services.items[i].included),
   })),
   projects: baseProjects.map((project) => {
      const text = (tr) => tr.portfolio.items.find((item) => item.id === project.id) || {};
      return {
         ...clone(project),
         title: pair((tr) => text(tr).title || ""),
         description: pair((tr) => text(tr).description || ""),
      };
   }),
   stats: clone(baseStats),
   testimonials: clone(baseTestimonials),
   contact: clone(baseContact),
   // Adresses complètes des réseaux sociaux : vides tant qu'elles ne sont pas fournies.
   social: { facebook: "", instagram: "", linkedin: "", tiktok: "", youtube: "" },
   // Blocs du site que l'on allume ou éteint. Le rendez-vous en ligne attend que les horaires soient vérifiés.
   features: { chat: true, newsletter: true, booking: false },
};

export const SECTIONS = [...Object.keys(defaults), "texts"];

export const defaultContent = () => clone(defaults);

// Textes gérés par leur propre écran (offres, services…) : l'écran « Textes » ne les propose pas une deuxième fois.
const MANAGED = [/^pricing\.plans\./, /^services\.items\./, /^portfolio\.items\./];
export const isManagedText = (path) => MANAGED.some((re) => re.test(path));

// { "hero.lead": "…" } : chaque texte repéré par son chemin dans le fichier de traduction.
export const flatten = (tree, prefix = "") =>
   Object.entries(tree).reduce((out, [key, value]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === "object") Object.assign(out, flatten(value, path));
      else if (typeof value === "string") out[path] = value;
      return out;
   }, {});

export const defaultTexts = (lang) =>
   Object.fromEntries(Object.entries(flatten(BASE[lang])).filter(([path]) => !isManagedText(path)));

const setPath = (tree, path, value) => {
   const keys = path.split(".");
   let node = tree;
   for (const key of keys.slice(0, -1)) {
      // Un chemin qui n'existe plus dans le site est ignoré.
      if (!node || typeof node !== "object" || !Object.hasOwn(node, key)) return;
      node = node[key];
   }
   const last = keys[keys.length - 1];
   if (node && typeof node === "object" && Object.hasOwn(node, last) && typeof node[last] === "string") node[last] = value;
};

// Contenu complet : valeurs d'origine, remplacées section par section par celles enregistrées.
export const resolveContent = (saved) => {
   const content = defaultContent();
   for (const key of Object.keys(defaults)) {
      const value = saved?.[key];
      if (value === undefined || value === null) continue;
      content[key] = Array.isArray(content[key]) ? clone(value) : { ...content[key], ...clone(value) };
   }
   content.texts = { fr: {}, en: {}, ...clone(saved?.texts || {}) };
   return content;
};

// « {prix_min} », « {prix_pro} »… : repères de prix des textes, remplis depuis les offres.
export const priceTokens = (plans, lang) => {
   const amounts = plans.map((plan) => Number(plan.amount)).filter((amount) => Number.isFinite(amount));
   const tokens = {};
   if (amounts.length) {
      tokens.prix_min = formatPrice(Math.min(...amounts), lang);
      tokens.prix_max = formatPrice(Math.max(...amounts), lang);
   }
   for (const plan of plans) if (plan.key) tokens[`prix_${plan.key}`] = formatPrice(Number(plan.amount), lang);
   return tokens;
};

const fill = (value, tokens) => {
   if (typeof value === "string") return value.replace(/\{(prix_\w+)\}/g, (match, name) => tokens[name] ?? match);
   if (Array.isArray(value)) return value.map((item) => fill(item, tokens));
   if (value && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, fill(item, tokens)]));
   }
   return value;
};

// Un texte anglais laissé vide reprend le français plutôt que d'afficher un blanc.
const text = (field, lang) => field?.[lang] || field?.fr || "";
const list = (field, lang) => {
   const items = (field?.[lang] || []).filter(Boolean);
   return items.length ? items : (field?.fr || []).filter(Boolean);
};

// Fichier de traduction d'une langue, une fois le contenu enregistré appliqué.
export const buildTranslation = (lang, content) => {
   const tree = clone(BASE[lang]);
   for (const [path, value] of Object.entries(content.texts?.[lang] || {})) {
      if (typeof value === "string" && !isManagedText(path)) setPath(tree, path, value);
   }
   tree.pricing.plans = content.plans.map((plan) => ({
      id: plan.id,
      title: text(plan.title, lang),
      description: text(plan.description, lang),
      deliveryTime: text(plan.deliveryTime, lang),
      features: list(plan.features, lang),
   }));
   content.plans.forEach((plan) => {
      tree.form.planOptions[plan.key] = text(plan.title, lang);
      tree.portfolio.filters[PLAN_FILTERS[plan.key]] = text(plan.title, lang);
   });
   tree.services.items = content.services.map((service) => ({
      title: text(service.title, lang),
      description: text(service.description, lang),
      included: text(service.included, lang),
      includedKey: service.includedKey,
      icon: service.icon,
   }));
   tree.portfolio.items = content.projects.map((project) => ({
      id: project.id,
      title: text(project.title, lang),
      description: text(project.description, lang),
   }));
   return fill(tree, priceTokens(content.plans, lang));
};

// Ce que l'assistant et les brouillons de réponse ont le droit d'affirmer : le contenu publié, rien d'autre.
export const describeContent = (content, lang = "fr") => {
   const tr = buildTranslation(lang, content);
   const lines = ["== NOS SERVICES =="];
   for (const service of tr.services.items) lines.push(`• ${service.title} : ${service.description} (${service.included})`);
   lines.push("", "== NOS OFFRES TARIFAIRES (paiement unique, mise en ligne comprise) ==");
   content.plans.forEach((plan, i) => {
      const t = tr.pricing.plans[i];
      lines.push(`${t.title} – ${formatPrice(Number(plan.amount), lang)}${plan.recommended ? " (recommandé)" : ""}`);
      for (const feature of t.features) lines.push(`  • ${feature}`);
      lines.push(`  • Délai : ${t.deliveryTime}`, "");
   });
   const wp = tr.pricing.wordpress;
   lines.push(`${wp.title} – ${wp.price}`, `  • ${wp.text}`, `  • Délai : ${wp.deliveryTime}`, "");
   lines.push(`${tr.form.planOptions.mobile} (iOS et Android) – ${tr.form.mobileMeta}`, "");
   const live = content.projects.filter((project) => project.screens && /^https?:/.test(project.link || ""));
   if (live.length) {
      lines.push("== SITES DÉJÀ RÉALISÉS, EN LIGNE ==");
      for (const project of live) lines.push(`• ${text(project.title, lang)} : ${text(project.description, lang)} (${project.link})`);
      lines.push("");
   }
   lines.push("== CONTACT ==");
   lines.push(`WhatsApp et téléphone : ${content.contact.phoneDisplay}`, `Email : ${content.contact.email}`);
   if (content.features.booking) lines.push(`Prendre rendez-vous en ligne : ${SITE}/rendez-vous`);
   return lines.join("\n");
};

export { SITE };
