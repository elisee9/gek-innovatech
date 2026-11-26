import { useState } from "react";
import { BarChart3, Bot, Camera, ChevronDown, Cloud, Code2, ExternalLink, LayoutTemplate, Mail, Megaphone, Palette, Plus, Rocket, Search, ShieldCheck, ShoppingCart, Smartphone, Trash2, Users, Wrench } from "lucide-react";
import { api } from "../lib/api";
import { LeaveGuard, useAdmin, useDraft } from "../lib/store";
import { AiButton, Bilingual, Button, Dialog, IconButton, MoveButtons, moveItem, Note, PageHead, SaveBar, Select, Textarea } from "../ui";

const ICONS = {
   code: ["Code", Code2],
   layout: ["Page", LayoutTemplate],
   phone: ["Téléphone", Smartphone],
   chart: ["Graphique", BarChart3],
   rocket: ["Fusée", Rocket],
   palette: ["Palette", Palette],
   search: ["Loupe", Search],
   cloud: ["Nuage", Cloud],
   shield: ["Bouclier", ShieldCheck],
   cart: ["Panier", ShoppingCart],
   mail: ["Enveloppe", Mail],
   megaphone: ["Mégaphone", Megaphone],
   camera: ["Appareil photo", Camera],
   users: ["Personnes", Users],
   wrench: ["Outil", Wrench],
   bot: ["Robot", Bot],
};
// Texte affiché dans la colonne « Inclus dans », selon le choix.
const INCLUDED = {
   all: ["Toutes les offres", { fr: "Toutes les offres", en: "All plans" }],
   pro: ["Pro et Premium", { fr: "Pro et Premium", en: "Pro and Premium" }],
   quote: ["Sur devis", { fr: "Sur devis", en: "On quote" }],
};
const blank = () => ({ id: `service-${Math.random().toString(36).slice(2, 10)}`, icon: "code", includedKey: "quote", title: { fr: "", en: "" }, description: { fr: "", en: "" }, included: { ...INCLUDED.quote[1] } });

const Services = () => {
   const { content, saveContent, run, services, toast } = useAdmin();
   const { draft, setDraft, dirty, reset } = useDraft(content.services);
   const [open, setOpen] = useState(null);
   const [creating, setCreating] = useState(false);
   const [idea, setIdea] = useState("");
   const set = (id, patch) => setDraft((list) => list.map((item) => (item.id === id ? { ...item, ...patch } : item)));
   const onError = (text) => toast(text, "error");
   const add = (values = {}) => {
      const service = { ...blank(), ...values };
      setDraft((list) => [...list, service]);
      setOpen(service.id);
      setCreating(false);
      setIdea("");
   };
   const base = content.services.find((service) => service.includedKey === "all");
   if (base) INCLUDED.all[1] = base.included;

   return (
      <>
         <LeaveGuard when={dirty} />
         <PageHead title="Services" text="La liste affichée sur l'accueil et sur la page Services, dans cet ordre.">
            <Button icon={ExternalLink} href="/services">
               Voir la page
            </Button>
            <Button variant="primary" icon={Plus} onClick={() => setCreating(true)}>
               Nouveau service
            </Button>
         </PageHead>
         <ul className="overflow-hidden rounded-[20px] border border-line bg-ink-2">
            {draft.map((service, index) => {
               const [, Icon] = ICONS[service.icon] || ICONS.code;
               const expanded = open === service.id;
               return (
                  <li key={service.id} className="border-t border-line first:border-t-0">
                     <div className="flex items-center gap-2 py-2 pl-5 pr-3 sm:pl-6">
                        <button type="button" aria-expanded={expanded} onClick={() => setOpen(expanded ? null : service.id)} className="flex min-w-0 flex-1 items-center gap-4 py-2 text-left">
                           <Icon size={19} strokeWidth={1.8} aria-hidden="true" className="flex-none text-brand-text" />
                           <span className="min-w-0 flex-1">
                              <span className="block truncate font-medium">{service.title.fr || "Sans nom"}</span>
                              <span className="block truncate text-[14px] text-muted">{service.included.fr}</span>
                           </span>
                           <ChevronDown size={18} aria-hidden="true" className={`flex-none text-subtle transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
                        </button>
                        <span className="hidden sm:flex">
                           <MoveButtons index={index} count={draft.length} onMove={(offset) => setDraft((list) => moveItem(list, index, offset))} />
                        </span>
                        <IconButton label={`Supprimer ${service.title.fr}`} icon={Trash2} disabled={draft.length === 1} onClick={() => setDraft((list) => list.filter((item) => item.id !== service.id))} />
                     </div>
                     {expanded && (
                        <div className="space-y-5 border-t border-line bg-ink/60 px-5 py-5 sm:px-6">
                           <Bilingual label="Nom" value={service.title} onChange={(title) => set(service.id, { title })} onError={onError} />
                           <Bilingual area rows={3} label="Description" value={service.description} onChange={(description) => set(service.id, { description })} onError={onError} />
                           <div className="grid gap-5 sm:grid-cols-2">
                              <Select label="Inclus dans" value={service.includedKey} onChange={(e) => set(service.id, { includedKey: e.target.value, included: { ...INCLUDED[e.target.value][1] } })} options={Object.entries(INCLUDED).map(([key, [label]]) => [key, label])} />
                              <Select label="Icône" value={service.icon} onChange={(e) => set(service.id, { icon: e.target.value })} options={Object.entries(ICONS).map(([key, [label]]) => [key, label])} />
                           </div>
                           <div className="flex sm:hidden">
                              <MoveButtons index={index} count={draft.length} onMove={(offset) => setDraft((list) => moveItem(list, index, offset))} />
                           </div>
                        </div>
                     )}
                  </li>
               );
            })}
         </ul>
         <Note className="mt-5">Un nouveau service doit correspondre à ce que vous proposez vraiment : l&apos;assistant du site le présentera aux visiteurs.</Note>
         <SaveBar dirty={dirty} onSave={() => saveContent("services", draft)} onReset={reset} />

         <Dialog
            open={creating}
            onClose={() => setCreating(false)}
            title="Nouveau service"
            footer={
               <>
                  <Button onClick={() => add()}>Fiche vide</Button>
                  <AiButton
                     size="md"
                     variant="primary"
                     disabled={!services.ai.ready || idea.trim().length < 5}
                     onRun={async () => {
                        const result = await run(() => api.ai("service", { idea }), "Service proposé : relisez-le avant d'enregistrer.");
                        if (result) add(result);
                     }}
                  >
                     Proposer la fiche
                  </AiButton>
               </>
            }
         >
            <Textarea label="Décrivez le service en quelques mots" rows={4} value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="Par exemple : création de logos et de cartes de visite" hint="L'assistant écrit le nom et la description, en français et en anglais, dans le style des autres services." />
         </Dialog>
      </>
   );
};

export default Services;
