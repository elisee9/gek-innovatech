import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Archive, ArrowLeft, Bot, CalendarPlus, CircleCheck, Columns3, FilePlus2, FileText, List, Mail, MailCheck, MessageSquareReply, NotebookPen, Plus, Send, Trash2, Zap } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { api } from "../lib/api";
import { ago, dateTime, gmailUrl, LEAD_STATUS, matches, MODE_LABEL, needsReply, PLAN_LABEL, SOURCE_LABEL, whatsappUrl } from "../lib/format";
import { useAdmin } from "../lib/store";
import { MeetingDialog } from "../MeetingDialog";
import { AiButton, AutoArea, Avatar, Badge, Button, Confirm, Detail, Dialog, Empty, Field, IconButton, Input, MiniSelect, Note, PageHead, SearchBox, Select, SelectBox, Tabs, Textarea } from "../ui";

const FILTERS = [["todo", "À traiter"], ["all", "Toutes"], ...Object.entries(LEAD_STATUS).map(([key, { label }]) => [key, label]), ["archived", "Archivées"]];
const inFilter = (lead, filter) => {
   if (filter === "archived") return Boolean(lead.archived);
   if (lead.archived) return false;
   if (filter === "todo") return needsReply(lead);
   return filter === "all" || lead.status === filter;
};
const lastText = (lead) => [...lead.events].reverse().find((event) => event.text)?.text || "";

// ---------------------------------------------------------------- Ajout

const EMPTY = { name: "", company: "", email: "", phone: "", plan: "unsure", lang: "fr", message: "", channel: "whatsapp" };

const AddLead = ({ open, onClose }) => {
   const { services, run, put, refresh } = useAdmin();
   const navigate = useNavigate();
   const [pasted, setPasted] = useState("");
   const [values, setValues] = useState(EMPTY);
   const [busy, setBusy] = useState(false);
   const set = (field) => (e) => setValues((prev) => ({ ...prev, [field]: e.target.value }));

   const extract = () =>
      run(async () => {
         const found = await api.ai("extract", { text: pasted });
         setValues((prev) => ({ ...prev, ...Object.fromEntries(Object.entries(found).filter(([, value]) => value)) }));
      }, "Informations relevées : vérifiez-les avant d'enregistrer.");

   const save = async () => {
      setBusy(true);
      const lead = await run(() => api.post("demandes", values), "Demande ajoutée.");
      setBusy(false);
      if (!lead) return;
      put("leads", lead);
      refresh(true);
      setValues(EMPTY);
      setPasted("");
      onClose();
      navigate(`/admin/demandes/${lead.id}`);
   };

   return (
      <Dialog
         open={open}
         onClose={onClose}
         side
         title="Ajouter une demande"
         footer={
            <>
               <Button onClick={onClose}>Annuler</Button>
               <Button variant="primary" busy={busy} disabled={!values.name.trim() || !values.message.trim() || (!values.email.trim() && !values.phone.trim())} onClick={save}>
                  Enregistrer la demande
               </Button>
            </>
         }
      >
         <div className="space-y-5">
            <div className="rounded-2xl bg-ink-3/60 p-4">
               <Textarea label="Message reçu par WhatsApp, email ou téléphone" hint="Collez-le tel quel : l'assistant relève le nom, les coordonnées et le besoin." rows={4} value={pasted} onChange={(e) => setPasted(e.target.value)} />
               <div className="mt-3">
                  <AiButton onRun={extract} disabled={!services.ai.ready || pasted.trim().length < 10}>
                     Remplir la fiche
                  </AiButton>
               </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
               <Input label="Nom" value={values.name} onChange={set("name")} />
               <Input label="Entreprise" value={values.company} onChange={set("company")} />
               <Input label="Email" type="email" inputMode="email" value={values.email} onChange={set("email")} />
               <Input label="Téléphone / WhatsApp" type="tel" inputMode="tel" value={values.phone} onChange={set("phone")} hint="Avec l'indicatif du pays" />
               <Select label="Offre" value={values.plan} onChange={set("plan")} options={Object.entries(PLAN_LABEL)} />
               <Select label="Langue du client" value={values.lang} onChange={set("lang")} options={[["fr", "Français"], ["en", "Anglais"]]} />
               <Select label="Reçu par" className="sm:col-span-2" value={values.channel} onChange={set("channel")} options={[["whatsapp", "WhatsApp"], ["email", "Email"], ["phone", "Téléphone"], ["other", "Autre"]]} />
            </div>
            <Textarea label="Message du client" rows={5} value={values.message} onChange={set("message")} />
         </div>
      </Dialog>
   );
};

// ----------------------------------------------------------- Historique

const Bubble = ({ own, who, at, subject, text, tag }) => (
   <div className={`flex ${own ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[92%] rounded-[18px] px-4 py-3 sm:max-w-[82%] ${own ? "rounded-br-md bg-brand text-ink-2" : "rounded-bl-md border border-line bg-ink-3"}`}>
         <p className={`flex flex-wrap items-center gap-x-2 text-[13px] ${own ? "text-ink-2/80" : "text-subtle"}`}>
            <span className="font-medium">{who}</span>
            <span>{dateTime(at)}</span>
            {tag}
         </p>
         {subject && <p className="mt-1 font-medium">{subject}</p>}
         <p className="mt-1 whitespace-pre-wrap break-words text-[15px] leading-relaxed">{text}</p>
      </div>
   </div>
);

const Line = ({ icon: Icon, at, children }) => (
   <p className="flex items-center justify-center gap-2 text-center text-[13px] text-subtle">
      <Icon size={14} aria-hidden="true" className="flex-none" />
      <span>
         {children} · {dateTime(at)}
      </span>
   </p>
);

const CHANNEL = { site: "formulaire du site", whatsapp: "WhatsApp", email: "email", phone: "téléphone", other: "autre", manual: "ajout manuel" };

const Event = ({ event, lead }) => {
   switch (event.type) {
      case "message":
      case "reply":
         return <Bubble who={`${lead.name}, ${CHANNEL[event.channel] || event.channel || ""}`} at={event.at} subject={event.subject} text={event.text || "Réponse reçue"} />;
      case "email":
         return <Bubble own who="GEK, email" at={event.at} subject={event.subject} text={event.text} tag={event.auto && <span className="inline-flex items-center gap-1"><Zap size={12} aria-hidden="true" />{event.sequence}</span>} />;
      case "whatsapp":
         return <Bubble own who="GEK, WhatsApp" at={event.at} text={event.text} />;
      case "note":
         return (
            <div className="rounded-[16px] border border-dashed border-line-strong px-4 py-3">
               <p className="flex items-center gap-2 text-[13px] text-subtle">
                  <NotebookPen size={14} aria-hidden="true" />
                  Note interne · {dateTime(event.at)}
               </p>
               <p className="mt-1 whitespace-pre-wrap break-words text-[15px]">{event.text}</p>
            </div>
         );
      case "status":
         return <Line icon={CircleCheck} at={event.at}>{`${LEAD_STATUS[event.from]?.label} → ${LEAD_STATUS[event.to]?.label}`}</Line>;
      case "meeting":
         return <Line icon={CalendarPlus} at={event.at}>{`Rendez-vous prévu ${dateTime(event.start)} (${MODE_LABEL[event.mode]})`}</Line>;
      case "document":
         return (
            <Line icon={FileText} at={event.at}>
               <Link to={`/admin/documents/${event.documentId}`} className="font-medium text-brand-text hover:underline">
                  {event.kind === "quote" ? "Devis" : "Facture"} {event.number}
               </Link>{" "}
               envoyé{event.kind === "quote" ? "" : "e"} par email
            </Line>
         );
      default:
         return null;
   }
};

// --------------------------------------------------------------- Réponse

const Composer = ({ lead }) => {
   const { services, settings, run, put } = useAdmin();
   const canMail = Boolean(lead.email);
   const canWhatsapp = lead.phone.replace(/\D/g, "").length >= 8;
   const [tab, setTab] = useState(lead.draft?.channel || (canMail ? "email" : "whatsapp"));
   const [subject, setSubject] = useState(lead.draft?.subject || "");
   const [text, setText] = useState(lead.draft?.text || "");
   const [note, setNote] = useState("");
   const [received, setReceived] = useState("");
   const [instruction, setInstruction] = useState("");
   const [busy, setBusy] = useState(false);
   const [fromAi, setFromAi] = useState(Boolean(lead.draft?.ai));

   // Le brouillon est gardé sur le serveur : on peut commencer sur le téléphone et finir sur l'ordinateur.
   const timer = useRef(0);
   const keep = (next) => {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
         api.post(`demandes/${lead.id}/brouillon`, next).then((item) => put("leads", item), () => {});
      }, 1500);
   };
   useEffect(() => () => window.clearTimeout(timer.current), []);

   const write = (next) => {
      setText(next);
      keep({ subject, text: next, channel: tab });
   };

   const draft = () =>
      run(async () => {
         const result = await api.ai("reply", { leadId: lead.id, channel: tab, instruction, lang: lead.lang });
         if (tab === "email") setSubject(result.subject || subject);
         setText(result.body);
         setFromAi(true);
         keep({ subject: result.subject || subject, text: result.body, channel: tab });
      });

   const act = async (job, success) => {
      setBusy(true);
      window.clearTimeout(timer.current);
      const item = await run(job, success);
      setBusy(false);
      if (!item) return false;
      put("leads", item);
      return true;
   };

   const clear = () => {
      setSubject("");
      setText("");
      setInstruction("");
      setFromAi(false);
   };
   const incomplete = /\[(à compléter|to complete)/i.test(`${subject} ${text}`);

   const sendMail = async () => {
      if (await act(() => api.post(`demandes/${lead.id}/email`, { subject, text }), "Email envoyé.")) clear();
   };
   // Sans envoi connecté : Gmail s'ouvre avec le message prêt, et le tableau de bord en garde la trace.
   const openGmail = async () => {
      window.open(gmailUrl(lead.email, subject, `${text}\n\n${settings.mail.signature}`), "_blank", "noopener");
      if (await act(() => api.post(`demandes/${lead.id}/whatsapp`, { channel: "email", subject, text }), "Message ouvert dans Gmail.")) clear();
   };
   const sendWhatsapp = async () => {
      window.open(whatsappUrl(lead.phone, text), "_blank", "noopener");
      if (await act(() => api.post(`demandes/${lead.id}/whatsapp`, { text }), "Conversation ouverte dans WhatsApp.")) clear();
   };

   return (
      <div className="rounded-[20px] border border-line bg-ink-2 p-4 sm:p-5">
         <Tabs
            label="Type de message"
            value={tab}
            onChange={setTab}
            items={[...(canMail ? [["email", "Email"]] : []), ...(canWhatsapp ? [["whatsapp", "WhatsApp"]] : []), ["note", "Note"], ["received", "Réponse reçue"]]}
         />
         {(tab === "email" || tab === "whatsapp") && (
            <div className="mt-4 space-y-3">
               {tab === "email" && (
                  <Input
                     label={`Objet, pour ${lead.email}`}
                     value={subject}
                     onChange={(e) => {
                        setSubject(e.target.value);
                        keep({ subject: e.target.value, text, channel: tab });
                     }}
                  />
               )}
               <Field label={tab === "email" ? "Message" : `Message, pour ${lead.phone}`} hint={tab === "email" ? `Signature ajoutée à l'envoi : ${settings.mail.signature.split("\n")[0]}` : undefined}>
                  {(aria) => <AutoArea {...aria} rows={6} value={text} onChange={(e) => write(e.target.value)} placeholder={lead.lang === "en" ? "Hello…" : "Bonjour…"} />}
               </Field>
               {fromAi && <Note>Brouillon préparé par l&apos;assistant : relisez-le avant de l&apos;envoyer.</Note>}
               {incomplete && <Note tone="warn">Il reste un passage « [à compléter] » dans le message.</Note>}
               <div className="space-y-3 border-t border-line pt-4">
                  <div className="flex items-center gap-2 rounded-full border border-line-strong bg-ink p-1 pl-4 focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/15">
                     <label className="min-w-0 flex-1">
                        <span className="sr-only">Consigne pour l&apos;assistant</span>
                        <input
                           value={instruction}
                           onChange={(e) => setInstruction(e.target.value)}
                           disabled={!services.ai.ready}
                           placeholder="Consigne pour l'assistant (facultatif)"
                           className="h-9 w-full bg-transparent text-[15px] placeholder:text-subtle focus:outline-none"
                        />
                     </label>
                     <AiButton onRun={draft} disabled={!services.ai.ready}>
                        {text ? "Réécrire" : "Rédiger"}
                     </AiButton>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                     {tab === "whatsapp" ? (
                        <Button variant="whatsapp" icon={FaWhatsapp} busy={busy} disabled={!text.trim()} onClick={sendWhatsapp}>
                           Ouvrir WhatsApp
                        </Button>
                     ) : services.mail.ready ? (
                        <Button variant="primary" icon={Send} busy={busy} disabled={!text.trim() || !subject.trim()} onClick={sendMail}>
                           Envoyer l&apos;email
                        </Button>
                     ) : (
                        <Button variant="primary" icon={Mail} busy={busy} disabled={!text.trim()} onClick={openGmail}>
                           Ouvrir dans Gmail
                        </Button>
                     )}
                  </div>
               </div>
            </div>
         )}
         {tab === "note" && (
            <div className="mt-4 space-y-3">
               <Textarea label="Note interne, jamais envoyée au client" rows={4} value={note} onChange={(e) => setNote(e.target.value)} />
               <div className="flex justify-end">
                  <Button variant="primary" busy={busy} disabled={!note.trim()} onClick={async () => (await act(() => api.post(`demandes/${lead.id}/note`, { text: note }), "Note ajoutée.")) && setNote("")}>
                     Ajouter la note
                  </Button>
               </div>
            </div>
         )}
         {tab === "received" && (
            <div className="mt-4 space-y-3">
               <Textarea label="Ce que le client a répondu sur WhatsApp ou au téléphone" hint="Les relances automatiques prévues pour ce client s'arrêtent." rows={4} value={received} onChange={(e) => setReceived(e.target.value)} />
               <div className="flex justify-end">
                  <Button variant="primary" icon={MessageSquareReply} busy={busy} onClick={async () => (await act(() => api.post(`demandes/${lead.id}/reponse`, { text: received, channel: "whatsapp" }), "Réponse enregistrée.")) && setReceived("")}>
                     Enregistrer la réponse
                  </Button>
               </div>
            </div>
         )}
      </div>
   );
};

// ----------------------------------------------------------------- Fiche

const Analysis = ({ lead }) => {
   const { services, run, put } = useAdmin();
   const analyze = () => run(async () => put("leads", await api.ai("analyze", { leadId: lead.id })));
   const a = lead.analysis;
   return (
      <div className="rounded-[20px] border border-line bg-ink-2 p-5">
         <div className="flex items-center justify-between gap-3">
            <h2 className="text-[16px] font-semibold">Analyse</h2>
            <AiButton onRun={analyze} disabled={!services.ai.ready}>
               {a ? "Refaire" : "Analyser"}
            </AiButton>
         </div>
         {a ? (
            <div className="mt-3 space-y-3 text-[14px] leading-relaxed">
               {a.spam && <Note tone="warn">Ce message ressemble à une publicité.</Note>}
               <p className="text-[15px]">{a.summary}</p>
               <dl>
                  <Detail label="Offre">{a.offer}</Detail>
                  <Detail label="Budget">{a.budget}</Detail>
                  <Detail label="Délai">{a.deadline}</Detail>
                  <Detail label="Urgence">{a.urgency}</Detail>
               </dl>
               {a.questions?.length > 0 && (
                  <div>
                     <p className="font-medium">À demander</p>
                     <ul className="mt-1 list-disc space-y-1 pl-5 text-muted">
                        {a.questions.map((question) => (
                           <li key={question}>{question}</li>
                        ))}
                     </ul>
                  </div>
               )}
            </div>
         ) : (
            <p className="mt-2 text-[14px] text-muted">Résumé du besoin, offre adaptée et questions à poser, d&apos;après les échanges.</p>
         )}
      </div>
   );
};

const LeadView = ({ lead }) => {
   const { run, put, drop, documents, meetings, enrollments, sequences, contacts, patch } = useAdmin();
   const navigate = useNavigate();
   const [meeting, setMeeting] = useState(false);
   const [confirm, setConfirm] = useState(false);
   const [sequenceId, setSequenceId] = useState("");

   useEffect(() => {
      if (lead.unread) api.patch(`demandes/${lead.id}`, { unread: false }).then((item) => put("leads", item), () => {});
      // Seulement à l'ouverture de la fiche.
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [lead.id]);

   const change = (body, success) => run(async () => put("leads", await api.patch(`demandes/${lead.id}`, body)), success);
   const contact = contacts.find((item) => item.id === lead.contactId);
   const docs = documents.filter((doc) => doc.leadId === lead.id);
   const dates = meetings.filter((item) => item.leadId === lead.id || (lead.email && item.email === lead.email));
   const running = enrollments.filter((item) => item.leadId === lead.id || (lead.email && item.email === lead.email));

   const enroll = () =>
      run(async () => {
         const added = await api.post(`sequences/${sequenceId}/inscrire`, { contactId: lead.contactId, leadId: lead.id });
         patch("enrollments", (list) => [added, ...list]);
         setSequenceId("");
      }, "Ajouté à la séquence.");
   const stop = (id) => run(async () => patch("enrollments", await api.post(`inscriptions/${id}/arreter`)), "Relances arrêtées.");

   return (
      <div className="grid grid-cols-1 min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
         <div className="min-w-0 space-y-5">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
               <Link to="/admin/demandes" className="inline-flex items-center gap-1.5 text-[14px] font-medium text-muted hover:text-fg lg:hidden">
                  <ArrowLeft size={15} aria-hidden="true" />
                  Demandes
               </Link>
               <div className="min-w-0 flex-1 basis-full sm:basis-auto">
                  <h1 className="truncate text-[22px] font-semibold tracking-[-0.015em]">{lead.name}</h1>
                  {lead.company && <p className="text-[14px] text-muted">{lead.company}</p>}
               </div>
               <label className="w-[190px]">
                  <span className="sr-only">Statut</span>
                  <SelectBox value={lead.status} onChange={(e) => change({ status: e.target.value }, "Statut mis à jour.")} options={Object.entries(LEAD_STATUS).map(([key, { label }]) => [key, label])} className="h-10! rounded-full!" />
               </label>
               <div className="flex">
                  <IconButton label={lead.archived ? "Désarchiver" : "Archiver"} icon={Archive} onClick={() => change({ archived: !lead.archived }, lead.archived ? "Demande remise dans la liste." : "Demande archivée.")} />
                  <IconButton label="Supprimer" icon={Trash2} onClick={() => setConfirm(true)} />
               </div>
            </div>

            <div className="space-y-4 rounded-[20px] border border-line bg-ink-2 p-4 sm:p-5">
               {lead.events.map((event) => (
                  <Event key={event.id} event={event} lead={lead} />
               ))}
            </div>
            <Composer key={lead.id} lead={lead} />
         </div>

         <aside className="space-y-5">
            <div className="grid grid-cols-2 gap-2">
               <Button icon={CalendarPlus} onClick={() => setMeeting(true)}>
                  Rendez-vous
               </Button>
               <Button icon={FilePlus2} to={`/admin/documents/nouveau?demande=${lead.id}`}>
                  Devis
               </Button>
            </div>
            <div className="rounded-[20px] border border-line bg-ink-2 p-5">
               <h2 className="mb-2 text-[16px] font-semibold">Coordonnées</h2>
               <dl>
                  <Detail label="Email">{lead.email && <a href={`mailto:${lead.email}`} className="text-brand-text hover:underline">{lead.email}</a>}</Detail>
                  <Detail label="Téléphone">{lead.phone && <a href={whatsappUrl(lead.phone)} target="_blank" rel="noopener noreferrer" className="tabular text-brand-text hover:underline">{lead.phone}</a>}</Detail>
                  <Detail label="Offre">{PLAN_LABEL[lead.plan] || lead.plan}</Detail>
                  <Detail label="Langue">{lead.lang === "en" ? "Anglais" : "Français"}</Detail>
                  <Detail label="Origine">{SOURCE_LABEL[lead.source] || lead.source}</Detail>
                  <Detail label="Reçue">{dateTime(lead.createdAt)}</Detail>
                  <Detail label="Emails">{contact?.noFollowUp ? "Désinscrit" : contact?.marketing?.ok ? "A accepté nos emails" : "Réponses seulement"}</Detail>
               </dl>
            </div>
            <Analysis lead={lead} />
            {(docs.length > 0 || dates.length > 0) && (
               <div className="rounded-[20px] border border-line bg-ink-2 p-5">
                  <h2 className="mb-2 text-[16px] font-semibold">Suivi</h2>
                  <ul className="space-y-2 text-[14px]">
                     {docs.map((doc) => (
                        <li key={doc.id}>
                           <Link to={`/admin/documents/${doc.id}`} className="font-medium text-brand-text hover:underline">
                              {doc.type === "quote" ? "Devis" : "Facture"} {doc.number || "(brouillon)"}
                           </Link>
                        </li>
                     ))}
                     {dates.map((item) => (
                        <li key={item.id}>
                           <Link to={`/admin/rendez-vous?ouvrir=${item.id}`} className="font-medium text-brand-text hover:underline">
                              Rendez-vous, {dateTime(item.start)}
                           </Link>
                        </li>
                     ))}
                  </ul>
               </div>
            )}
            <div className="rounded-[20px] border border-line bg-ink-2 p-5">
               <h2 className="text-[16px] font-semibold">Relances</h2>
               {running.length > 0 && (
                  <ul className="mt-2 space-y-2 text-[14px]">
                     {running.map((item) => {
                        const sequence = sequences.find((one) => one.id === item.sequenceId);
                        return (
                           <li key={item.id} className="flex items-center justify-between gap-3 border-t border-line pt-2 first:border-t-0 first:pt-0">
                              <span className="min-w-0">
                                 <span className="block truncate font-medium">{sequence?.name || "Séquence supprimée"}</span>
                                 <span className="text-muted">{item.status === "active" ? `Email ${item.step + 1} prévu ${dateTime(item.nextAt)}` : item.status === "done" ? "Terminée" : `Arrêtée : ${item.reason}`}</span>
                              </span>
                              {item.status === "active" && (
                                 <Button size="sm" onClick={() => stop(item.id)}>
                                    Arrêter
                                 </Button>
                              )}
                           </li>
                        );
                     })}
                  </ul>
               )}
               {lead.email && !contact?.noFollowUp && contact?.marketing?.ok && (
                  <div className="mt-3 flex gap-2">
                     <label className="min-w-0 flex-1">
                        <span className="sr-only">Séquence</span>
                        <SelectBox value={sequenceId} onChange={(e) => setSequenceId(e.target.value)} options={[["", "Choisir une séquence"], ...sequences.filter((item) => item.active).map((item) => [item.id, item.name])]} className="h-10!" />
                     </label>
                     <Button disabled={!sequenceId} onClick={enroll}>
                        Ajouter
                     </Button>
                  </div>
               )}
               {!running.length && <p className="mt-2 text-[14px] text-muted">{lead.email ? "Aucune relance programmée." : "Sans adresse email, pas de relance automatique."}</p>}
            </div>
         </aside>

         <MeetingDialog open={meeting} onClose={() => setMeeting(false)} initial={{ name: lead.name, email: lead.email, phone: lead.phone, lang: lead.lang, leadId: lead.id, contactId: lead.contactId }} />
         <Confirm
            open={confirm}
            onClose={() => setConfirm(false)}
            title="Supprimer cette demande ?"
            text={`Les échanges avec ${lead.name} seront effacés du tableau de bord. La fiche contact est conservée.`}
            action="Supprimer"
            onConfirm={async () => {
               if (await run(() => api.del(`demandes/${lead.id}`), "Demande supprimée.")) {
                  setConfirm(false);
                  navigate("/admin/demandes");
                  drop("leads", lead.id);
               }
            }}
         />
      </div>
   );
};

// --------------------------------------------------------- Liste et tableau

const LeadRow = ({ lead, active }) => (
   <li className="border-t border-line first:border-t-0">
      <Link to={`/admin/demandes/${lead.id}`} aria-current={active ? "true" : undefined} className={`flex gap-3 px-4 py-3.5 transition-colors ${active ? "bg-ink-3" : "hover:bg-ink-3/60"}`}>
         <Avatar name={lead.name} />
         <span className="min-w-0 flex-1">
            <span className="flex items-baseline gap-2">
               <span className={`min-w-0 flex-1 truncate ${lead.unread ? "font-semibold" : "font-medium"}`}>{lead.name}</span>
               {lead.unread && (
                  <>
                     <span aria-hidden="true" className="h-2 w-2 flex-none rounded-full bg-signal" />
                     <span className="sr-only">Non lue</span>
                  </>
               )}
               <span className="flex-none text-[13px] text-subtle">{ago(lead.updatedAt)}</span>
            </span>
            <span className="mt-0.5 block truncate text-[14px] text-muted">{lastText(lead)}</span>
            <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
               <Badge tone={LEAD_STATUS[lead.status].tone}>{LEAD_STATUS[lead.status].label}</Badge>
               {lead.draft?.ai && (
                  <span className="inline-flex items-center gap-1 text-[13px] text-subtle">
                     <Bot size={13} aria-hidden="true" />
                     Brouillon prêt
                  </span>
               )}
            </span>
         </span>
      </Link>
   </li>
);

const Board = ({ leads }) => {
   const { run, put } = useAdmin();
   const [over, setOver] = useState(null);
   const move = (id, status) => {
      const lead = leads.find((item) => item.id === id);
      if (!lead || lead.status === status) return;
      put("leads", { ...lead, status });
      run(async () => put("leads", await api.patch(`demandes/${id}`, { status })));
   };
   return (
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-9 lg:px-9">
         {Object.entries(LEAD_STATUS).map(([status, { label, tone }]) => {
            const list = leads.filter((lead) => lead.status === status);
            return (
               <section
                  key={status}
                  aria-label={label}
                  onDragOver={(e) => {
                     e.preventDefault();
                     setOver(status);
                  }}
                  onDragLeave={() => setOver((current) => (current === status ? null : current))}
                  onDrop={(e) => {
                     e.preventDefault();
                     setOver(null);
                     move(e.dataTransfer.getData("text/plain"), status);
                  }}
                  className={`min-h-[320px] w-[250px] flex-none rounded-[20px] p-2.5 xl:w-auto xl:min-w-[212px] xl:flex-1 transition-colors ${over === status ? "bg-brand/10" : "bg-ink-3/70"}`}
               >
                  <div className="mb-3 flex items-center justify-between px-1">
                     <Badge tone={tone}>{label}</Badge>
                     <span className="tabular text-[14px] text-subtle">{list.length}</span>
                  </div>
                  <ul className="space-y-2.5">
                     {list.map((lead) => (
                        <li key={lead.id} draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", lead.id)} className="cursor-grab rounded-2xl border border-line bg-ink-2 p-3.5 active:cursor-grabbing">
                           <Link to={`/admin/demandes/${lead.id}`} draggable={false} className="block">
                              <span className="flex items-center gap-2">
                                 <span className="min-w-0 flex-1 truncate font-medium">{lead.name}</span>
                                 {lead.unread && <span aria-label="Non lue" role="img" className="h-2 w-2 flex-none rounded-full bg-signal" />}
                              </span>
                              <span className="mt-1 line-clamp-2 text-[14px] leading-snug text-muted">{lastText(lead)}</span>
                           </Link>
                           <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                              <span className="text-[13px] text-subtle">{ago(lead.updatedAt)}</span>
                              <MiniSelect label={`Déplacer ${lead.name}`} value={lead.status} onChange={(e) => move(lead.id, e.target.value)} options={Object.entries(LEAD_STATUS).map(([key, item]) => [key, item.label])} className="h-8! max-w-[132px] text-[13px]!" />
                           </div>
                        </li>
                     ))}
                  </ul>
               </section>
            );
         })}
      </div>
   );
};

const Leads = () => {
   const { id } = useParams();
   const [params, setParams] = useSearchParams();
   const { leads, services, run, patch, toast } = useAdmin();
   const [filter, setFilter] = useState(params.get("statut") || "all");
   const [query, setQuery] = useState("");
   const [board, setBoard] = useState(false);
   const [adding, setAdding] = useState(params.get("ajouter") === "1");
   const [syncing, setSyncing] = useState(false);

   useEffect(() => {
      if (params.get("ajouter")) {
         setAdding(true);
         setParams({}, { replace: true });
      }
   }, [params, setParams]);

   const list = useMemo(
      () =>
         leads
            .filter((lead) => inFilter(lead, board ? "all" : filter) && matches(query, lead.name, lead.company, lead.email, lead.phone, lastText(lead)))
            .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
      [leads, filter, query, board],
   );
   const current = id && leads.find((lead) => lead.id === id);

   const sync = async () => {
      setSyncing(true);
      const result = await run(() => api.post("releve"));
      setSyncing(false);
      if (!result) return;
      patch("leads", result.leads);
      toast(result.found ? `${result.found} nouvelle${result.found > 1 ? "s" : ""} réponse${result.found > 1 ? "s" : ""}.` : "Aucune nouvelle réponse.");
   };

   const showBoard = board && !id;

   return (
      <>
         <div className={id ? "hidden lg:block" : ""}>
            <PageHead title="Demandes">
               {services.inbox.ready && (
                  <Button icon={MailCheck} busy={syncing} onClick={sync}>
                     Relever les réponses
                  </Button>
               )}
               <Button icon={showBoard ? List : Columns3} onClick={() => setBoard((v) => !v)} to={id ? "/admin/demandes" : undefined}>
                  {showBoard ? "Liste" : "Tableau"}
               </Button>
               <Button variant="primary" icon={Plus} onClick={() => setAdding(true)}>
                  Ajouter
               </Button>
            </PageHead>
         </div>

         {!leads.length ? (
            <Empty title="Aucune demande pour le moment" text="Les demandes envoyées depuis le site arrivent ici. Vous pouvez aussi coller un message reçu par WhatsApp ou par email.">
               <Button variant="primary" icon={Plus} onClick={() => setAdding(true)}>
                  Ajouter une demande
               </Button>
            </Empty>
         ) : showBoard ? (
            <>
               <SearchBox value={query} onChange={setQuery} placeholder="Rechercher une demande" className="mb-5 max-w-[360px]" />
               <Board leads={list} />
            </>
         ) : (
            <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
               <div className={`min-w-0 space-y-3 lg:sticky lg:top-[76px] ${id ? "hidden lg:block" : ""}`}>
                  <SearchBox value={query} onChange={setQuery} placeholder="Rechercher une demande" />
                  <label className="block">
                     <span className="sr-only">Afficher</span>
                     <SelectBox value={filter} onChange={(e) => setFilter(e.target.value)} options={FILTERS.map(([key, label]) => [key, `${label} (${leads.filter((lead) => inFilter(lead, key)).length})`])} className="rounded-full!" />
                  </label>
                  {list.length ? (
                     <ul className="overflow-hidden rounded-[20px] border border-line bg-ink-2 lg:max-h-[calc(100dvh-220px)] lg:overflow-y-auto">
                        {list.map((lead) => (
                           <LeadRow key={lead.id} lead={lead} active={lead.id === id} />
                        ))}
                     </ul>
                  ) : (
                     <p className="rounded-[20px] border border-dashed border-line-strong px-5 py-8 text-center text-muted">Aucune demande dans cette vue.</p>
                  )}
               </div>
               {current ? (
                  <LeadView key={current.id} lead={current} />
               ) : (
                  <div className="hidden rounded-[20px] border border-dashed border-line-strong py-24 text-center text-muted lg:block">{id ? "Cette demande n'existe plus." : "Choisissez une demande pour lire les échanges et répondre."}</div>
               )}
            </div>
         )}
         <AddLead open={adding} onClose={() => setAdding(false)} />
      </>
   );
};

export default Leads;
