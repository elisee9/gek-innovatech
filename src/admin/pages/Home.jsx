import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, CircleCheck, FileText, Inbox, MailWarning, MessageSquareReply, Plus } from "lucide-react";
import { api } from "../lib/api";
import { ago, date, dateTime, dayKey, docState, LEAD_STATUS, MODE_LABEL, money, needsReply, plural, SOURCE_LABEL, time } from "../lib/format";
import { useAdmin } from "../lib/store";
import { Bars, Columns } from "../Charts";
import { AiButton, Badge, Button, Note, Panel } from "../ui";

const DAY = 86_400_000;

const useFigures = ({ leads, contacts, documents, counters }) =>
   useMemo(() => {
      const now = Date.now();
      const within = (value, from, to) => {
         const age = now - Date.parse(value);
         return age >= from * DAY && age < to * DAY;
      };
      const sum = (type, from, to) => Object.entries(counters).reduce((total, [day, values]) => (within(`${day}T12:00:00Z`, from, to) ? total + (values[type] || 0) : total), 0);
      const pair = (read) => ({ value: read(0, 30), before: read(30, 60) });
      const open = documents.filter((doc) => doc.type === "quote" && doc.status === "sent");
      const amount = (currency) => open.filter((doc) => doc.currency === currency).reduce((total, doc) => total + doc.totals.total, 0);
      return {
         leads: pair((a, b) => leads.filter((lead) => within(lead.createdAt, a, b)).length),
         whatsapp: pair((a, b) => sum("whatsapp", a, b)),
         visits: pair((a, b) => sum("visit", a, b)),
         subscribers: contacts.filter((contact) => contact.marketing?.ok && !contact.noFollowUp).length,
         open,
         openAmount: [amount("XOF") && money(amount("XOF"), "XOF"), amount("EUR") && money(amount("EUR"), "EUR")].filter(Boolean).join(" + "),
      };
   }, [leads, contacts, documents, counters]);

const Figure = ({ label, value, note }) => (
   <div className="bg-ink-2 px-4 py-4 last:col-span-2 sm:px-5 xl:last:col-span-1">
      <dt className="text-[14px] text-muted">{label}</dt>
      <dd className="mt-1 text-[26px] font-semibold leading-tight tracking-[-0.02em]">{value}</dd>
      <dd className="mt-0.5 min-h-[20px] text-[13px] text-subtle">{note}</dd>
   </div>
);

const compare = ({ value, before }) => {
   if (!before) return value ? "30 derniers jours" : "Aucun sur 30 jours";
   const diff = value - before;
   return diff === 0 ? "Comme les 30 jours d'avant" : `${diff > 0 ? "+" : "−"}${Math.abs(diff)} par rapport aux 30 jours d'avant`;
};

// Les étapes à faire une seule fois ; le bloc disparaît quand tout est prêt.
const Setup = () => {
   const { services, settings, sequences, content, saved } = useAdmin();
   const steps = [
      [services.mail.ready && !services.mail.test, "Connecter l'envoi d'emails", "/admin/reglages?onglet=emails"],
      [Boolean(settings.company.ifu && settings.company.address), "Compléter les informations de l'entreprise pour les devis", "/admin/reglages?onglet=entreprise"],
      [content.features.booking, "Vérifier les horaires et ouvrir les rendez-vous en ligne", "/admin/reglages?onglet=rendez-vous"],
      [sequences.some((sequence) => sequence.active), "Relire et allumer une séquence de suivi", "/admin/sequences"],
      [Object.values(content.social).some(Boolean), "Ajouter les réseaux sociaux", "/admin/reglages?onglet=coordonnees"],
      [Boolean(saved?.testimonials?.length || saved?.stats?.length), "Ajouter de vrais avis ou chiffres", "/admin/avis"],
   ];
   const left = steps.filter(([done]) => !done);
   if (!left.length) return null;
   return (
      <Panel title="Mise en route" hint={`${steps.length - left.length} sur ${steps.length} terminées`} flush>
         <ul className="pb-2">
            {steps.map(([done, label, to]) => (
               <li key={label} className="border-t border-line">
                  <Link to={to} className={`flex items-center gap-3 px-5 py-3 text-[15px] transition-colors hover:bg-ink-3/60 sm:px-6 ${done ? "text-subtle" : ""}`}>
                     {done ? <CircleCheck size={18} className="flex-none text-ok" aria-hidden="true" /> : <span aria-hidden="true" className="h-[18px] w-[18px] flex-none rounded-full border-[1.5px] border-line-strong" />}
                     <span className="min-w-0 flex-1">{label}</span>
                     <span className="sr-only">{done ? "(fait)" : "(à faire)"}</span>
                     {!done && <ArrowRight size={16} aria-hidden="true" className="flex-none text-subtle" />}
                  </Link>
               </li>
            ))}
         </ul>
      </Panel>
   );
};

const Home = () => {
   const admin = useAdmin();
   const { leads, meetings, documents, mails, contacts, counters, services, run } = admin;
   const figures = useFigures({ leads, contacts, documents, counters });
   const [brief, setBrief] = useState("");
   const today = dayKey();

   const upcoming = meetings
      .filter((meeting) => meeting.status === "confirmed" && Date.parse(meeting.start) + meeting.duration * 60_000 > Date.now())
      .sort((a, b) => a.start.localeCompare(b.start));
   const todayCount = upcoming.filter((meeting) => dayKey(meeting.start) === today).length;
   const toReply = leads.filter(needsReply);
   const overdue = meetings.filter((meeting) => meeting.status === "confirmed" && Date.parse(meeting.start) + meeting.duration * 60_000 < Date.now());
   const failed = mails.filter((mail) => !mail.ok && Date.now() - Date.parse(mail.at) < 3 * DAY);

   const tasks = [
      ...toReply.map((lead) => {
         const answer = lead.events.at(-1)?.type === "reply";
         return { key: lead.id, Icon: answer ? MessageSquareReply : Inbox, to: `/admin/demandes/${lead.id}`, title: answer ? `${lead.name} a répondu` : `Répondre à ${lead.name}`, text: lead.draft?.ai ? "Un brouillon est prêt, à relire" : lead.company || "Nouvelle demande", at: lead.events.at(-1)?.at || lead.createdAt };
      }),
      ...overdue.map((meeting) => ({ key: meeting.id, Icon: CalendarDays, to: `/admin/rendez-vous?ouvrir=${meeting.id}`, title: `Rendez-vous avec ${meeting.name} : fait ou absent ?`, text: dateTime(meeting.start), at: meeting.start })),
      ...documents
         .filter((doc) => ["expired", "late"].includes(docState(doc)))
         .map((doc) => ({ key: doc.id, Icon: FileText, to: `/admin/documents/${doc.id}`, title: doc.type === "quote" ? `Devis ${doc.number} expiré` : `Facture ${doc.number} en retard`, text: `${doc.client.company || doc.client.name}, ${money(doc.totals.total, doc.currency)}`, at: doc.due })),
      ...(failed.length ? [{ key: "mails", Icon: MailWarning, to: "/admin/reglages?onglet=emails", title: `${plural(failed.length, "email")} non ${failed.length > 1 ? "partis" : "parti"}`, text: failed[0].error, at: failed[0].at }] : []),
   ].sort((a, b) => a.at.localeCompare(b.at));

   // 12 semaines glissantes, du lundi au dimanche.
   const weeks = useMemo(() => {
      const monday = new Date(`${dayKey()}T00:00:00Z`);
      monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
      return Array.from({ length: 12 }, (_, i) => {
         const start = new Date(monday.getTime() - (11 - i) * 7 * DAY);
         const end = new Date(start.getTime() + 7 * DAY);
         return {
            label: date(start, { day: "numeric", month: "short" }),
            name: `Semaine du ${date(start, { day: "numeric", month: "long" })}`,
            value: leads.filter((lead) => Date.parse(lead.createdAt) >= start && Date.parse(lead.createdAt) < end).length,
         };
      });
   }, [leads]);

   const pipeline = Object.entries(LEAD_STATUS).map(([key, { label }]) => ({ label, value: leads.filter((lead) => !lead.archived && lead.status === key).length, to: `/admin/demandes?statut=${key}` }));
   const sources = Object.entries(contacts.reduce((acc, contact) => contact.sources.reduce((inner, source) => ({ ...inner, [source]: (inner[source] || 0) + 1 }), acc), {}))
      .map(([key, value]) => ({ label: SOURCE_LABEL[key] || key, value }))
      .sort((a, b) => b.value - a.value);

   const sentence =
      [toReply.length && `${plural(toReply.length, "demande")} à traiter`, todayCount && `${plural(todayCount, "rendez-vous", "rendez-vous")} aujourd'hui`, figures.open.length && `${plural(figures.open.length, "devis", "devis")} en attente de réponse`].filter(Boolean).join(", ") || "Tout est à jour";

   const makeBrief = () =>
      run(async () => {
         const { text } = await api.ai("briefing", {
            facts: {
               aujourdhui: dateTime(new Date()),
               aFaire: tasks.slice(0, 12).map(({ title, text, at }) => ({ title, text, depuis: ago(at) })),
               rendezVous: upcoming.slice(0, 6).map((meeting) => ({ avec: meeting.name, quand: dateTime(meeting.start), sujet: meeting.topic })),
               devisEnAttente: figures.open.slice(0, 8).map((doc) => ({ numero: doc.number, client: doc.client.company || doc.client.name, montant: money(doc.totals.total, doc.currency), envoyeLe: date(doc.sentAt) })),
               demandes30Jours: figures.leads,
               clicsWhatsApp30Jours: figures.whatsapp,
            },
         });
         setBrief(text);
      });

   return (
      <>
         <header className="mb-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
            <div>
               <h1 className="max-w-[40ch] text-balance text-[30px] font-semibold leading-[1.1] tracking-[-0.025em] sm:text-[34px]">{sentence}</h1>
               <p className="mt-2 text-muted first-letter:uppercase">{date(new Date(), { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
            <div className="flex flex-wrap gap-2">
               {services.ai.ready && <AiButton size="md" onRun={makeBrief}>Faire le point</AiButton>}
               <Button variant="primary" icon={Plus} to="/admin/demandes?ajouter=1">
                  Ajouter une demande
               </Button>
            </div>
         </header>

         {brief && (
            <Note className="mb-6">
               <p className="max-w-[75ch] whitespace-pre-wrap text-[15px]">{brief}</p>
            </Note>
         )}

         <dl className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-[20px] border border-line bg-line lg:grid-cols-3 xl:grid-cols-5">
            <Figure label="Demandes" value={figures.leads.value} note={compare(figures.leads)} />
            <Figure label="Clics sur WhatsApp" value={figures.whatsapp.value} note={compare(figures.whatsapp)} />
            <Figure label="Visites du site" value={figures.visits.value} note={compare(figures.visits)} />
            <Figure label="Abonnés aux emails" value={figures.subscribers} note="Avec leur accord" />
            <Figure label="Devis en attente" value={figures.open.length} note={figures.openAmount || "Aucun montant en attente"} />
         </dl>

         <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1.5fr_1fr]">
            <div className="space-y-6">
               <Panel title="À faire" flush>
                  {tasks.length ? (
                     <ul className="pb-2">
                        {tasks.slice(0, 10).map(({ key, Icon, to, title, text, at }) => (
                           <li key={key} className="border-t border-line">
                              <Link to={to} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-ink-3/60 sm:px-6">
                                 <Icon size={19} strokeWidth={1.8} aria-hidden="true" className="flex-none text-brand-text" />
                                 <span className="min-w-0 flex-1">
                                    <span className="line-clamp-2 font-medium leading-snug">{title}</span>
                                    <span className="block truncate text-[14px] text-muted">{text}</span>
                                 </span>
                                 <span className="flex-none text-[13px] text-subtle">{ago(at)}</span>
                              </Link>
                           </li>
                        ))}
                     </ul>
                  ) : (
                     <p className="border-t border-line px-6 py-8 text-center text-muted">Rien en attente. Les nouvelles demandes, les réponses et les retards apparaissent ici.</p>
                  )}
               </Panel>

               <Panel title="Demandes par semaine" hint="Les 12 dernières semaines">
                  <Columns data={weeks} unit={["demande", "demandes"]} />
               </Panel>

               <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Panel title="Où en sont les demandes">
                     <Bars data={pipeline} empty="Aucune demande pour le moment." />
                  </Panel>
                  <Panel title="D'où viennent les contacts">
                     <Bars data={sources} empty="Aucun contact pour le moment." />
                  </Panel>
               </div>
            </div>

            <div className="space-y-6">
               <Panel title="Prochains rendez-vous" actions={<Button size="sm" to="/admin/rendez-vous">Agenda</Button>} flush>
                  {upcoming.length ? (
                     <ul className="pb-2">
                        {upcoming.slice(0, 5).map((meeting) => (
                           <li key={meeting.id} className="border-t border-line">
                              <Link to={`/admin/rendez-vous?ouvrir=${meeting.id}`} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-ink-3/60 sm:px-6">
                                 <span className="tabular w-14 flex-none text-[15px] font-semibold">{time(meeting.start)}</span>
                                 <span className="min-w-0 flex-1">
                                    <span className="block truncate font-medium">{meeting.name}</span>
                                    <span className="block truncate text-[14px] text-muted">{MODE_LABEL[meeting.mode]}</span>
                                 </span>
                                 <Badge tone={dayKey(meeting.start) === today ? "signal" : "mute"} dot={false}>
                                    {dayKey(meeting.start) === today ? "Aujourd'hui" : date(meeting.start, { weekday: "short", day: "numeric", month: "short" })}
                                 </Badge>
                              </Link>
                           </li>
                        ))}
                     </ul>
                  ) : (
                     <p className="border-t border-line px-6 py-8 text-center text-muted">Aucun rendez-vous prévu.</p>
                  )}
               </Panel>
               <Setup />
               {!services.ai.ready && <Note tone="warn">L&apos;assistant IA n&apos;est pas connecté : la clé GEMINI_API_KEY manque dans Netlify.</Note>}
            </div>
         </div>
      </>
   );
};

export default Home;
