import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { defaultTexts, priceTokens } from "../../content/model";
import { matches } from "../lib/format";
import { LeaveGuard, useAdmin, useDraft } from "../lib/store";
import { Bilingual, Empty, Note, PageHead, SaveBar, SearchBox, SelectBox, Tabs } from "../ui";

// Nom de chaque groupe de textes, dans l'ordre où on les rencontre sur le site.
const GROUPS = [
   ["hero", "Haut de l'accueil"], ["marquee", "Bandeau défilant"], ["commitments", "Engagements"], ["services", "Titres des services"], ["pricing", "Offres : titres et WordPress"], ["portfolio", "Réalisations : titres"], ["testimonials", "Avis : titres"],
   ["about", "À propos"], ["contactSection", "Contact"], ["form", "Formulaire de devis"], ["booking", "Prise de rendez-vous"], ["newsletter", "Inscription aux emails"], ["chatbot", "Assistant"], ["header", "Menu"], ["footer", "Pied de page"], ["common", "Boutons"], ["meta", "Google et partages"],
   ["mentions", "Mentions légales"], ["cookies", "Bannière cookies"], ["merci", "Page Merci"], ["paiementAnnule", "Paiement annulé"], ["notFound", "Page introuvable"], ["notDone", "Site en cours"], ["notPay", "Paiement bientôt"],
];
const FR = defaultTexts("fr");
const EN = defaultTexts("en");
const PATHS = Object.keys(FR);
const groupOf = (path) => path.split(".")[0];
// Nom lisible d'un texte, d'après la fin de son repère.
const LEAVES = {
   title: "Titre", titleLine1: "Titre, première ligne", titleLine2: "Titre, deuxième ligne", sectionTitle: "Titre", subtitle: "Sous-titre", lead: "Introduction", description: "Description", text: "Texte", message: "Message", label: "Libellé", value: "Valeur", cta: "Bouton", tagline: "Accroche", priceFrom: "Prix de départ", priceNote: "Note sur le prix",
   ogTitle: "Titre au partage", ogDescription: "Description au partage", whatsappMessage: "Message WhatsApp prérempli", whatsappPlan: "Message WhatsApp d'une offre", placeholder: "Exemple dans le champ", submit: "Bouton d'envoi", welcome: "Message d'accueil", error: "Message d'erreur", intro: "Introduction", optIn: "Case d'accord", deliveryTime: "Délai", price: "Prix",
};
const nameOf = (path) => {
   const keys = path.split(".");
   const last = keys[keys.length - 1];
   if (/^\d+$/.test(last)) return `Ligne ${Number(last) + 1}`;
   const row = keys.find((key) => /^\d+$/.test(key));
   const page = keys[0] === "meta" ? { home: "Accueil", about: "À propos", services: "Services", plans: "Offres", contact: "Contact", portfolio: "Réalisations", booking: "Rendez-vous" }[keys[1]] : "";
   return [page, LEAVES[last] || (/^p\d$/.test(last) ? `Paragraphe ${last.slice(1)}` : "Texte"), row !== undefined && `ligne ${Number(row) + 1}`].filter(Boolean).join(", ");
};
const holders = (text) => [...new Set(text.match(/\{\{\w+\}\}|<\/?\w+>/g) || [])];

const Texts = () => {
   const { content, saveContent, toast } = useAdmin();
   const { draft, setDraft, dirty, reset } = useDraft({ fr: { ...FR, ...content.texts.fr }, en: { ...EN, ...content.texts.en } });
   const [group, setGroup] = useState("hero");
   const [query, setQuery] = useState("");
   const [view, setView] = useState("group");

   const changed = (path) => draft.fr[path] !== FR[path] || draft.en[path] !== EN[path];
   const list = useMemo(
      () => PATHS.filter((path) => (query.trim() ? matches(query, draft.fr[path], draft.en[path]) : view === "changed" ? draft.fr[path] !== FR[path] || draft.en[path] !== EN[path] : groupOf(path) === group)),
      [query, view, group, draft],
   );
   const set = (path, value) => setDraft((prev) => ({ fr: { ...prev.fr, [path]: value.fr }, en: { ...prev.en, [path]: value.en } }));

   const save = () => {
      // Un repère ({{name}}, <brand>) retiré casserait la phrase : on prévient avant d'enregistrer.
      const broken = PATHS.find((path) => ["fr", "en"].some((lang) => draft[lang][path]?.trim() && holders((lang === "fr" ? FR : EN)[path]).some((holder) => !draft[lang][path].includes(holder))));
      if (broken) {
         const missing = ["fr", "en"].flatMap((lang) => holders((lang === "fr" ? FR : EN)[broken]).filter((holder) => !draft[lang][broken].includes(holder)));
         toast(`Remettez « ${missing[0]} » dans le texte « ${draft.fr[broken].slice(0, 50)} ».`, "error");
         return Promise.resolve();
      }
      return saveContent("texts", draft);
   };

   const tokens = priceTokens(content.plans, "fr");

   return (
      <>
         <LeaveGuard when={dirty} />
         <PageHead title="Textes" text="Tous les textes du site, en français et en anglais. Les offres, services et réalisations ont leur propre écran." />
         <div className="mb-5 flex flex-wrap items-center gap-3">
            <SearchBox value={query} onChange={setQuery} placeholder="Rechercher un texte du site" className="min-w-[240px] flex-1" />
            <label className="w-full sm:w-[280px]">
               <span className="sr-only">Partie du site</span>
               <SelectBox
                  value={group}
                  onChange={(e) => {
                     setGroup(e.target.value);
                     setView("group");
                     setQuery("");
                  }}
                  options={GROUPS}
                  className="rounded-full!"
               />
            </label>
            <Tabs label="Textes affichés" value={view} onChange={setView} items={[["group", "Par partie"], ["changed", "Modifiés", PATHS.filter(changed).length]]} />
         </div>
         {group === "meta" && !query && view === "group" && <Note className="mb-5">Ces textes s&apos;affichent dans Google et lors d&apos;un partage sur WhatsApp ou Facebook. Titre : 60 caractères environ. Description : 155 environ.</Note>}
         {list.some((path) => /\{prix_/.test(draft.fr[path])) && (
            <Note className="mb-5">
               Les prix entre accolades se remplissent depuis vos offres : {Object.entries(tokens).map(([key, value]) => `{${key}} = ${value}`).join(", ")}.
            </Note>
         )}
         {list.length ? (
            <ul className="rounded-[20px] border border-line bg-ink-2 px-5 sm:px-6">
               {list.slice(0, 120).map((path) => (
                  <li key={path} className="border-t border-line py-5 first:border-t-0">
                     <Bilingual
                        area
                        rows={1}
                        label={query || view === "changed" ? `${GROUPS.find(([key]) => key === groupOf(path))?.[1] || ""}, ${nameOf(path).toLowerCase()}` : nameOf(path)}
                        value={{ fr: draft.fr[path], en: draft.en[path] }}
                        onChange={(value) => set(path, value)}
                        onError={(text) => toast(text, "error")}
                        hint={holders(FR[path]).length ? `À garder tel quel : ${holders(FR[path]).join(" ")}` : path.startsWith("meta.") ? `${draft.fr[path].length} caractères` : undefined}
                     />
                     {changed(path) && (
                        <button type="button" onClick={() => set(path, { fr: FR[path], en: EN[path] })} className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-brand-text hover:underline">
                           <RotateCcw size={13} aria-hidden="true" />
                           Revenir au texte d&apos;origine
                        </button>
                     )}
                  </li>
               ))}
            </ul>
         ) : (
            <Empty title={view === "changed" ? "Aucun texte modifié" : "Aucun texte trouvé"} />
         )}
         <SaveBar dirty={dirty} onSave={save} onReset={reset} />
      </>
   );
};

export default Texts;
