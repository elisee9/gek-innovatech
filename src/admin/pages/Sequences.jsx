import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Plus } from "lucide-react";
import { api } from "../lib/api";
import { date, dateTime, plural, TRIGGER_LABEL } from "../lib/format";
import { useAdmin } from "../lib/store";
import { Badge, Button, Note, PageHead, Panel, Switch } from "../ui";

const delayText = ({ n, unit }) => (n === 0 ? "tout de suite" : `${n} ${unit === "hours" ? "h" : "j"}`);

const Sequences = () => {
   const { sequences, enrollments, services, run, put, patch } = useAdmin();
   const navigate = useNavigate();

   const toggle = (sequence) => run(async () => put("sequences", await api.post("sequences", { ...sequence, active: !sequence.active })), sequence.active ? "Séquence éteinte : plus rien ne part." : "Séquence allumée pour les prochaines personnes.");
   const create = async () => {
      const sequence = await run(() => api.post("sequences", { name: "Nouvelle séquence", trigger: "manual", active: false, steps: [] }));
      if (!sequence) return;
      put("sequences", sequence);
      navigate(`/admin/sequences/${sequence.id}`);
   };
   const stop = (id) => run(async () => patch("enrollments", await api.post(`inscriptions/${id}/arreter`)), "Relances arrêtées.");
   const running = enrollments.filter((item) => item.status === "active").sort((a, b) => a.nextAt - b.nextAt);

   return (
      <>
         <PageHead title="Séquences" text="Des emails de suivi qui partent seuls, au bon moment, et s'arrêtent dès que le client répond.">
            <Button variant="primary" icon={Plus} onClick={create}>
               Nouvelle séquence
            </Button>
         </PageHead>

         {!services.mail.ready && (
            <Note tone="warn" className="mb-6">
               Aucun email ne peut partir tant que l&apos;envoi n&apos;est pas connecté.{" "}
               <Link to="/admin/reglages?onglet=emails" className="font-medium underline">
                  Connecter l&apos;envoi d&apos;emails
               </Link>
            </Note>
         )}

         <Panel flush className="pb-2 !pt-0">
            <ul className="-mt-4">
               {sequences.map((sequence) => {
                  const own = enrollments.filter((item) => item.sequenceId === sequence.id);
                  const sent = own.reduce((sum, item) => sum + item.history.length, 0);
                  return (
                     <li key={sequence.id} className="grid gap-x-8 gap-y-3 border-t border-line px-5 py-5 first:border-t-0 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center">
                        <div className="min-w-0">
                           <Link to={`/admin/sequences/${sequence.id}`} className="inline-flex items-center gap-2 text-[17px] font-semibold tracking-[-0.01em] hover:underline">
                              {sequence.name}
                              <ArrowRight size={16} aria-hidden="true" className="text-subtle" />
                           </Link>
                           <p className="mt-0.5 text-[14px] text-muted">
                              {TRIGGER_LABEL[sequence.trigger]} · {plural(sequence.steps.length, "email")}
                              {sequence.steps.length > 0 && ` (${sequence.steps.map((step) => delayText(step.delay)).join(", puis ")})`}
                           </p>
                        </div>
                        <p className="text-[14px] text-muted">
                           {plural(own.filter((item) => item.status === "active").length, "personne")} en cours, {plural(sent, "email envoyé", "emails envoyés")}
                        </p>
                        <div className="flex items-center gap-3">
                           <Badge tone={sequence.active ? "ok" : "mute"}>{sequence.active ? "Allumée" : "Éteinte"}</Badge>
                           <Switch checked={sequence.active} onChange={() => toggle(sequence)} label={<span className="sr-only">Allumer {sequence.name}</span>} />
                        </div>
                     </li>
                  );
               })}
            </ul>
         </Panel>

         <Panel title="Prochains envois" className="mt-6" flush>
            {running.length ? (
               <ul className="pb-2">
                  {running.slice(0, 40).map((item) => (
                     <li key={item.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line px-5 py-3.5 sm:px-6">
                        <span className="min-w-0 flex-1 basis-[220px]">
                           <span className="block truncate font-medium">{item.name || item.email}</span>
                           <span className="block truncate text-[14px] text-muted">{sequences.find((sequence) => sequence.id === item.sequenceId)?.name}, email {item.step + 1}</span>
                        </span>
                        <span className="text-[14px] text-muted">{dateTime(item.nextAt)}</span>
                        <Button size="sm" onClick={() => stop(item.id)}>
                           Arrêter
                        </Button>
                     </li>
                  ))}
               </ul>
            ) : (
               <p className="border-t border-line px-6 py-8 text-center text-muted">Aucun envoi prévu. Les personnes entrent dans une séquence allumée à partir de leur prochaine action.</p>
            )}
         </Panel>

         {enrollments.some((item) => item.status !== "active") && (
            <Panel title="Terminées ou arrêtées" className="mt-6" flush>
               <ul className="pb-2">
                  {enrollments
                     .filter((item) => item.status !== "active")
                     .slice(0, 20)
                     .map((item) => (
                        <li key={item.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line px-5 py-3 text-[14px] sm:px-6">
                           <span className="min-w-0 flex-1 basis-[200px] truncate font-medium">{item.name || item.email}</span>
                           <span className="text-muted">{item.status === "done" ? "Tous les emails sont partis" : `Arrêtée : ${item.reason}`}</span>
                           <span className="text-subtle">{date(item.endedAt)}</span>
                        </li>
                     ))}
               </ul>
            </Panel>
         )}
      </>
   );
};

export default Sequences;
