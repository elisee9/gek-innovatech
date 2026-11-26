import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, CircleAlert, CircleCheck, TriangleAlert } from "lucide-react";
import { defaultTexts } from "../../content/model";
import { api } from "../lib/api";
import { useAdmin } from "../lib/store";
import { AiButton, Badge, Button, Note, PageHead, Panel } from "../ui";

const FR = defaultTexts("fr");
const EN = defaultTexts("en");
const SETS = [
   ["Accueil et engagements", /^(hero|commitments|marquee)\./],
   ["Offres et services", /^(pricing|services)\./],
   ["À propos et contact", /^(about|contactSection|form|booking|newsletter)\./],
   ["Google et partages", /^meta\./],
   ["Mentions et autres pages", /^(mentions|footer|cookies|chatbot|merci|notDone|notPay|paiementAnnule)\./],
];

// Contrôles sans IA : ce qui manque ou ne se correspond pas.
const audit = ({ content, settings, services, sequences }) => {
   const found = [];
   const add = (level, text, to, label) => found.push({ level, text, to, label });
   const bi = (name, field, to) => {
      if (field?.fr && !field.en) add("warn", `${name} : pas de texte anglais, le français s'affiche.`, to, "Compléter");
   };
   content.plans.forEach((plan) => {
      bi(`Offre ${plan.title.fr}`, plan.description, "/admin/offres");
      if (plan.features.fr.length !== plan.features.en.filter(Boolean).length) add("warn", `Offre ${plan.title.fr} : ${plan.features.fr.length} éléments en français, ${plan.features.en.filter(Boolean).length} en anglais.`, "/admin/offres", "Corriger");
   });
   if (content.plans.filter((plan) => plan.recommended).length !== 1) add("warn", "Aucune offre, ou plusieurs, sont marquées comme recommandées.", "/admin/offres", "Choisir");
   content.services.forEach((service) => {
      bi(`Service ${service.title.fr}`, service.title, "/admin/services");
      bi(`Service ${service.title.fr}`, service.description, "/admin/services");
      if (!service.description.fr) add("warn", `Service ${service.title.fr} : sans description.`, "/admin/services", "Compléter");
   });
   content.projects.filter((project) => !project.hidden).forEach((project) => {
      bi(`Réalisation ${project.title.fr}`, project.description, "/admin/realisations");
      if (project.screens && !/^https:\/\//.test(project.link)) add("error", `Réalisation ${project.title.fr} : captures présentes mais adresse du site absente ou non sécurisée.`, "/admin/realisations", "Corriger");
   });
   const shared = content.plans.find((plan) => plan.features.fr.some((feature) => /\w+\.gek-innovatech\.netlify\.app/.test(feature)));
   if (shared) add("error", `${shared.title.fr} promet une adresse «\u00a0…gek-innovatech.netlify.app\u00a0»\u00a0: Netlify ne permet pas de sous-adresse sous un nom en netlify.app. Proposez «\u00a0votremarque.netlify.app\u00a0» ou un domaine à votre nom.`, "/admin/offres", "Modifier");
   for (const [key, limit] of [["title", 65], ["description", 165]]) {
      for (const page of ["home", "about", "services", "plans", "contact", "portfolio"]) {
         const path = `meta.${page}.${key}`;
         const text = content.texts.fr[path] || FR[path];
         if (text.length > limit) add("warn", `${key === "title" ? "Titre" : "Description"} Google de la page ${page} : ${text.length} caractères, la fin sera coupée.`, "/admin/textes", "Raccourcir");
      }
   }
   if (!Object.values(content.social).some(Boolean)) add("info", "Aucun réseau social renseigné : ils ne s'affichent pas en pied de page.", "/admin/reglages?onglet=coordonnees", "Ajouter");
   if (!content.testimonials.length) add("info", "Aucun avis client affiché.", "/admin/avis", "Ajouter");
   if (!content.features.booking) add("info", "La prise de rendez-vous en ligne est fermée.", "/admin/reglages?onglet=rendez-vous", "Vérifier");
   if (content.features.booking && settings.booking.modes.includes("video") && !settings.booking.videoLink) add("error", "La visio est proposée aux visiteurs mais aucun lien de visio n'est enregistré.", "/admin/reglages?onglet=rendez-vous", "Ajouter le lien");
   if (!services.mail.ready) add("warn", "L'envoi d'emails n'est pas connecté : les réponses passent par Gmail et les séquences ne partent pas.", "/admin/reglages?onglet=emails", "Connecter");
   if (sequences.some((sequence) => sequence.active) && !services.inbox.ready && !services.local) add("warn", "Une séquence est allumée mais les réponses reçues par email ne sont pas relevées : notez-les dans chaque demande pour arrêter les relances.", "/admin/reglages?onglet=emails", "Voir");
   if (!settings.company.ifu || !settings.company.address) add("warn", "Devis et factures : informations de l'entreprise à compléter.", "/admin/reglages?onglet=entreprise", "Compléter");
   return found;
};

const ICON = { error: [CircleAlert, "text-danger"], warn: [TriangleAlert, "text-warn"], info: [CircleAlert, "text-info"] };

const Checkup = () => {
   const admin = useAdmin();
   const { content, run, services, saveContent } = admin;
   const problems = audit(admin);
   const [links, setLinks] = useState(null);
   const [issues, setIssues] = useState(null);
   const [progress, setProgress] = useState("");
   const texts = { fr: { ...FR, ...content.texts.fr }, en: { ...EN, ...content.texts.en } };

   const checkLinks = () => run(async () => setLinks(await api.get("liens")));
   const proofread = () =>
      run(async () => {
         const all = [];
         for (const [name, re] of SETS) {
            setProgress(name);
            const part = Object.fromEntries(Object.keys(FR).filter((path) => re.test(path)).map((path) => [path, { fr: texts.fr[path], en: texts.en[path] }]));
            const result = await api.ai("proofread", { texts: part });
            all.push(...result.issues.filter((issue) => Object.hasOwn(FR, issue.path) && issue.suggestion?.trim() && issue.suggestion.trim() !== texts[issue.lang]?.[issue.path]));
            setIssues([...all]);
         }
         setProgress("");
      }).finally(() => setProgress(""));

   const apply = async (issue) => {
      const next = { fr: { ...content.texts.fr }, en: { ...content.texts.en } };
      next[issue.lang][issue.path] = issue.suggestion;
      if (await saveContent("texts", next)) setIssues((list) => list.filter((item) => item !== issue));
   };

   const sorted = [...problems].sort((a, b) => ["error", "warn", "info"].indexOf(a.level) - ["error", "warn", "info"].indexOf(b.level));

   return (
      <>
         <PageHead title="Vérification" text="Ce qui manque, ce qui ne répond plus et ce qui pourrait être mal écrit sur le site." />
         <div className="space-y-6">
            <Panel title="Contenu et réglages" hint={problems.length ? undefined : "Rien à signaler."} flush>
               {sorted.length > 0 && (
                  <ul className="pb-2">
                     {sorted.map(({ level, text, to, label }) => {
                        const [Icon, color] = ICON[level];
                        return (
                           <li key={text} className="flex items-start gap-3 border-t border-line px-5 py-3.5 sm:px-6">
                              <Icon size={18} aria-hidden="true" className={`mt-0.5 flex-none ${color}`} />
                              <span className="min-w-0 flex-1 text-[15px]">{text}</span>
                              <Link to={to} className="flex-none text-[14px] font-medium text-brand-text hover:underline">
                                 {label}
                              </Link>
                           </li>
                        );
                     })}
                  </ul>
               )}
            </Panel>

            <Panel title="Liens publics" hint="Sites des réalisations, exemples et réseaux sociaux." actions={<AiLess onRun={checkLinks} />} flush={Boolean(links)}>
               {links ? (
                  links.length ? (
                     <ul className="pb-2">
                        {links.map((link) => (
                           <li key={link.url} className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line px-5 py-3 sm:px-6">
                              <a href={link.url} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 break-all text-[15px] hover:underline">
                                 {link.url}
                              </a>
                              {link.ok ? <Badge tone="ok">Répond</Badge> : <Badge tone="signal">{link.error || `Erreur ${link.status}`}</Badge>}
                           </li>
                        ))}
                     </ul>
                  ) : (
                     <p className="border-t border-line px-6 py-6 text-muted">Aucun lien public à vérifier.</p>
                  )
               ) : (
                  <p className="text-muted">Ouvre chaque lien et signale ceux qui ne répondent plus.</p>
               )}
            </Panel>

            <Panel
               title="Relecture des textes"
               hint="L'assistant cherche les fautes, les écarts entre le français et l'anglais et ce qui contredit vos offres."
               actions={
                  <AiButton onRun={proofread} disabled={!services.ai.ready}>
                     {issues ? "Relire à nouveau" : "Relire le site"}
                  </AiButton>
               }
               flush={Boolean(issues?.length)}
            >
               {progress && <p className={`text-muted ${issues?.length ? "px-6 pb-3" : ""}`}>Lecture : {progress}…</p>}
               {issues?.length > 0 && (
                  <ul className="pb-2">
                     {issues.map((issue, i) => (
                        <li key={`${issue.path}-${issue.lang}-${i}`} className="space-y-3 border-t border-line px-5 py-4 sm:px-6">
                           <p className="font-medium">
                              {issue.problem} <span className="font-normal text-subtle">({issue.lang === "en" ? "anglais" : "français"})</span>
                           </p>
                           <div className="grid gap-3 text-[14px] leading-relaxed md:grid-cols-2">
                              <p className="rounded-xl bg-ink-3 px-4 py-3">
                                 <span className="mb-1 block text-[13px] text-subtle">Aujourd&apos;hui</span>
                                 {texts[issue.lang][issue.path]}
                              </p>
                              <p className="rounded-xl border border-line-strong px-4 py-3">
                                 <span className="mb-1 block text-[13px] text-subtle">Proposition</span>
                                 {issue.suggestion}
                              </p>
                           </div>
                           <div className="flex gap-2">
                              <Button size="sm" variant="primary" icon={Check} onClick={() => apply(issue)}>
                                 Remplacer en ligne
                              </Button>
                              <Button size="sm" onClick={() => setIssues((list) => list.filter((item) => item !== issue))}>
                                 Ignorer
                              </Button>
                           </div>
                        </li>
                     ))}
                  </ul>
               )}
               {issues && !issues.length && !progress && (
                  <p className="flex items-center gap-2">
                     <CircleCheck size={18} className="text-ok" aria-hidden="true" />
                     Aucun problème relevé.
                  </p>
               )}
               {!issues && !progress && <p className="text-muted">Compte une minute environ. Chaque proposition attend votre accord.</p>}
            </Panel>
            {issues?.length > 0 && <Note>L&apos;assistant peut se tromper : comparez les deux textes avant de remplacer.</Note>}
         </div>
      </>
   );
};

const AiLess = ({ onRun }) => {
   const [busy, setBusy] = useState(false);
   return (
      <Button
         size="sm"
         busy={busy}
         onClick={async () => {
            setBusy(true);
            await onRun();
            setBusy(false);
         }}
      >
         Vérifier les liens
      </Button>
   );
};

export default Checkup;
