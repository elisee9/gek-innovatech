import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Plus, Send, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import { date, dateTime, plural } from "../lib/format";
import { LeaveGuard, useAdmin, useDraft } from "../lib/store";
import { AiButton, Badge, Bilingual, Button, Confirm, Empty, Input, Note, PageHead, Panel, SaveBar, Select, Textarea } from "../ui";
import Missing from "./Missing";

const STATUS = { draft: ["mute", "Brouillon"], sending: ["info", "Envoi en cours"], sent: ["ok", "Envoyée"] };

const Editor = ({ campaign }) => {
   const { run, put, drop, patch, contacts, services, toast, email } = useAdmin();
   const navigate = useNavigate();
   const { draft, setDraft, dirty, reset } = useDraft(campaign);
   const [brief, setBrief] = useState("");
   const [people, setPeople] = useState(null);
   const [confirm, setConfirm] = useState(null);
   const editable = campaign.status === "draft";
   const set = (field, value) => setDraft((prev) => ({ ...prev, [field]: value }));
   const tags = [...new Set(contacts.flatMap((contact) => contact.tags))].sort();

   useEffect(() => {
      let on = true;
      api.get(`campagnes/destinataires?tag=${encodeURIComponent(draft.tag || "")}`).then((result) => on && setPeople(result.count), () => {});
      return () => {
         on = false;
      };
   }, [draft.tag]);

   // Pendant l'envoi, la page avance la file jusqu'au bout ; si elle se ferme, le passage automatique prend le relais.
   useEffect(() => {
      if (campaign.status !== "sending") return undefined;
      let on = true;
      const step = async () => {
         const result = await api.post("envois").catch(() => null);
         if (!on || !result) return;
         patch("campaigns", result.campaigns);
         if (result.paused) toast("Limite d'envoi du jour atteinte : la suite part demain.");
         else if (result.left) window.setTimeout(step, 1200);
      };
      step();
      return () => {
         on = false;
      };
      // L'envoi ne redémarre pas à chaque mise à jour du compteur.
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [campaign.id, campaign.status]);

   const save = async () => {
      const saved = await run(() => api.post("campagnes", draft), "Campagne enregistrée.");
      if (!saved) return null;
      put("campaigns", saved);
      setDraft(saved);
      return saved;
   };

   return (
      <>
         <LeaveGuard when={dirty} />
         <PageHead title={draft.name} back={{ to: "/admin/campagnes", label: "Campagnes" }}>
            <Badge tone={STATUS[campaign.status][0]}>{STATUS[campaign.status][1]}</Badge>
         </PageHead>

         {!editable && (
            <Panel className="mb-6">
               <p className="text-[20px] font-semibold tracking-[-0.01em]">
                  {plural(campaign.sent, "email envoyé", "emails envoyés")} sur {campaign.total}
               </p>
               <div className="mt-3 h-2 overflow-hidden rounded-full bg-fg/[0.08]" role="progressbar" aria-valuenow={campaign.sent} aria-valuemax={campaign.total} aria-label="Avancement">
                  <div className="h-full bg-brand transition-[width] duration-300" style={{ width: `${campaign.total ? ((campaign.sent + campaign.failed) / campaign.total) * 100 : 0}%` }} />
               </div>
               <p className="mt-3 text-[14px] text-muted">
                  {campaign.failed > 0 && `${plural(campaign.failed, "email non parti", "emails non partis")}. `}
                  {campaign.startedAt && `Commencée ${dateTime(campaign.startedAt)}.`}
               </p>
            </Panel>
         )}

         <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0 space-y-6">
               {editable && services.ai.ready && (
                  <Panel title="Écrire avec l'assistant">
                     <Textarea label="Sujet de l'email" rows={2} value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="Par exemple : trois erreurs qui font fuir les visiteurs d'un site, avec un conseil pour chacune" />
                     <div className="mt-3">
                        <AiButton
                           disabled={brief.trim().length < 8}
                           onRun={async () => {
                              const result = await run(() => api.ai("campaign", { brief }), "Texte proposé : relisez-le.");
                              if (result) setDraft((prev) => ({ ...prev, subject: result.subject, body: result.body }));
                           }}
                        >
                           Proposer un texte
                        </AiButton>
                     </div>
                  </Panel>
               )}
               <fieldset disabled={!editable} className="min-w-0">
                  <Panel title="Email">
                     <div className="space-y-4">
                        <Input label="Nom de la campagne, pour vous" value={draft.name} onChange={(e) => set("name", e.target.value)} />
                        <Bilingual label="Objet" value={draft.subject} onChange={(value) => set("subject", value)} onError={(text) => toast(text, "error")} />
                        <Bilingual area rows={12} label="Message" value={draft.body} onChange={(value) => set("body", value)} hint="{prenom}, {nom}, {entreprise}, {lien_site} et {lien_rdv} se remplissent pour chaque personne." onError={(text) => toast(text, "error")} />
                     </div>
                  </Panel>
               </fieldset>
            </div>
            <div className="space-y-4 xl:sticky xl:top-[76px]">
               {editable && (
                  <Panel title="Destinataires">
                     <Select label="Envoyer à" value={draft.tag || ""} onChange={(e) => set("tag", e.target.value)} options={[["", "Toutes les personnes qui ont accepté"], ...tags.map((tag) => [tag, `Étiquette « ${tag} »`])]} />
                     <p className="mt-3 text-[15px]">{people === null ? "Calcul…" : <><strong className="font-semibold">{plural(people, "personne")}</strong> {people > 1 ? "recevront" : "recevra"} cet email.</>}</p>
                     <div className="mt-5 flex flex-col gap-2">
                        <Button
                           disabled={!services.mail.ready || !draft.subject.fr || !draft.body.fr}
                           onClick={async () => {
                              const saved = dirty ? await save() : campaign;
                              if (saved) await run(() => api.post(`campagnes/${campaign.id}/test`), ({ to }) => `Essai envoyé à ${to}.`);
                           }}
                        >
                           M&apos;envoyer un essai
                        </Button>
                        <Button variant="primary" icon={Send} disabled={dirty || !services.mail.ready || !people || !draft.subject.fr || !draft.body.fr} onClick={() => setConfirm("send")}>
                           Envoyer la campagne
                        </Button>
                     </div>
                     {dirty && <p className="mt-3 text-[13px] text-subtle">Enregistrez avant d&apos;envoyer.</p>}
                     {!services.mail.ready && <Note tone="warn" className="mt-4">L&apos;envoi d&apos;emails n&apos;est pas connecté (Réglages &gt; Emails).</Note>}
                  </Panel>
               )}
               {campaign.status !== "sending" && (
                  <Button variant="danger" size="sm" icon={Trash2} onClick={() => setConfirm("delete")}>
                     Supprimer la campagne
                  </Button>
               )}
               <Note>Chaque email porte un lien pour ne plus en recevoir. Gmail limite le nombre d&apos;envois par jour : au-delà, la suite part le lendemain.</Note>
            </div>
         </div>
         {editable && <SaveBar dirty={dirty} onSave={save} onReset={reset} label="Enregistrer" />}

         <Confirm
            open={confirm === "send"}
            onClose={() => setConfirm(null)}
            title={`Envoyer à ${plural(people || 0, "personne")} ?`}
            text={`« ${draft.subject.fr} » part depuis votre adresse. Un email envoyé ne peut pas être rappelé. Pour vérifier d'abord, envoyez-vous un essai à ${email}.`}
            action="Envoyer maintenant"
            onConfirm={async () => {
               const sent = await run(() => api.post(`campagnes/${campaign.id}/envoyer`), "Envoi lancé.");
               setConfirm(null);
               if (sent) put("campaigns", sent);
            }}
         />
         <Confirm
            open={confirm === "delete"}
            onClose={() => setConfirm(null)}
            title="Supprimer cette campagne ?"
            text="Son texte et ses chiffres disparaissent du tableau de bord."
            action="Supprimer"
            onConfirm={async () => {
               if (await run(() => api.del(`campagnes/${campaign.id}`), "Campagne supprimée.")) {
                  reset();
                  setConfirm(null);
                  window.setTimeout(() => {
                     navigate("/admin/campagnes");
                     drop("campaigns", campaign.id);
                  }, 0);
               }
            }}
         />
      </>
   );
};

const List = () => {
   const { campaigns, contacts, run, put } = useAdmin();
   const navigate = useNavigate();
   const subscribers = contacts.filter((contact) => contact.marketing?.ok && !contact.noFollowUp && contact.email).length;

   const create = async () => {
      const campaign = await run(() => api.post("campagnes", { name: `Email du ${date(new Date(), { day: "numeric", month: "long" })}` }));
      if (!campaign) return;
      put("campaigns", campaign);
      navigate(`/admin/campagnes/${campaign.id}`);
   };

   return (
      <>
         <PageHead title="Campagnes" text={`${plural(subscribers, "personne a accepté", "personnes ont accepté")} de recevoir vos emails.`}>
            <Button variant="primary" icon={Plus} onClick={create}>
               Nouvelle campagne
            </Button>
         </PageHead>
         {!campaigns.length ? (
            <Empty title="Aucune campagne pour le moment" text="Un email écrit une fois et envoyé à toutes les personnes inscrites : un conseil, une nouveauté, une réalisation.">
               <Button variant="primary" icon={Plus} onClick={create}>
                  Écrire un email
               </Button>
            </Empty>
         ) : (
            <ul className="overflow-hidden rounded-[20px] border border-line bg-ink-2">
               {campaigns.map((campaign) => (
                  <li key={campaign.id} className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line px-5 py-4 first:border-t-0 sm:px-6">
                     <span className="min-w-0 flex-1 basis-[240px]">
                        <Link to={`/admin/campagnes/${campaign.id}`} className="font-medium hover:underline">
                           {campaign.name}
                        </Link>
                        <span className="block truncate text-[14px] text-muted">{campaign.subject.fr || "Sans objet"}</span>
                     </span>
                     <span className="text-[14px] text-muted">{campaign.status === "draft" ? `Modifiée le ${date(campaign.updatedAt)}` : `${campaign.sent} sur ${campaign.total}`}</span>
                     <Badge tone={STATUS[campaign.status][0]}>{STATUS[campaign.status][1]}</Badge>
                  </li>
               ))}
            </ul>
         )}
      </>
   );
};

const Campaigns = () => {
   const { id } = useParams();
   const { campaigns } = useAdmin();
   if (!id) return <List />;
   const campaign = campaigns.find((item) => item.id === id);
   return campaign ? <Editor key={id} campaign={campaign} /> : <Missing />;
};

export default Campaigns;
