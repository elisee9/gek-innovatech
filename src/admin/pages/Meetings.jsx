import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Copy, Plus, Settings } from "lucide-react";
import { addDays, date, dayKey, MEETING_STATUS, MODE_LABEL, plural, time } from "../lib/format";
import { useAdmin } from "../lib/store";
import { MeetingDialog } from "../MeetingDialog";
import { Badge, Button, IconButton, Note, PageHead, Panel } from "../ui";

const WEEKDAYS = ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."];
const monthStart = (key) => `${key.slice(0, 7)}-01`;
const shiftMonth = (key, n) => {
   const [year, month] = key.split("-").map(Number);
   return new Date(Date.UTC(year, month - 1 + n, 1)).toISOString().slice(0, 10);
};

const Meetings = () => {
   const { meetings, content, site, toast } = useAdmin();
   const [params, setParams] = useSearchParams();
   const [month, setMonth] = useState(monthStart(dayKey()));
   const [selected, setSelected] = useState(dayKey());
   const [editing, setEditing] = useState(null);
   const [adding, setAdding] = useState(false);
   const today = dayKey();

   useEffect(() => {
      const id = params.get("ouvrir");
      if (!id) return;
      const found = meetings.find((meeting) => meeting.id === id);
      if (found) {
         setEditing(found);
         setSelected(dayKey(found.start));
         setMonth(monthStart(dayKey(found.start)));
      }
      setParams({}, { replace: true });
   }, [params, meetings, setParams]);

   const byDay = useMemo(() => {
      const map = {};
      for (const meeting of [...meetings].sort((a, b) => a.start.localeCompare(b.start))) (map[dayKey(meeting.start)] ||= []).push(meeting);
      return map;
   }, [meetings]);

   const first = addDays(month, -((new Date(`${month}T12:00:00Z`).getUTCDay() + 6) % 7));
   const cells = Array.from({ length: 42 }, (_, i) => addDays(first, i));
   const weeks = cells.slice(35).every((key) => key.slice(0, 7) !== month.slice(0, 7)) ? 35 : 42;
   const dayList = byDay[selected] || [];
   const next = meetings.filter((meeting) => meeting.status === "confirmed" && meeting.start > new Date().toISOString()).sort((a, b) => a.start.localeCompare(b.start));
   const link = `${site}/rendez-vous`;

   const row = (meeting, withDay) => (
      <li key={meeting.id} className="border-t border-line first:border-t-0">
         <button type="button" onClick={() => setEditing(meeting)} className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-ink-3/60 sm:px-6">
            <span className="tabular w-14 flex-none font-semibold">{time(meeting.start)}</span>
            <span className="min-w-0 flex-1">
               <span className={`block truncate font-medium ${meeting.status === "cancelled" ? "line-through opacity-60" : ""}`}>{meeting.title || meeting.name}</span>
               <span className="block text-[14px] text-muted">
                  {withDay ? `${date(meeting.start, { weekday: "short", day: "numeric", month: "short" })} · ` : ""}
                  {MODE_LABEL[meeting.mode]}, {meeting.duration} min{meeting.title ? `, ${meeting.name}` : ""}
               </span>
            </span>
            <Badge tone={MEETING_STATUS[meeting.status].tone}>{MEETING_STATUS[meeting.status].label}</Badge>
         </button>
      </li>
   );

   return (
      <>
         <PageHead title="Rendez-vous" text={next.length ? `${plural(next.length, "rendez-vous", "rendez-vous")} à venir. Horaires à l'heure du Bénin.` : "Horaires à l'heure du Bénin."}>
            <Button icon={Settings} to="/admin/reglages?onglet=rendez-vous">
               Horaires
            </Button>
            <Button variant="primary" icon={Plus} onClick={() => setAdding(true)}>
               Nouveau rendez-vous
            </Button>
         </PageHead>

         {content.features.booking ? (
            <Note tone="ok" className="mb-6">
               <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="min-w-0 flex-1 basis-[220px]">
                     La prise de rendez-vous est ouverte : <span className="break-all font-medium">{link}</span>
                  </span>
                  <Button
                     size="sm"
                     icon={Copy}
                     onClick={async () => {
                        await navigator.clipboard.writeText(link).then(() => toast("Lien copié."), () => toast("Copie impossible : sélectionnez le lien.", "error"));
                     }}
                  >
                     Copier le lien
                  </Button>
               </div>
            </Note>
         ) : (
            <Note className="mb-6">La prise de rendez-vous sur le site est fermée. Vérifiez vos horaires dans Réglages, puis ouvrez-la.</Note>
         )}

         <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1.25fr_1fr]">
            <Panel
               title={<span className="inline-block first-letter:uppercase">{date(`${month}T12:00:00Z`, { month: "long", year: "numeric" })}</span>}
               actions={
                  <>
                     <Button
                        size="sm"
                        onClick={() => {
                           setMonth(monthStart(today));
                           setSelected(today);
                        }}
                     >
                        Aujourd&apos;hui
                     </Button>
                     <IconButton label="Mois précédent" icon={ChevronLeft} onClick={() => setMonth(shiftMonth(month, -1))} />
                     <IconButton label="Mois suivant" icon={ChevronRight} onClick={() => setMonth(shiftMonth(month, 1))} />
                  </>
               }
            >
               <div className="grid grid-cols-7 text-center text-[13px] text-subtle" aria-hidden="true">
                  {WEEKDAYS.map((name) => (
                     <span key={name} className="pb-2">
                        {name}
                     </span>
                  ))}
               </div>
               <div className="grid grid-cols-7 gap-1">
                  {cells.slice(0, weeks).map((key) => {
                     const list = (byDay[key] || []).filter((meeting) => meeting.status !== "cancelled");
                     const inMonth = key.slice(0, 7) === month.slice(0, 7);
                     return (
                        <button
                           key={key}
                           type="button"
                           aria-pressed={key === selected}
                           aria-label={`${date(`${key}T12:00:00Z`, { weekday: "long", day: "numeric", month: "long" })}, ${plural(list.length, "rendez-vous", "rendez-vous")}`}
                           onClick={() => setSelected(key)}
                           className={`flex min-h-[52px] flex-col items-center gap-1 rounded-xl py-2 transition-colors sm:min-h-[72px] ${key === selected ? "bg-fg text-ink-2" : "hover:bg-ink-3"} ${inMonth ? "" : "opacity-40"}`}
                        >
                           <span className={`tabular text-[15px] ${key === today && key !== selected ? "font-semibold text-signal" : ""} ${key === today ? "font-semibold" : ""}`}>{Number(key.slice(8))}</span>
                           {list.length > 0 && (
                              <span aria-hidden="true" className={`rounded-full px-2 text-[12px] font-medium ${key === selected ? "bg-ink-2/20" : "bg-info/10 text-info"}`}>
                                 {list.length}
                              </span>
                           )}
                        </button>
                     );
                  })}
               </div>
            </Panel>

            <div className="space-y-6">
               <Panel
                  title={<span className="inline-block first-letter:uppercase">{date(`${selected}T12:00:00Z`, { weekday: "long", day: "numeric", month: "long" })}</span>}
                  actions={
                     <Button size="sm" icon={Plus} onClick={() => setAdding(true)}>
                        Ajouter
                     </Button>
                  }
                  flush
               >
                  {dayList.length ? <ul className="border-t border-line pb-2">{dayList.map((meeting) => row(meeting, false))}</ul> : <p className="border-t border-line px-6 py-8 text-center text-muted">Rien ce jour-là.</p>}
               </Panel>
               {next.length > 0 && (
                  <Panel title="À venir" flush>
                     <ul className="border-t border-line pb-2">{next.slice(0, 8).map((meeting) => row(meeting, true))}</ul>
                  </Panel>
               )}
            </div>
         </div>

         <MeetingDialog open={adding} onClose={() => setAdding(false)} initial={{ day: selected }} />
         <MeetingDialog open={Boolean(editing)} onClose={() => setEditing(null)} meeting={editing} />
      </>
   );
};

export default Meetings;
