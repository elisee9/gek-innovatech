import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import { TRIGGER_LABEL } from "../lib/format";
import { LeaveGuard, useAdmin, useDraft } from "../lib/store";
import { AiButton, Bilingual, Button, Confirm, Dialog, IconButton, Input, MiniSelect, MoveButtons, moveItem, Note, PageHead, Panel, SaveBar, Select, Switch, Textarea } from "../ui";
import Missing from "./Missing";

const VARIABLES = ["{prenom}", "{nom}", "{entreprise}", "{lien_site}", "{lien_rdv}", "{lien_whatsapp}", "{numero_devis}"];
const newStep = () => ({ id: Math.random().toString(36).slice(2, 12), delay: { n: 3, unit: "days" }, subject: { fr: "", en: "" }, body: { fr: "", en: "" } });

const Generator = ({ open, onClose, trigger, onDone }) => {
   const { run } = useAdmin();
   const [goal, setGoal] = useState("");
   const [steps, setSteps] = useState(3);
   return (
      <Dialog
         open={open}
         onClose={onClose}
         title="Écrire la séquence avec l'assistant"
         footer={
            <AiButton
               size="md"
               variant="primary"
               disabled={goal.trim().length < 8}
               onRun={async () => {
                  const result = await run(() => api.ai("sequence", { goal, steps, trigger: TRIGGER_LABEL[trigger] }), "Séquence proposée : relisez chaque email.");
                  if (!result) return;
                  onDone(result);
                  onClose();
               }}
            >
               Écrire les emails
            </AiButton>
         }
      >
         <div className="space-y-4">
            <Textarea label="À quoi sert cette séquence ?" rows={4} value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Par exemple : reprendre contact avec les personnes qui ont demandé un devis il y a trois mois" />
            <Select label="Nombre d'emails" value={steps} onChange={(e) => setSteps(Number(e.target.value))} options={[1, 2, 3, 4, 5].map((n) => [n, String(n)])} />
            <Note>Les emails déjà écrits dans cette séquence seront remplacés dans votre copie de travail. Rien ne part avant l&apos;enregistrement.</Note>
         </div>
      </Dialog>
   );
};

const Editor = ({ sequence }) => {
   const { run, put, drop, toast, services } = useAdmin();
   const navigate = useNavigate();
   const { draft, setDraft, dirty, reset } = useDraft(sequence);
   const [writing, setWriting] = useState(false);
   const [confirm, setConfirm] = useState(false);
   const set = (field, value) => setDraft((prev) => ({ ...prev, [field]: value }));
   const setStep = (index, patch) => set("steps", draft.steps.map((step, i) => (i === index ? { ...step, ...patch } : step)));

   const save = async () => {
      const saved = await run(() => api.post("sequences", draft), "Séquence enregistrée.");
      if (!saved) return;
      put("sequences", saved);
      setDraft(saved);
   };

   return (
      <>
         <LeaveGuard when={dirty} />
         <PageHead title={draft.name || "Séquence sans nom"} back={{ to: "/admin/sequences", label: "Séquences" }}>
            <Button icon={Trash2} variant="danger" onClick={() => setConfirm(true)}>
               Supprimer
            </Button>
            {services.ai.ready && (
               <Button variant="ghost" onClick={() => setWriting(true)}>
                  Écrire avec l&apos;assistant
               </Button>
            )}
         </PageHead>

         <div className="space-y-6">
            <Panel title="Réglages">
               <div className="grid gap-5 md:grid-cols-2">
                  <Input label="Nom" value={draft.name} onChange={(e) => set("name", e.target.value)} />
                  <Select label="Départ" value={draft.trigger} onChange={(e) => set("trigger", e.target.value)} options={Object.entries(TRIGGER_LABEL)} />
                  <Switch label="Allumée" hint="Seules les personnes concernées à partir de maintenant y entrent." checked={draft.active} onChange={(value) => set("active", value)} />
                  <Switch label="S'arrêter quand le client répond" hint="Réponse par email relevée dans Gmail, ou réponse WhatsApp notée dans la demande." checked={draft.stopOnReply} onChange={(value) => set("stopOnReply", value)} />
               </div>
               {draft.trigger === "lead" && <Note className="mt-5">À partir du deuxième email, l&apos;envoi attend que vous ayez répondu au client : il ne reçoit jamais de relance avant votre réponse.</Note>}
               {["manual", "subscriber"].includes(draft.trigger) && <Note className="mt-5">Cette séquence ne part qu&apos;aux personnes qui ont accepté de recevoir vos emails.</Note>}
            </Panel>

            <p className="text-[14px] text-muted">
               Variables remplies pour chaque personne : {VARIABLES.map((name) => (
                  <button
                     key={name}
                     type="button"
                     onClick={() => navigator.clipboard.writeText(name).then(() => toast(`${name} copié.`), () => {})}
                     className="mr-1.5 mt-1 inline-flex rounded-lg border border-line bg-ink-2 px-2 py-0.5 text-[13px] text-fg transition-colors hover:border-fg/30"
                  >
                     {name}
                  </button>
               ))}
            </p>

            <ol className="space-y-5">
               {draft.steps.map((step, index) => (
                  <li key={step.id} className="rounded-[20px] border border-line bg-ink-2 p-5 sm:p-6">
                     <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-[17px] font-semibold">Email {index + 1}</h2>
                        <div className="flex flex-wrap items-center gap-2 text-[14px] text-muted">
                           <label className="flex items-center gap-2">
                              {index === 0 ? "Part après" : "Part ensuite après"}
                              <input
                                 type="number"
                                 min="0"
                                 max="365"
                                 value={step.delay.n}
                                 onChange={(e) => setStep(index, { delay: { ...step.delay, n: Math.max(0, Number(e.target.value) || 0) } })}
                                 className="tabular h-9 w-[64px] rounded-full border border-line-strong bg-ink-2 px-3 text-center text-fg focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15"
                              />
                           </label>
                           <MiniSelect label="Unité" value={step.delay.unit} onChange={(e) => setStep(index, { delay: { ...step.delay, unit: e.target.value } })} options={[["hours", "heures"], ["days", "jours"]]} />
                           <MoveButtons index={index} count={draft.steps.length} onMove={(offset) => set("steps", moveItem(draft.steps, index, offset))} />
                           <IconButton label={`Supprimer l'email ${index + 1}`} icon={Trash2} onClick={() => set("steps", draft.steps.filter((_, i) => i !== index))} />
                        </div>
                     </div>
                     <div className="space-y-4">
                        <Bilingual label="Objet" value={step.subject} onChange={(subject) => setStep(index, { subject })} onError={(text) => toast(text, "error")} />
                        <Bilingual area rows={7} label="Message" value={step.body} onChange={(body) => setStep(index, { body })} onError={(text) => toast(text, "error")} />
                     </div>
                  </li>
               ))}
            </ol>
            <Button icon={Plus} onClick={() => set("steps", [...draft.steps, newStep()])} disabled={draft.steps.length >= 10}>
               Ajouter un email
            </Button>
         </div>
         <SaveBar dirty={dirty} onSave={save} onReset={reset} label="Enregistrer" />

         <Generator
            open={writing}
            onClose={() => setWriting(false)}
            trigger={draft.trigger}
            onDone={(result) => setDraft((prev) => ({ ...prev, name: prev.name === "Nouvelle séquence" ? result.name : prev.name, steps: result.steps.map((step) => ({ ...newStep(), delay: { n: Math.max(0, step.delayDays || 0), unit: "days" }, subject: step.subject, body: step.body })) }))}
         />
         <Confirm
            open={confirm}
            onClose={() => setConfirm(false)}
            title="Supprimer cette séquence ?"
            text="Les envois en cours s'arrêtent pour toutes les personnes inscrites."
            action="Supprimer"
            onConfirm={async () => {
               if (await run(() => api.del(`sequences/${sequence.id}`), "Séquence supprimée.")) {
                  reset();
                  setConfirm(false);
                  window.setTimeout(() => {
                     navigate("/admin/sequences");
                     drop("sequences", sequence.id);
                  }, 0);
               }
            }}
         />
      </>
   );
};

const SequenceEditor = () => {
   const { id } = useParams();
   const { sequences } = useAdmin();
   const sequence = sequences.find((item) => item.id === id);
   return sequence ? <Editor key={id} sequence={sequence} /> : <Missing />;
};

export default SequenceEditor;
