// Contenu du site modifiable depuis le tableau de bord : contrôle, enregistrement, historique et mise à jour immédiate des pages.
import { purgeCache } from "@netlify/cache";
import { SECTIONS, SERVICE_ICONS, defaultContent, defaultTexts, describeContent, resolveContent } from "../../dist-ssr/content.mjs";
import { HttpError, cleanEmail, cleanLine, cleanText, isLocal, newId } from "./http.mjs";
import { SKIP, keys, mutate, read, remove, write } from "./store.mjs";

const KEY = "contenu";
const HISTORY = "historique/";
const KEPT_VERSIONS = 60;

export const CACHE_TAG = "site";

// Seules les sections du site partent dans les pages publiques, jamais les données du tableau de bord.
export const publicContent = (saved) => {
   if (!saved) return null;
   const entries = SECTIONS.filter((key) => saved[key] !== undefined).map((key) => [key, saved[key]]);
   return entries.length ? Object.fromEntries(entries) : null;
};

export const savedContent = () => read(KEY);
export const fullContent = async () => resolveContent(await savedContent());
export const siteFacts = async (lang = "fr") => describeContent(await fullContent(), lang);

// Vide les pages gardées par le CDN : les visiteurs voient la modification au chargement suivant.
export const refreshSite = async () => {
   if (isLocal()) return true;
   try {
      await purgeCache({ tags: [CACHE_TAG] });
      return true;
   } catch (error) {
      console.error("Purge du cache :", error);
      return false;
   }
};

const link = (value) => {
   const url = cleanLine(value, 400);
   return /^(https?:\/\/|\/(?!\/))/.test(url) ? url : "";
};
const bilingual = (value, max, clean = cleanLine) => ({ fr: clean(value?.fr, max), en: clean(value?.en, max) });
const items = (value, max, count) => (Array.isArray(value) ? value.map((item) => cleanLine(item, max)).filter(Boolean).slice(0, count) : []);
const size = (value) => (Array.isArray(value) && value.length === 2 && value.every((n) => Number.isFinite(n) && n > 0 && n < 30000) ? value.map(Math.round) : null);
const required = (value, message) => {
   if (!value) throw new HttpError(400, message);
   return value;
};

// Chaque section est contrôlée avant d'être publiée : une saisie incomplète ne peut pas casser une page du site.
const CLEAN = {
   plans: (value) => {
      const base = defaultContent().plans;
      if (!Array.isArray(value) || value.length !== base.length) throw new HttpError(400, "Les trois offres doivent être présentes.");
      return base.map((plan) => {
         const next = value.find((item) => item?.key === plan.key) || {};
         const amount = Math.round(Number(next.amount));
         if (!(amount > 0 && amount < 1_000_000)) throw new HttpError(400, `Prix invalide pour l'offre « ${plan.title.fr} ».`);
         const title = bilingual(next.title, 60);
         const features = { fr: items(next.features?.fr, 160, 30), en: items(next.features?.en, 160, 30) };
         required(title.fr, "Chaque offre doit avoir un nom en français.");
         required(features.fr.length, `L'offre « ${title.fr} » doit avoir au moins un élément.`);
         return {
            id: plan.id,
            key: plan.key,
            amount,
            recommended: Boolean(next.recommended),
            ...(plan.premium ? { premium: true } : {}),
            example: link(next.example),
            title,
            description: bilingual(next.description, 160),
            deliveryTime: bilingual(next.deliveryTime, 80),
            features,
         };
      });
   },
   services: (value) => {
      if (!Array.isArray(value) || !value.length) throw new HttpError(400, "Gardez au moins un service.");
      return value.slice(0, 30).map((service) => ({
         id: cleanLine(service.id, 40) || newId(),
         icon: SERVICE_ICONS.includes(service.icon) ? service.icon : "code",
         includedKey: ["all", "pro", "quote"].includes(service.includedKey) ? service.includedKey : "quote",
         title: { ...bilingual(service.title, 60), fr: required(cleanLine(service.title?.fr, 60), "Chaque service doit avoir un nom en français.") },
         description: bilingual(service.description, 320),
         included: bilingual(service.included, 60),
      }));
   },
   projects: (value) => {
      if (!Array.isArray(value)) throw new HttpError(400, "Liste de réalisations illisible.");
      const used = new Set();
      const projects = value.slice(0, 60).map((project, i) => {
         let id = Number(project.id);
         while (!Number.isInteger(id) || id <= 0 || used.has(id)) id = Number.isInteger(id) && id > 0 ? id + 1000 : 1000 + i;
         used.add(id);
         const desktopSize = size(project.screens?.desktopSize);
         const mobileSize = size(project.screens?.mobileSize);
         const desktop = link(project.screens?.desktop);
         const mobile = link(project.screens?.mobile);
         const screens = desktop && mobile && desktopSize && mobileSize ? { desktop, mobile, desktopSize, mobileSize } : null;
         return {
            id,
            link: link(project.link) || "/notdone",
            planId: ["basic", "standard", "premium", "quote"].includes(project.planId) ? project.planId : "quote",
            ...(project.hero && screens ? { hero: true } : {}),
            ...(project.hidden ? { hidden: true } : {}),
            ...(screens ? { screens } : {}),
            title: { ...bilingual(project.title, 80), fr: required(cleanLine(project.title?.fr, 80), "Chaque réalisation doit avoir un titre en français.") },
            description: bilingual(project.description, 320),
         };
      });
      // L'accueil montre un vrai site : il en faut toujours au moins un, visible et avec ses captures.
      if (!projects.some((project) => project.screens && !project.hidden)) {
         throw new HttpError(400, "Gardez au moins une réalisation visible avec ses deux captures : elle s'affiche en haut de l'accueil.");
      }
      return projects;
   },
   stats: (value) =>
      (Array.isArray(value) ? value : []).slice(0, 8).map((stat) => ({
         value: required(cleanLine(stat.value, 20), "Chaque chiffre doit avoir une valeur."),
         label: { ...bilingual(stat.label, 80), fr: required(cleanLine(stat.label?.fr, 80), "Chaque chiffre doit avoir un libellé en français.") },
      })),
   testimonials: (value) =>
      (Array.isArray(value) ? value : []).slice(0, 30).map((item) => ({
         name: required(cleanLine(item.name, 80), "Chaque avis doit porter le nom du client."),
         role: bilingual(item.role, 100),
         quote: { ...bilingual(item.quote, 600, cleanText), fr: required(cleanText(item.quote?.fr, 600), "Chaque avis doit avoir un texte en français.") },
         rating: Math.max(0, Math.min(5, Math.round(Number(item.rating) || 0))),
      })),
   contact: (value) => {
      const phoneDisplay = required(cleanLine(value?.phoneDisplay, 40), "Indiquez le numéro de téléphone.");
      const digits = phoneDisplay.replace(/\D/g, "");
      if (digits.length < 8) throw new HttpError(400, "Numéro de téléphone incomplet : gardez l'indicatif du pays.");
      const whatsappNumber = String(value?.whatsappNumber || "").replace(/\D/g, "") || digits;
      return {
         phoneDisplay,
         phoneHref: `tel:+${digits}`,
         whatsappNumber,
         email: required(cleanEmail(value?.email), "Indiquez une adresse email valide."),
      };
   },
   social: (value) => Object.fromEntries(Object.keys(defaultContent().social).map((key) => {
      const url = link(value?.[key]);
      return [key, url.startsWith("http") ? url : ""];
   })),
   features: (value) => Object.fromEntries(Object.keys(defaultContent().features).map((key) => [key, Boolean(value?.[key])])),
   texts: (value) => {
      const out = {};
      for (const lang of ["fr", "en"]) {
         const base = defaultTexts(lang);
         out[lang] = {};
         for (const [path, text] of Object.entries(value?.[lang] || {})) {
            if (!Object.hasOwn(base, path) || typeof text !== "string") continue;
            const cleaned = cleanText(text, 2000);
            // Un texte identique à l'original n'a pas besoin d'être enregistré ; un texte vidé revient à l'original.
            if (cleaned && cleaned !== base[path]) out[lang][path] = cleaned;
         }
      }
      return out;
   },
};

const NAMES = { plans: "Offres", services: "Services", projects: "Réalisations", stats: "Chiffres", testimonials: "Avis", contact: "Coordonnées", social: "Réseaux sociaux", features: "Blocs du site", texts: "Textes" };

const snapshot = async (previous, label) => {
   const at = new Date().toISOString();
   await write(`${HISTORY}${at.replace(/[:.]/g, "-")}`, { at, label, content: previous });
   const versions = await keys(HISTORY);
   await Promise.all(versions.slice(0, Math.max(0, versions.length - KEPT_VERSIONS)).map((key) => remove(key)));
};

export const saveSection = async (section, value) => {
   if (!CLEAN[section]) throw new HttpError(404, "Section inconnue.");
   const cleaned = CLEAN[section](value);
   const previous = await savedContent();
   await mutate(KEY, {}, (data) => {
      data[section] = cleaned;
      data.rev = (data.rev || 0) + 1;
      data.updatedAt = new Date().toISOString();
   });
   await snapshot(previous, NAMES[section]);
   const live = await refreshSite();
   return { saved: cleaned, live };
};

// Remet une section dans son état d'origine (celui du code).
export const resetSection = async (section) => {
   if (!CLEAN[section]) throw new HttpError(404, "Section inconnue.");
   const previous = await savedContent();
   await mutate(KEY, {}, (data) => {
      if (data[section] === undefined) return SKIP;
      delete data[section];
      data.rev = (data.rev || 0) + 1;
      data.updatedAt = new Date().toISOString();
      return undefined;
   });
   await snapshot(previous, `${NAMES[section]} (valeurs d'origine)`);
   return refreshSite();
};

export const listHistory = async () => {
   const versions = (await keys(HISTORY)).reverse().slice(0, 30);
   const loaded = await Promise.all(versions.map(async (key) => ({ key, ...(await read(key)) })));
   return loaded.filter((version) => version.at).map(({ key, at, label }) => ({ key, at, label }));
};

// Revient à l'état du site juste avant une modification ; ce retour est lui-même dans l'historique.
export const restoreVersion = async (key) => {
   if (!String(key).startsWith(HISTORY)) throw new HttpError(400, "Version inconnue.");
   const version = await read(key);
   if (!version) throw new HttpError(404, "Version introuvable.");
   const previous = await savedContent();
   await mutate(KEY, {}, (data) => {
      const rev = (data.rev || 0) + 1;
      for (const name of Object.keys(data)) delete data[name];
      Object.assign(data, version.content || {}, { rev, updatedAt: new Date().toISOString() });
   });
   await snapshot(previous, "Retour en arrière");
   return refreshSite();
};
