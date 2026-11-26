import { useState } from "react";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { LeaveGuard, useAdmin, useDraft } from "../lib/store";
import { Bilingual, Button, IconButton, Input, MoveButtons, moveItem, Note, PageHead, Panel, SaveBar, Tabs } from "../ui";
import { money, toCurrency } from "../lib/format";

// Les éléments français et anglais d'une offre vont par paire, sur la même ligne.
const Features = ({ value, onChange }) => {
   const count = Math.max(value.fr.length, value.en.length);
   const rows = Array.from({ length: count }, (_, i) => ({ fr: value.fr[i] || "", en: value.en[i] || "" }));
   const write = (next) => onChange({ fr: next.map((row) => row.fr), en: next.map((row) => row.en) });
   const { toast } = useAdmin();
   return (
      <div>
         <p className="mb-2 text-[14px] font-medium text-fg/90">Ce que l&apos;offre comprend</p>
         <ul className="space-y-4">
            {rows.map((row, index) => (
               <li key={index} className="grid items-end gap-2 border-t border-line pt-4 first:border-t-0 first:pt-0 md:grid-cols-[minmax(0,1fr)_auto]">
                  <Bilingual label={`Élément ${index + 1}`} value={row} onChange={(next) => write(rows.map((item, i) => (i === index ? next : item)))} onError={(text) => toast(text, "error")} />
                  <span className="flex justify-end">
                     <MoveButtons index={index} count={rows.length} onMove={(offset) => write(moveItem(rows, index, offset))} />
                     <IconButton label={`Retirer l'élément ${index + 1}`} icon={Trash2} onClick={() => write(rows.filter((_, i) => i !== index))} />
                  </span>
               </li>
            ))}
         </ul>
         <Button size="sm" icon={Plus} className="mt-4" onClick={() => write([...rows, { fr: "", en: "" }])}>
            Ajouter un élément
         </Button>
      </div>
   );
};

const Plans = () => {
   const { content, saveContent, toast } = useAdmin();
   const { draft, setDraft, dirty, reset } = useDraft(content.plans);
   const [tab, setTab] = useState(draft[0].key);
   const plan = draft.find((item) => item.key === tab) || draft[0];
   const set = (patch) => setDraft((list) => list.map((item) => (item.key === plan.key ? { ...item, ...patch } : item)));
   const onError = (text) => toast(text, "error");

   return (
      <>
         <LeaveGuard when={dirty} />
         <PageHead title="Offres" text="Un prix modifié ici change partout : cartes, accueil, formulaire de devis, référencement et réponses de l'assistant.">
            <Button icon={ExternalLink} href="/plans">
               Voir la page
            </Button>
         </PageHead>
         <div className="mb-5">
            <Tabs label="Offres" value={plan.key} onChange={setTab} items={draft.map((item) => [item.key, item.title.fr || item.key])} />
         </div>
         <div className="space-y-6">
            <Panel title="Prix et mise en avant">
               <div className="grid items-start gap-5 md:grid-cols-3">
                  <Input label="Prix en euros" inputMode="numeric" value={plan.amount} onChange={(e) => set({ amount: e.target.value.replace(/[^\d]/g, "") })} hint={plan.amount ? `Environ ${money(toCurrency(Number(plan.amount), "XOF"))} à la parité fixe` : "Indiquez un prix"} inputClass="tabular" />
                  <Input label="Lien de l'exemple" value={plan.example === "/notdone" ? "" : plan.example} onChange={(e) => set({ example: e.target.value.trim() || "/notdone" })} placeholder="https://" hint="Vide : pas de lien « Voir un exemple »" />
                  <label className="flex cursor-pointer items-start gap-3 pt-7 text-[15px]">
                     {/* Une seule offre recommandée à la fois. */}
                     <input type="radio" name="recommended" checked={Boolean(plan.recommended)} onChange={() => setDraft((list) => list.map((item) => ({ ...item, recommended: item.key === plan.key })))} className="mt-1 h-[18px] w-[18px] accent-brand" />
                     Offre recommandée
                  </label>
               </div>
            </Panel>
            <Panel title="Textes">
               <div className="space-y-5">
                  <Bilingual label="Nom" value={plan.title} onChange={(title) => set({ title })} onError={onError} />
                  <Bilingual label="Description" value={plan.description} onChange={(description) => set({ description })} onError={onError} />
                  <Bilingual label="Délai" value={plan.deliveryTime} onChange={(deliveryTime) => set({ deliveryTime })} onError={onError} />
                  <Features value={plan.features} onChange={(features) => set({ features })} />
               </div>
            </Panel>
            <Note>Les offres sur devis (site WordPress, application mobile) se modifient dans Textes, partie « Offres : titres et WordPress ».</Note>
         </div>
         <SaveBar dirty={dirty} onSave={() => saveContent("plans", draft)} onReset={reset} />
      </>
   );
};

export default Plans;
