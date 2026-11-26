import { useEffect, useState } from "react";
import { CalendarPlus, Download, Trash2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { api } from "./lib/api";
import { dateTime, dayKey, googleCalendarUrl, MEETING_STATUS, MODE_LABEL, whatsappUrl } from "./lib/format";
import { useAdmin } from "./lib/store";
import { Button, Confirm, Dialog, Field, Input, Note, Select, Textarea } from "./ui";

const OFFSET = "+01:00"; // heure du Bénin, toute l'année
const EMPTY = { name: "", email: "", phone: "", lang: "fr", title: "", mode: "whatsapp", link: "", place: "", topic: "", notes: "", duration: 30 };
const localTime = (value) => new Intl.DateTimeFormat("fr-FR", { timeZone: "Africa/Porto-Novo", hour: "2-digit", minute: "2-digit" }).format(new Date(value));

// Création et modification d'un rendez-vous. Le client n'est prévenu que si la case est cochée.
export const MeetingDialog = ({ open, onClose, initial, meeting }) => {
   const { run, put, drop, refresh, services, settings } = useAdmin();
   const [values, setValues] = useState(EMPTY);
   const [day, setDay] = useState(dayKey());
   const [hour, setHour] = useState("10:00");
   const [notify, setNotify] = useState(true);
   const [busy, setBusy] = useState(false);
   const [confirm, setConfirm] = useState(false);

   useEffect(() => {
      if (!open) return;
      const source = meeting || { ...EMPTY, duration: settings.booking.duration, ...initial };
      setValues({ ...EMPTY, ...source });
      setDay(source.start ? dayKey(source.start) : initial?.day || dayKey());
      setHour(source.start ? localTime(source.start) : "10:00");
      setNotify(!meeting);
      // Seulement à l'ouverture : la saisie en cours n'est jamais remplacée.
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [open]);

   const set = (field) => (e) => setValues((prev) => ({ ...prev, [field]: e.target.value }));
   const start = day && hour ? `${day}T${hour}:00${OFFSET}` : null;
   const canMail = Boolean(values.email) && services.mail.ready;

   const save = async () => {
      setBusy(true);
      const body = { ...values, start: new Date(start).toISOString(), duration: Number(values.duration) };
      const result = await run(
         () => (meeting ? api.patch(`rendez-vous/${meeting.id}`, { ...body, notifyClient: notify && canMail }) : api.post("rendez-vous", { ...body, invite: notify && canMail })),
         (done) => (done.emailed ? "Rendez-vous enregistré, invitation envoyée." : "Rendez-vous enregistré."),
      );
      setBusy(false);
      if (!result) return;
      put("meetings", result.meeting);
      refresh(true);
      onClose();
   };

   const setStatus = async (status) => {
      setBusy(true);
      const result = await run(() => api.patch(`rendez-vous/${meeting.id}`, { status, notifyClient: status === "cancelled" && notify && canMail }), "Rendez-vous mis à jour.");
      setBusy(false);
      if (!result) return;
      put("meetings", result.meeting);
      onClose();
   };

   return (
      <>
         <Dialog
            open={open}
            onClose={onClose}
            side
            title={meeting ? `Rendez-vous avec ${meeting.name}` : "Nouveau rendez-vous"}
            footer={
               <>
                  <Button onClick={onClose}>Fermer</Button>
                  <Button variant="primary" busy={busy} disabled={!values.name.trim() || !start} onClick={save}>
                     Enregistrer
                  </Button>
               </>
            }
         >
            <div className="space-y-5">
               {meeting && (
                  <div className="space-y-3">
                     <p className="text-[15px] text-muted">
                        {dateTime(meeting.start)} · {MEETING_STATUS[meeting.status].label}
                        {meeting.source === "site" ? " · pris depuis le site" : ""}
                        {meeting.cancelledBy === "client" ? " par le client" : ""}
                     </p>
                     <div className="flex flex-wrap gap-2">
                        {meeting.status === "confirmed" ? (
                           <>
                              <Button size="sm" onClick={() => setStatus("done")}>
                                 Marquer comme fait
                              </Button>
                              <Button size="sm" onClick={() => setStatus("noshow")}>
                                 Client absent
                              </Button>
                              <Button size="sm" variant="danger" onClick={() => setStatus("cancelled")}>
                                 Annuler le rendez-vous
                              </Button>
                           </>
                        ) : (
                           <Button size="sm" onClick={() => setStatus("confirmed")}>
                              Remettre à confirmé
                           </Button>
                        )}
                     </div>
                     <div className="flex flex-wrap gap-2 border-t border-line pt-3">
                        <Button size="sm" icon={CalendarPlus} href={googleCalendarUrl(meeting)}>
                           Google Agenda
                        </Button>
                        <Button size="sm" icon={Download} href={`/api/admin/rendez-vous/${meeting.id}/ics`}>
                           Fichier d&apos;agenda
                        </Button>
                        {meeting.phone && (
                           <Button size="sm" variant="whatsapp" icon={FaWhatsapp} href={whatsappUrl(meeting.phone)}>
                              WhatsApp
                           </Button>
                        )}
                     </div>
                  </div>
               )}
               <div className="grid grid-cols-2 gap-4 sm:grid-cols-[1.3fr_1fr_1fr]">
                  <Input label="Jour" type="date" value={day} onChange={(e) => setDay(e.target.value)} className="col-span-2 sm:col-span-1" />
                  <Input label="Heure du Bénin" type="time" value={hour} onChange={(e) => setHour(e.target.value)} />
                  <Select label="Durée" value={values.duration} onChange={set("duration")} options={[15, 30, 45, 60, 90, 120].concat([15, 30, 45, 60, 90, 120].includes(Number(values.duration)) ? [] : [values.duration]).map((n) => [n, `${n} min`])} />
               </div>
               <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Avec" value={values.name} onChange={set("name")} />
                  <Input label="Objet" value={values.title} onChange={set("title")} placeholder="Facultatif" />
                  <Input label="Email" type="email" inputMode="email" value={values.email} onChange={set("email")} />
                  <Input label="Téléphone / WhatsApp" type="tel" inputMode="tel" value={values.phone} onChange={set("phone")} />
                  <Select label="Comment" value={values.mode} onChange={set("mode")} options={Object.entries(MODE_LABEL)} />
                  <Select label="Langue" value={values.lang} onChange={set("lang")} options={[["fr", "Français"], ["en", "Anglais"]]} />
               </div>
               {values.mode === "video" && <Input label="Lien de la visio" type="url" inputMode="url" value={values.link} onChange={set("link")} placeholder="https://" hint={settings.booking.videoLink ? undefined : "Vous pouvez enregistrer un lien habituel dans Réglages > Rendez-vous."} />}
               {values.mode === "inperson" && <Input label="Adresse" value={values.place} onChange={set("place")} />}
               <Textarea label="Sujet" rows={2} value={values.topic} onChange={set("topic")} />
               <Textarea label="Notes internes" rows={3} value={values.notes} onChange={set("notes")} hint="Visibles seulement ici" />
               <Field label="Prévenir le client">
                  {(aria) => (
                     <label className="flex cursor-pointer items-start gap-3 text-[15px]">
                        <input {...aria} type="checkbox" checked={notify && canMail} disabled={!canMail} onChange={(e) => setNotify(e.target.checked)} className="mt-1 h-[18px] w-[18px] accent-brand" />
                        <span className={canMail ? "" : "text-muted"}>{meeting ? "Lui envoyer un email si l'horaire change ou si le rendez-vous est annulé" : "Lui envoyer une invitation par email"}</span>
                     </label>
                  )}
               </Field>
               {!canMail && <Note>{values.email ? "L'envoi d'emails n'est pas encore connecté (Réglages > Emails)." : "Sans adresse email, l'invitation ne peut pas être envoyée."}</Note>}
               {meeting && (
                  <div className="border-t border-line pt-4">
                     <Button variant="danger" size="sm" icon={Trash2} onClick={() => setConfirm(true)}>
                        Supprimer
                     </Button>
                  </div>
               )}
            </div>
         </Dialog>
         {meeting && (
            <Confirm
               open={confirm}
               onClose={() => setConfirm(false)}
               title="Supprimer ce rendez-vous ?"
               text="Il disparaît de l'agenda sans prévenir le client. Pour le prévenir, annulez-le plutôt."
               action="Supprimer"
               onConfirm={async () => {
                  if (await run(() => api.del(`rendez-vous/${meeting.id}`), "Rendez-vous supprimé.")) {
                     setConfirm(false);
                     onClose();
                     drop("meetings", meeting.id);
                  }
               }}
            />
         )}
      </>
   );
};
