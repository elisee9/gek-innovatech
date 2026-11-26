import { Plus, Trash2 } from "lucide-react";
import { LeaveGuard, useAdmin, useDraft } from "../lib/store";
import { Bilingual, Button, IconButton, Input, MoveButtons, moveItem, Note, PageHead, Panel, SaveBar, Select } from "../ui";

const Proof = () => {
   const { content, saveContent, toast } = useAdmin();
   const { draft, setDraft, dirty, reset } = useDraft({ stats: content.stats, testimonials: content.testimonials });
   const onError = (text) => toast(text, "error");
   const list = (key) => ({
      set: (index, patch) => setDraft((prev) => ({ ...prev, [key]: prev[key].map((item, i) => (i === index ? { ...item, ...patch } : item)) })),
      move: (index, offset) => setDraft((prev) => ({ ...prev, [key]: moveItem(prev[key], index, offset) })),
      remove: (index) => setDraft((prev) => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) })),
      add: (item) => setDraft((prev) => ({ ...prev, [key]: [...prev[key], item] })),
   });
   const stats = list("stats");
   const reviews = list("testimonials");

   const save = async () => {
      if (JSON.stringify(draft.stats) !== JSON.stringify(content.stats) && !(await saveContent("stats", draft.stats))) return;
      if (JSON.stringify(draft.testimonials) !== JSON.stringify(content.testimonials)) await saveContent("testimonials", draft.testimonials);
   };

   return (
      <>
         <LeaveGuard when={dirty} />
         <PageHead title="Avis et chiffres" text="Ces blocs s'affichent sur l'accueil et la page À propos dès qu'ils contiennent quelque chose." />
         <Note tone="warn" className="mb-6">Uniquement de vrais avis, publiés avec l&apos;accord du client, et de vrais chiffres. Un avis inventé est interdit dans de nombreux pays et se remarque.</Note>
         <div className="space-y-6">
            <Panel
               title="Avis de clients"
               actions={
                  <Button size="sm" icon={Plus} onClick={() => reviews.add({ name: "", role: { fr: "", en: "" }, quote: { fr: "", en: "" }, rating: 5 })}>
                     Ajouter un avis
                  </Button>
               }
            >
               {draft.testimonials.length ? (
                  <ul className="space-y-7">
                     {draft.testimonials.map((item, index) => (
                        <li key={index} className="space-y-4 border-t border-line pt-6 first:border-t-0 first:pt-0">
                           <div className="grid items-end gap-4 sm:grid-cols-[minmax(0,1fr)_160px_auto]">
                              <Input label="Nom du client" value={item.name} onChange={(e) => reviews.set(index, { name: e.target.value })} />
                              <Select label="Note" value={item.rating} onChange={(e) => reviews.set(index, { rating: Number(e.target.value) })} options={[[0, "Sans note"], ...[5, 4, 3, 2, 1].map((n) => [n, `${n} sur 5`])]} />
                              <span className="flex justify-end">
                                 <MoveButtons index={index} count={draft.testimonials.length} onMove={(offset) => reviews.move(index, offset)} />
                                 <IconButton label="Retirer cet avis" icon={Trash2} onClick={() => reviews.remove(index)} />
                              </span>
                           </div>
                           <Bilingual label="Fonction, entreprise, ville" value={item.role} onChange={(role) => reviews.set(index, { role })} onError={onError} />
                           <Bilingual area rows={4} label="Avis" value={item.quote} onChange={(quote) => reviews.set(index, { quote })} onError={onError} />
                        </li>
                     ))}
                  </ul>
               ) : (
                  <p className="text-muted">Aucun avis : le bloc n&apos;est pas affiché sur le site.</p>
               )}
            </Panel>
            <Panel
               title="Chiffres"
               actions={
                  <Button size="sm" icon={Plus} disabled={draft.stats.length >= 8} onClick={() => stats.add({ value: "", label: { fr: "", en: "" } })}>
                     Ajouter un chiffre
                  </Button>
               }
            >
               {draft.stats.length ? (
                  <ul className="space-y-6">
                     {draft.stats.map((item, index) => (
                        <li key={index} className="grid items-end gap-4 border-t border-line pt-5 first:border-t-0 first:pt-0 md:grid-cols-[140px_minmax(0,1fr)_auto]">
                           <Input label="Valeur" value={item.value} onChange={(e) => stats.set(index, { value: e.target.value })} inputClass="tabular" />
                           <Bilingual label="Ce que c'est" value={item.label} onChange={(label) => stats.set(index, { label })} onError={onError} />
                           <span className="flex justify-end">
                              <MoveButtons index={index} count={draft.stats.length} onMove={(offset) => stats.move(index, offset)} />
                              <IconButton label="Retirer ce chiffre" icon={Trash2} onClick={() => stats.remove(index)} />
                           </span>
                        </li>
                     ))}
                  </ul>
               ) : (
                  <p className="text-muted">Aucun chiffre : le bloc n&apos;est pas affiché sur le site.</p>
               )}
            </Panel>
         </div>
         <SaveBar dirty={dirty} onSave={save} onReset={reset} />
      </>
   );
};

export default Proof;
