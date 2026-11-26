import i18n from "../i18n/i18n";
import plans from "../data/plans";
import projects from "../data/portfolioData";
import stats from "../data/stats";
import testimonials from "../data/testimonials";
import { CONTACT } from "../data/contact";
import { FEATURES, SOCIAL } from "../data/features";
import { LANGS, buildTranslation, resolveContent } from "./model";

const replace = (target, items) => target.splice(0, target.length, ...items);
const clear = (target, values) => {
   for (const key of Object.keys(target)) delete target[key];
   Object.assign(target, values);
};

// Applique le contenu enregistré : les listes et les coordonnées partagées sont remplacées sur place,
// donc tous les composants qui les importent suivent sans rien savoir du tableau de bord.
export const applyContent = (saved) => {
   const content = resolveContent(saved);
   replace(
      plans,
      content.plans.map(({ id, key, amount, recommended, premium, example }) => ({ id, key, amount: Number(amount), recommended, premium, example })),
   );
   // Le titre et la description viennent des fichiers de traduction (buildTranslation).
   replace(
      projects,
      content.projects
         .filter((project) => !project.hidden)
         .map(({ id, link, planId, hero, screens }) => ({ id, link, planId, hero, screens })),
   );
   replace(stats, content.stats);
   replace(testimonials, content.testimonials);
   clear(CONTACT, content.contact);
   clear(SOCIAL, content.social);
   clear(FEATURES, content.features);
   for (const lang of LANGS) {
      i18n.removeResourceBundle(lang, "translation");
      i18n.addResourceBundle(lang, "translation", buildTranslation(lang, content), false, true);
   }
   return content;
};

// Le contenu enregistré est écrit dans la page par la fonction qui la sert (netlify/functions/site.mjs) ;
// sans lui (développement, secours), le site affiche ses valeurs d'origine.
export const readPageContent = () => {
   try {
      const node = document.getElementById("contenu-site");
      return node ? JSON.parse(node.textContent) : null;
   } catch {
      return null;
   }
};
