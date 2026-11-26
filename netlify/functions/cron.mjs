// Passage automatique toutes les 30 minutes : réponses reçues, relances, rappels, campagnes, brouillons, point du jour, sauvegarde.
import { aiReady, draftReply } from "../lib/ai.mjs";
import { runQueue, runReminders, runSequences } from "../lib/automations.mjs";
import { changeLead, leads } from "../lib/crm.mjs";
import { documents } from "../lib/documents.mjs";
import { inboxReady, syncInbox } from "../lib/inbox.mjs";
import { mailAddress, mailReady, sendMail } from "../lib/mail.mjs";
import { meetings, when } from "../lib/meetings.mjs";
import { settings } from "../lib/settings.mjs";
import { SKIP, keys, mutate, read, remove, write } from "../lib/store.mjs";
import { siteUrl } from "../lib/http.mjs";

const DAY = 24 * 3600_000;
const BACKUPS = 14;
const CHAT_DAYS = 90;
const SAVED = ["contenu", "demandes", "contacts", "rendez-vous", "documents", "sequences", "inscriptions", "campagnes", "reglages", "medias", "numeros"];

const safely = async (name, job) => {
   try {
      return await job();
   } catch (error) {
      console.error(`Passage automatique, ${name} :`, error.message);
      return null;
   }
};

// Une seule fois par jour, même si deux passages se croisent.
const oncePerDay = (name) =>
   mutate("systeme/passages", {}, (data) => {
      const today = new Date().toISOString().slice(0, 10);
      if (data[name] === today) return SKIP;
      data[name] = today;
      return true;
   });

// Prépare une réponse pour les demandes sans réponse : l'administrateur la trouve écrite, la relit et l'envoie.
const prepareDrafts = async (until) => {
   const { ai } = await settings();
   if (!ai.autoDraft || !aiReady()) return;
   const waiting = (await leads()).filter((lead) => lead.status === "new" && !lead.draft && !lead.archived && (lead.draftTries || 0) < 4 && Date.now() - Date.parse(lead.createdAt) < 3 * DAY);
   for (const lead of waiting.slice(0, 2)) {
      if (Date.now() > until - 9000) return;
      const channel = lead.email ? "email" : "whatsapp";
      const draft = await safely("brouillon", () => draftReply(lead, { channel }));
      await changeLead(lead.id, (item) => {
         item.draftTries = (item.draftTries || 0) + 1;
         if (draft && !item.draft) item.draft = { subject: draft.subject, text: draft.body, channel, ai: true };
      });
   }
};

const digest = async () => {
   const { notify } = await settings();
   const to = notify.email || mailAddress();
   if (!notify.digest || !mailReady() || !to) return;
   const [allLeads, allMeetings, allDocuments] = await Promise.all([leads(), meetings(), documents()]);
   const waiting = allLeads.filter((lead) => !lead.archived && (lead.status === "new" || lead.unread));
   const today = allMeetings.filter((meeting) => meeting.status === "confirmed" && Date.parse(meeting.start) > Date.now() && Date.parse(meeting.start) < Date.now() + DAY);
   const quotes = allDocuments.filter((document) => document.type === "quote" && document.status === "sent");
   if (!waiting.length && !today.length && !quotes.length) return;
   const lines = [
      waiting.length && `**Demandes à traiter : ${waiting.length}**\n${waiting.slice(0, 8).map((lead) => `- ${lead.name}${lead.company ? ` (${lead.company})` : ""}`).join("\n")}`,
      today.length && `**Rendez-vous dans les 24 heures : ${today.length}**\n${today.map((meeting) => `- ${meeting.name}, ${when(meeting, "fr")}`).join("\n")}`,
      quotes.length && `**Devis en attente de réponse : ${quotes.length}**\n${quotes.slice(0, 8).map((document) => `- ${document.number}, ${document.client.company || document.client.name}`).join("\n")}`,
      `Ouvrir le tableau de bord : ${siteUrl()}/admin`,
   ];
   await sendMail({ to, subject: "Votre point du jour", body: lines.filter(Boolean).join("\n\n"), kind: "notice", sign: false });
};

const backup = async () => {
   const data = Object.fromEntries(await Promise.all(SAVED.map(async (name) => [name, await read(name)])));
   await write(`sauvegardes/${new Date().toISOString().slice(0, 10)}`, data);
   const old = await keys("sauvegardes/");
   await Promise.all(old.slice(0, Math.max(0, old.length - BACKUPS)).map((key) => remove(key)));
};

// Les conversations du chat sont effacées après 90 jours (voir les mentions légales).
const cleanChats = async () => {
   const limit = new Date(Date.now() - CHAT_DAYS * DAY).toISOString().slice(0, 10);
   const old = (await keys("chats/")).filter((key) => key.slice("chats/".length, "chats/".length + 10) < limit);
   await Promise.all(old.map((key) => remove(key)));
};

export const run = async () => {
   // Netlify arrête un passage automatique au bout de 30 secondes.
   const until = Date.now() + 25_000;
   if (inboxReady()) await safely("relève", () => syncInbox({ until: Date.now() + 9000 }));
   await safely("rappels", () => runReminders({ until }));
   await safely("séquences", () => runSequences({ until }));
   await safely("campagnes", () => runQueue({ until: Math.min(until, Date.now() + 8000) }));
   // 6 h UTC : 7 h au Bénin.
   if (new Date().getUTCHours() >= 6 && (await oncePerDay("point"))) await safely("point du jour", digest);
   if (await oncePerDay("sauvegarde")) {
      await safely("sauvegarde", backup);
      await safely("conversations", cleanChats);
   }
   await safely("brouillons", () => prepareDrafts(until));
};

export default async () => {
   await run();
   return new Response("ok");
};

export const config = { schedule: "*/30 * * * *" };
