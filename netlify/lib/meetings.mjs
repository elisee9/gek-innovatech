// Rendez-vous : créneaux libres, réservation depuis le site, invitations d'agenda (.ics) et annulation par lien.
import { fullContent } from "./content.mjs";
import { upsertContact } from "./crm.mjs";
import { HttpError, cleanEmail, cleanLang, cleanLine, cleanPhone, cleanText, newId, newToken, siteUrl } from "./http.mjs";
import { mailAddress } from "./mail.mjs";
import { settings } from "./settings.mjs";
import { mutate, read } from "./store.mjs";

// Heure du Bénin (UTC+1 toute l'année, sans heure d'été) : les horaires des réglages s'y rapportent.
export const ZONE = "Africa/Porto-Novo";
const OFFSET = "+01:00";
const MINUTE = 60_000;

export const meetings = () => read("rendez-vous", []);

const localDay = (date) => new Intl.DateTimeFormat("en-CA", { timeZone: ZONE }).format(date);
const overlaps = (start, end, meeting, buffer) => {
   const from = Date.parse(meeting.start) - buffer;
   const to = Date.parse(meeting.start) + meeting.duration * MINUTE + buffer;
   return start < to && end > from;
};

const freeSlots = (booking, list, now = Date.now()) => {
   const earliest = now + booking.notice * 3600_000;
   const busy = list.filter((meeting) => meeting.status === "confirmed");
   const days = [];
   for (let i = 0; i <= booking.horizon; i += 1) {
      const day = localDay(new Date(now + i * 24 * 3600_000));
      if (booking.blocked.includes(day)) continue;
      const weekday = new Date(`${day}T12:00:00Z`).getUTCDay();
      const slots = [];
      for (const [from, to] of booking.days[weekday] || []) {
         let start = Date.parse(`${day}T${from}:00${OFFSET}`);
         const limit = Date.parse(`${day}T${to}:00${OFFSET}`);
         while (start + booking.duration * MINUTE <= limit) {
            const end = start + booking.duration * MINUTE;
            if (start >= earliest && !busy.some((meeting) => overlaps(start, end, meeting, booking.buffer * MINUTE))) slots.push(new Date(start).toISOString());
            start += booking.duration * MINUTE;
         }
      }
      if (slots.length) days.push({ day, slots });
   }
   return days;
};

export const bookingOpen = async () => Boolean((await fullContent()).features.booking);

export const publicSlots = async () => {
   if (!(await bookingOpen())) return { open: false, days: [] };
   const { booking } = await settings();
   return { open: true, duration: booking.duration, modes: booking.modes, days: freeSlots(booking, await meetings()) };
};

const MODES = ["whatsapp", "phone", "video", "inperson"];

const build = (input, source) => {
   const start = new Date(input.start);
   if (Number.isNaN(start.getTime())) throw new HttpError(400, "Date du rendez-vous invalide.");
   return {
      id: newId(),
      token: newToken(),
      title: cleanLine(input.title, 120),
      name: cleanLine(input.name, 100),
      email: cleanEmail(input.email),
      phone: cleanPhone(input.phone),
      lang: cleanLang(input.lang),
      start: start.toISOString(),
      duration: Math.max(10, Math.min(480, Math.round(Number(input.duration) || 30))),
      mode: MODES.includes(input.mode) ? input.mode : "whatsapp",
      link: /^https:\/\//.test(input.link || "") ? cleanLine(input.link, 300) : "",
      place: cleanLine(input.place, 200),
      topic: cleanText(input.topic, 1500),
      notes: cleanText(input.notes, 3000),
      leadId: cleanLine(input.leadId, 40),
      contactId: cleanLine(input.contactId, 40),
      status: "confirmed",
      source,
      reminded: [],
      createdAt: new Date().toISOString(),
   };
};

// Réservation depuis le site : le créneau est revérifié au moment d'écrire, deux visiteurs ne peuvent pas prendre le même.
export const book = async (input) => {
   const { booking } = await settings();
   if (!(await bookingOpen())) throw new HttpError(409, "La prise de rendez-vous en ligne est fermée.");
   const meeting = build({ ...input, duration: booking.duration, link: input.mode === "video" ? booking.videoLink : "" }, "site");
   if (meeting.name.length < 2 || !meeting.email) throw new HttpError(400, "Indiquez votre nom et une adresse email valide.");
   if (!booking.modes.includes(meeting.mode)) throw new HttpError(400, "Ce type de rendez-vous n'est pas proposé.");
   if (["whatsapp", "phone"].includes(meeting.mode) && meeting.phone.replace(/\D/g, "").length < 8) throw new HttpError(400, "Indiquez le numéro à appeler, avec l'indicatif du pays.");
   const contact = await upsertContact({ ...input, marketing: undefined }, "rendez-vous");
   meeting.contactId = contact?.id || "";
   await mutate("rendez-vous", [], (list) => {
      const free = freeSlots(booking, list).some(({ slots }) => slots.includes(meeting.start));
      if (!free) throw new HttpError(409, "Ce créneau vient d'être pris. Choisissez-en un autre.");
      list.push(meeting);
   });
   return meeting;
};

export const createMeeting = async (input) => {
   const meeting = build(input, "admin");
   if (!meeting.name) throw new HttpError(400, "Indiquez avec qui est le rendez-vous.");
   const contact = await upsertContact(input, "rendez-vous");
   meeting.contactId ||= contact?.id || "";
   await mutate("rendez-vous", [], (list) => {
      list.push(meeting);
   });
   return meeting;
};

export const updateMeeting = (id, patch) =>
   mutate("rendez-vous", [], (list) => {
      const meeting = list.find((item) => item.id === id);
      if (!meeting) throw new HttpError(404, "Rendez-vous introuvable.");
      if (patch.status !== undefined && ["confirmed", "done", "cancelled", "noshow"].includes(patch.status)) meeting.status = patch.status;
      const fields = ["title", "name", "email", "phone", "start", "duration", "mode", "link", "place", "topic", "notes", "lang"];
      if (fields.some((field) => patch[field] !== undefined)) {
         const next = build({ ...meeting, ...patch }, meeting.source);
         // Un nouvel horaire relance les rappels.
         if (next.start !== meeting.start) meeting.reminded = [];
         for (const field of fields) meeting[field] = next[field];
      }
      return structuredClone(meeting);
   });

export const removeMeeting = (id) =>
   mutate("rendez-vous", [], (list) => {
      const index = list.findIndex((item) => item.id === id);
      if (index >= 0) list.splice(index, 1);
   });

export const cancelByToken = (token) =>
   mutate("rendez-vous", [], (list) => {
      const meeting = list.find((item) => item.token === token);
      if (!meeting || meeting.status !== "confirmed" || Date.parse(meeting.start) < Date.now()) return null;
      meeting.status = "cancelled";
      meeting.cancelledBy = "client";
      return structuredClone(meeting);
   });

const WORDS = {
   fr: { whatsapp: "appel WhatsApp", phone: "appel téléphonique", video: "visioconférence", inperson: "sur place", title: "Rendez-vous avec GEK INNOVATECH", benin: "heure du Bénin" },
   en: { whatsapp: "WhatsApp call", phone: "phone call", video: "video call", inperson: "in person", title: "Meeting with GEK INNOVATECH", benin: "Benin time" },
};

export const when = (meeting, lang = meeting.lang) => {
   const text = new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "fr-FR", { timeZone: ZONE, weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(new Date(meeting.start));
   return `${text} (${(WORDS[lang] || WORDS.fr).benin})`;
};
export const how = (meeting, lang = meeting.lang) => {
   const words = WORDS[lang] || WORDS.fr;
   const where = meeting.mode === "video" ? meeting.link : meeting.mode === "inperson" ? meeting.place : meeting.phone;
   return where ? `${words[meeting.mode]} : ${where}` : words[meeting.mode];
};

const stamp = (date) => date.toISOString().replace(/[-:]|\.\d{3}/g, "");
const icsText = (value) => String(value || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
// Une ligne d'agenda ne dépasse pas 75 octets : le reste passe à la ligne suivante, décalé d'un espace.
const fold = (line) => {
   const out = [];
   let current = "";
   for (const char of line) {
      if (Buffer.byteLength(current + char) > 73) {
         out.push(current);
         current = ` ${char}`;
      } else current += char;
   }
   return [...out, current].join("\r\n");
};

export const ics = (meeting, cancelled = false) => {
   const start = new Date(meeting.start);
   const words = WORDS[meeting.lang] || WORDS.fr;
   return [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//GEK INNOVATECH//Rendez-vous//FR",
      "CALSCALE:GREGORIAN",
      `METHOD:${cancelled ? "CANCEL" : "PUBLISH"}`,
      "BEGIN:VEVENT",
      `UID:${meeting.id}@gek-innovatech`,
      `DTSTAMP:${stamp(new Date())}`,
      `DTSTART:${stamp(start)}`,
      `DTEND:${stamp(new Date(start.getTime() + meeting.duration * MINUTE))}`,
      `SUMMARY:${icsText(meeting.title || words.title)}`,
      `DESCRIPTION:${icsText([how(meeting), meeting.topic].filter(Boolean).join("\n"))}`,
      `LOCATION:${icsText(meeting.mode === "video" ? meeting.link : meeting.mode === "inperson" ? meeting.place : words[meeting.mode])}`,
      mailAddress() ? `ORGANIZER;CN=GEK INNOVATECH:mailto:${mailAddress()}` : "",
      `STATUS:${cancelled ? "CANCELLED" : "CONFIRMED"}`,
      "BEGIN:VALARM",
      "TRIGGER:-PT30M",
      "ACTION:DISPLAY",
      `DESCRIPTION:${icsText(meeting.title || words.title)}`,
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
   ]
      .filter(Boolean)
      .map(fold)
      .join("\r\n");
};

export const cancelUrl = (meeting, req) => `${siteUrl(req)}/api/rendez-vous/annuler?t=${meeting.token}`;

export const meetingEmail = (meeting, kind, req) => {
   const first = meeting.name.split(/\s+/)[0];
   const fr = meeting.lang !== "en";
   const details = fr ? `**${when(meeting)}**\nDurée : ${meeting.duration} minutes\n${how(meeting)}` : `**${when(meeting)}**\nDuration: ${meeting.duration} minutes\n${how(meeting)}`;
   const cancel = fr ? `Un empêchement ? Vous pouvez annuler ici : ${cancelUrl(meeting, req)}` : `Something came up? You can cancel here: ${cancelUrl(meeting, req)}`;
   const texts = {
      confirm: fr
         ? { subject: "Votre rendez-vous avec GEK INNOVATECH est confirmé", body: `Bonjour ${first},\n\nVotre rendez-vous est confirmé :\n\n${details}\n\nL'invitation jointe permet de l'ajouter à votre agenda.\n\n${cancel}` }
         : { subject: "Your meeting with GEK INNOVATECH is confirmed", body: `Hello ${first},\n\nYour meeting is confirmed:\n\n${details}\n\nUse the attached invitation to add it to your calendar.\n\n${cancel}` },
      reminder: fr
         ? { subject: `Rappel : rendez-vous ${when(meeting)}`, body: `Bonjour ${first},\n\nPour rappel, notre rendez-vous a lieu :\n\n${details}\n\n${cancel}` }
         : { subject: `Reminder: meeting on ${when(meeting)}`, body: `Hello ${first},\n\nA reminder that our meeting takes place:\n\n${details}\n\n${cancel}` },
      cancelled: fr
         ? { subject: "Votre rendez-vous avec GEK INNOVATECH est annulé", body: `Bonjour ${first},\n\nLe rendez-vous prévu ${when(meeting)} est annulé. Répondez à cet email pour convenir d'une autre date.` }
         : { subject: "Your meeting with GEK INNOVATECH is cancelled", body: `Hello ${first},\n\nThe meeting planned on ${when(meeting)} is cancelled. Reply to this email to arrange another date.` },
      moved: fr
         ? { subject: "Votre rendez-vous avec GEK INNOVATECH est modifié", body: `Bonjour ${first},\n\nVotre rendez-vous a changé. Voici les nouvelles informations :\n\n${details}\n\n${cancel}` }
         : { subject: "Your meeting with GEK INNOVATECH has changed", body: `Hello ${first},\n\nYour meeting has changed. Here are the new details:\n\n${details}\n\n${cancel}` },
   };
   return {
      to: meeting.email,
      toName: meeting.name,
      lang: meeting.lang,
      kind: "auto",
      ...texts[kind],
      ...(kind === "confirm" || kind === "moved" ? { attachments: [{ filename: "rendez-vous.ics", content: Buffer.from(ics(meeting)), contentType: "text/calendar" }] } : {}),
   };
};
